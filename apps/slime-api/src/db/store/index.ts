import { ReportCode } from '@slime/api-v1/request';
import { v7 } from 'uuid';

import { DurableObjectSqliteBase, fromSqlite } from '@slime/cf-sqlite';
import { StoreDb } from './schema';
import migrations from './.drizzle/migrations';

const sqlt = fromSqlite<StoreDb>();

export class StoreDurableObject extends DurableObjectSqliteBase {
	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
	}

	protected override get migrations() {
		return migrations;
	}

	async addCommunityCode(source: ReportCode, userId: string) {
		const { hostname, pathname, search } = new URL(source.reportedUrl);
		const isRedeemCode = source.type === 'redeem';
		const id = v7();
		const result = this.sql.execute(
			sqlt.insertInto('CommunityCoupon').values({
				entryId: id,
				type: source.type,
				userId: userId,
				urlPath: pathname + search,
				hostname: hostname,
				code: source.code,
				metadata: isRedeemCode || source.metadata == null ? null : JSON.stringify(source.metadata),
				description: isRedeemCode
					? JSON.stringify(source.redeemItems)
					: source.description == null
						? null
						: JSON.stringify(source.description),
				conditions: source.coditions,
				reportedAt: Date.now(),
				expireAt: source.expireAt ?? null,
			}),
		);
		console.log('Inserted new coupon to database', { rowsWritten: result.rowsWritten, source, user: userId });
		return id;
	}

	async addVerifiedCode() {}

	// 更新官方的優惠碼
	// 因為社群回報的優惠碼是 "回報" 我們不打算讓他們更動
	async updateVerifiedCode() {}

	// 回報使用者使用了一個Community Code
	async usedCommunityCode() {}

	// 回報使用者使用了一個Verified Code
	async useVerifiedCode() {}

	async removeCodeById(id: string) {
		// no need for transaction
		// because it exists in either on of the table
		const community = this.sql.execute(sqlt.deleteFrom('CommunityCoupon').where('entryId', '=', id));
		if (community.rowsWritten > 0) {
			console.log("Deleted 'community' coupon from database", { source: 'community', id });
			return { source: 'community' };
		}
		const verified = this.sql.execute(sqlt.deleteFrom('CommunityCoupon').where('entryId', '=', id));
		if (verified.rowsWritten > 0) {
			console.log("Deleted 'verified' coupon from database", { source: 'verified', id });
			return { source: 'verified' };
		}
		return null;
	}

	async getCommunityCode(options?: { matchHostname?: string; expired?: boolean; limit?: number }) {
		let query = sqlt.selectFrom('CommunityCoupon').selectAll();

		if (options?.matchHostname != null) {
			query = query.where('hostname', '=', options?.matchHostname);
		}

		// 過濾過期的
		if (!options?.expired) {
			query = query.where((eq) =>
				eq.or([
					eq('expireAt', 'is', null), // 以後可能要限制一下太久沒人用的兌換碼要過濾掉
					eq('expireAt', '>', Date.now()),
				]),
			);
		}

		if (options?.limit != null) {
			query = query.limit(options?.limit);
		}

		// 我們要確保最新的資料在最前面
		query = query.orderBy('entryId desc');

		return this.sql.execute(query).toArray();
	}

	async getAllCode() {
		const verified = this.sql.execute(
			sqlt
				.selectFrom('VerifiedCoupon')
				.selectAll()
				.where((eq) =>
					eq.or([
						eq('expireAt', 'is', null), // 以後可能要限制一下太久沒人用的兌換碼要過濾掉
						eq('expireAt', '>', Date.now()),
					]),
				),
		);
		const community = this.sql.execute(
			sqlt
				.selectFrom('CommunityCoupon')
				.selectAll()
				.where((eq) =>
					eq.or([
						eq('expireAt', 'is', null), // 以後可能要限制一下太久沒人用的兌換碼要過濾掉
						eq('expireAt', '>', Date.now()),
					]),
				),
		);

		return {
			verified: verified.toArray(),
			community: community.toArray(),
		};
	}
}

export const UnknownStoreId = 'unknown';
