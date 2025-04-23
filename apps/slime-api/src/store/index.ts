import { v7 } from 'uuid';

import { DurableObjectSqliteBase, fromSqlite } from '@slime/cf-sqlite';
import { StoreDb } from './schema';
import migrations from './.drizzle/migrations';
import { AddCoupon, UserCheckout, CouponQueryResult, ReportCouponAbuse, PartialContent } from './coupon';
import { DateTimeUtc } from '@slime/util';
import { User } from '../user';
import { storePermission } from './permission';
import { ColumnType } from 'kysely';

const sqlt = fromSqlite<StoreDb>();

type DbType<T> = {
	[P in keyof T]: T[P] extends ColumnType<infer A, any, any> ? A : never;
};

export interface StoreMetadata {
	scriptUrl?: string;
}

export class StoreDurableObject extends DurableObjectSqliteBase<Env> {
	constructor(state: DurableObjectState, env: Env) {
		super(state, env);
	}

	protected override get migrations() {
		return migrations;
	}

	private async getUserHash(user: User) {
		return (user.hash ??= await this.env.USER_DURABLE.get(this.env.USER_DURABLE.idFromName(user.id)).getIdHash());
	}

	private addUserAsInteracted(user: User) {
		this.sql.execute(
			sqlt
				.insertInto('InteractedUser')
				.values({
					userId: user.id,
					type: user.roles.length === 0 ? 'guest' : 'user',
				})
				.onConflict((e) => e.doNothing()),
		);
	}

	private getCouponInternal(coupon: DbType<StoreDb['Coupon']>): CouponQueryResult {
		const entryId = coupon.entryId;
		const lastSuccessUsed = this.sql
			.execute(
				sqlt
					.selectFrom('CouponAppliedByUser')
					.orderBy('id desc')
					.innerJoin('CheckoutUser', 'CheckoutUser.id', 'CouponAppliedByUser.checkoutId')
					.select([
						'CheckoutUser.currency as currency',
						'CouponAppliedByUser.savedAmount as savedAmount',
						'CheckoutUser.checkoutAt as usedAt',
					])
					.where('CouponAppliedByUser.entryId', '=', entryId)
					.where('CouponAppliedByUser.elected', '=', true)
					.limit(1),
			)
			.singleOrNull();

		// consider caching this?
		// prettier-ignore
		const { total_used, success_count } = this.sql
			.execute<Record<string, number>>(
				sqlt.selectFrom('CouponAppliedByUser')
					.orderBy('id desc')
					.leftJoin('CheckoutUser', 'CheckoutUser.id', 'CouponAppliedByUser.checkoutId')
					.where('CouponAppliedByUser.entryId', '=', entryId)
					.select(sqlt.fn.count('CheckoutUser.id').as('total_used'))
					.select(sqlt.fn.count('CouponAppliedByUser.id').as('success_count'))
			)
			.single();

		const { total_rating, likes } = this.sql
			.execute<Record<string, number>>(
				sqlt
					.selectFrom('CouponUserRating')
					.where('entryId', '=', entryId)
					.select(sqlt.fn.countAll().as('total_rating'))
					.select(sqlt.fn.sum((ex) => ex.case().when('rating', '=', 1).then(1).else(0).end()).as('likes')),
			)
			.single();

		// consider not returning the coupon if there's too much reported coupon abuse

		return {
			id: entryId,
			type: coupon.type,
			source: coupon.source,
			reviewed: coupon.reviewed,
			code: coupon.code,

			metadata: coupon.metadata ? JSON.parse(coupon.metadata) : undefined,
			description: coupon.description ?? undefined,
			restrictions: coupon.restrictions ?? undefined,
			createdAt: coupon.createdAt,
			expireAt: coupon.expireAt ?? undefined,

			rating: {
				total: total_rating,
				likes: likes,
			},

			usage: {
				total: total_used,
				successCount: success_count,
				lastSaved: !lastSuccessUsed
					? undefined
					: {
							usedAt: lastSuccessUsed.usedAt,
							amount: lastSuccessUsed.savedAmount,
							currency: lastSuccessUsed.currency ?? undefined,
						},
			},
		} satisfies CouponQueryResult;
	}

	async getMetadata() {
		return await this.ctx.storage.get<StoreMetadata>('metadata');
	}

	async setMetadata(metadata: StoreMetadata) {
		await this.ctx.storage.put('metadata', metadata);
	}

	async addCoupon(user: User, report: AddCoupon) {
		const { hostname, pathname, search } = new URL(report.reportedUrl);
		const id = v7();
		const canWriteVerified = storePermission.withUser(user).can('write-verified');
		this.sql.transactionSync(() => {
			this.addUserAsInteracted(user);
			this.sql.execute(
				sqlt.insertInto('Coupon').values({
					entryId: id,
					type: report.type,
					source: !canWriteVerified ? 'community' : 'verified',
					reviewed: !canWriteVerified ? 'none' : 'approved',
					code: report.code,
					metadata: JSON.stringify(report.metadata),
					description: report.description,
					restrictions: report.restrictions,
					createdAt: DateTimeUtc.now.toUnixMilliseconds(),
					expireAt: report.expireAt ?? null,
				}),
			);
			this.sql.execute(
				sqlt.insertInto('CouponDiscoveredByUser').values({
					id: v7(),
					entryId: id,
					userId: user.id,
					urlPath: pathname + search,
					hostname: hostname,
					updatedAt: DateTimeUtc.now.toUnixMilliseconds(),
				}),
			);
		});
		return id;
	}

	// 更新優惠碼
	async updateCoupon(user: User) {}

	async auditCoupon(user?: User) {}

	async checkout(user: User, checkout: UserCheckout) {
		const hash = user.hash ?? (await this.getUserHash(user));
		this.sql.transactionSync(() => {
			const checkoutId = v7();
			this.sql.execute(
				sqlt.insertInto('CheckoutUser').values({
					id: checkoutId,
					userIdHash: hash,
					checkoutAt: DateTimeUtc.now.toUnixMilliseconds(),
					currency: checkout.currency,
					totalAmount: checkout.totalAmount,
				}),
			);
			for (let usage of checkout.appliedCoupons) {
				this.sql.execute(
					sqlt.insertInto('CouponAppliedByUser').values({
						id: v7(),
						checkoutId,
						entryId: usage.entryId,
						savedAmount: usage.savedAmount,
						elected: usage.elected,
					}),
				);
			}
		});
	}

	async addVisitor(user: User) {
		// check if the durable object actually exists before writing vistor data
		if (!this.exists()) return;
		// add user to the visitor log
		const userHash =
			user.hash ?? (await this.env.USER_DURABLE.get(this.env.USER_DURABLE.idFromName(user.id)).getIdHash());
		throw new Error('Not Implemented');
	}

	removeCoupon(id: string) {
		this.sql.execute(sqlt.deleteFrom('Coupon').where('entryId', '=', id));
	}

	getCoupons(options?: { expired?: boolean; limit?: number; cursor?: string }): PartialContent<CouponQueryResult> {
		let query = sqlt.selectFrom('Coupon').selectAll().orderBy('entryId desc');

		if (options?.cursor) {
			query = query.where('entryId', '<=', options.cursor);
		}

		if (!options?.expired) {
			query = query.where((eq) =>
				eq.or([
					eq('expireAt', 'is', null), // 以後可能要限制一下太久沒人用的兌換碼要過濾掉
					eq('expireAt', '>', Date.now()),
				]),
			);
		}

		if (options?.limit != null) {
			query = query.limit(options?.limit + 1);
		}

		const coupons = this.sql.transactionSync(() => {
			return this.sql
				.execute(query)
				.toArray();
		});

		return {
			cursor: options?.limit == null ? undefined : coupons.length > options.limit ? coupons.at(-1)?.entryId : undefined,
			content: coupons.slice(0, -1).map((coupon) => this.getCouponInternal(coupon)),
		};
	}

	getCoupon(entryId: string): CouponQueryResult {
		return this.sql.transactionSync(() => {
			const coupon = this.sql.execute(sqlt.selectFrom('Coupon').selectAll().where('entryId', '=', entryId)).single();
			return this.getCouponInternal(coupon);
		});
	}

	reportAbuse(user: User, report: ReportCouponAbuse) {
		this.sql.execute(
			sqlt.insertInto('ReportCouponAbuse').values({
				id: v7(),
				entryId: report.entryId,
				userId: user.id,
				category: report.category,
				reason: report.reason,
			}),
		);
	}

	// Remove all user's activity on this store
	async deleteUser(user: User) {
		this.sql.execute(sqlt.deleteFrom('InteractedUser').where('userId', '=', user.id));
	}
}
