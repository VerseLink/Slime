import { UserDoSqliteDB, jwtId } from './schema';
import { Buffer } from 'node:buffer';
import { DateTimeUtc } from '@slime/util';
import { DurableObject } from 'cloudflare:workers';
import { DurableObjectSqliteBase, DurableSqliteQuery, fromSqlite } from '@slime/cf-sqlite';
import migrations from './.drizzle/migrations';
import { ContentfulStatusCode, StatusCode } from 'hono/utils/http-status';
import { HTTPException } from 'hono/http-exception';

const sqlt = fromSqlite<UserDoSqliteDB>();

type Claims = Record<string, Rpc.Serializable<unknown>>;

export type RefreshTokenResult =
	| {
			success: true;
			result: {
				jti: string;
				exp: number;
				iat: number;
				/**
				 * 是否有頒發新的 Refresh Token
				 */
				staleRefreshToken: boolean;
				claims: Record<string, Rpc.Serializable<unknown>>;
			};
	  }
	| {
			success: false;
			error: {
				status: ContentfulStatusCode;
				message: string;
			};
	  };

export class UserDurableObject extends DurableObject<Env> {

	private sql = new DurableSqliteQuery(this.ctx.storage, migrations);

	private getNewestTokenGeneratedFromJti(jti: string) {
		const fromToken = this.sql
			.execute(sqlt.selectFrom('JwtId').selectAll().where('fromJti', '=', jti))
			.firstOrDefault();
		if (!fromToken) {
			return null;
		}
		// 我們偵測到 JTI 已經被重複使用!
		// 確認一下重複使用的時間是不是超出我們允許的範圍了
		// 如果是的話，表示 JWT 被盜用，直接強制使用這個JTI的所有使用者登出!
		if (
			DateTimeUtc.now.toUnixSeconds() - fromToken.issuedAt >
			this.env.REFRESH_TOKEN_JTI_TIME_SLEW_SECONDS
		) {
			this.sql.execute(sqlt.deleteFrom('JwtId').where('initJti', '=', fromToken.initJti));
			throw new HTTPException(403, { message: 'A refresh token cannot be reused' });
		}
		// 如果允許的話直接回傳我們現在這個已經頒發的新JTI
		const newestToken = this.sql
			.execute(
				sqlt
					.selectFrom('JwtId')
					.selectAll()
					.where('initJti', '=', fromToken.initJti)
					.orderBy('expiresAt desc')
					.limit(1),
			)
			.single();
		return {
			jti: newestToken.jti,
			exp: newestToken.expiresAt,
			iat: newestToken.issuedAt,
			staleRefreshToken: false,
		};
	}

	private rotateRefreshTokenInternal(originalRequest: Request, originalJti: string) {
		// 先偵測這個JTI 是不是拿去生成新的JTI 了
		const newestToken = this.getNewestTokenGeneratedFromJti(originalJti);
		if (newestToken) {
			return newestToken;
		}

		// 這個 JTI 從沒用來頒發新的 JTI
		// 那檢查 JTI 是不是合法的 JTI (過期的 JTI 會被移除)
		const token = this.sql
			.execute(sqlt.selectFrom('JwtId').selectAll().where('jti', '=', originalJti).limit(1))
			.singleOrNull();

		// 非法的 JTI，很有可能是過期了
		if (!token) {
			throw new HTTPException(403, {
				message: 'The refresh token either expired or is invalid',
			});
		}
		if (DateTimeUtc.now.toUnixSeconds() > token.expiresAt) {
			this.sql.execute(sqlt.deleteFrom('JwtId').where('jti', '=', token.jti));
			throw new HTTPException(403, {
				message: 'The refresh token either expired or is invalid',
			});
		}
		// 合法的 JTI 且從來沒有頒發過新的 JTI
		// 但是離上次頒發新的JTI 時間太近了，於是我們回傳原本的JTI
		if (
			token.issuedAt + this.env.REFRESH_TOKEN_ISSUE_AFTER_SECONDS <
			DateTimeUtc.now.toUnixSeconds()
		) {
			return {
				jti: token.jti,
				exp: token.expiresAt,
				iat: token.issuedAt,
				staleRefreshToken: true,
			};
		}
		// 合法的 JTI 且從來沒有頒發過新的 JTI，且夠長間隔了，頒發新的JTI 給他
		return this.issueRefreshTokenInternal(originalRequest, {
			fromJti: originalJti,
			initJti: token.initJti,
		});
	}

	private cleanExpiredToken() {
		this.sql.execute(
			sqlt.deleteFrom('JwtId').where('expiresAt', '>', DateTimeUtc.now.toUnixSeconds()),
		);
	}

	async rotateRefreshToken(
		originalRequest: Request,
		originalJti: string,
		service: string,
	): Promise<RefreshTokenResult> {
		this.sql.migrateToLatest();
		try {
			return this.sql.transactionSync(() => {
				this.cleanExpiredToken();
				const result = this.rotateRefreshTokenInternal(originalRequest, originalJti);
				return {
					success: true,
					result: {
						...result,
						claims: this.getClaims(service),
					},
				};
			});
		} catch (error) {
			if (error instanceof HTTPException) {
				return { success: false, error: { status: error.status, message: error.message } };
			}
			console.error(error);
			throw error;
		}
	}

	private issueRefreshTokenInternal(request: Request, from?: { fromJti: string; initJti: string }) {
		const random = new Uint8Array(32);
		crypto.getRandomValues(random);
		const jti = Buffer.from(random).toString('base64url');
		const exp = DateTimeUtc.now
			.addSeconds(this.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS)
			.toUnixSeconds();
		const iat = DateTimeUtc.now.toUnixSeconds();
		this.sql.execute(
			sqlt.insertInto('JwtId').values({
				jti,
				initJti: from?.initJti ?? jti,
				fromJti: from?.fromJti ?? null,
				issuedAt: iat,
				expiresAt: exp,
				metadata:
					request?.cf == null
						? null
						: JSON.stringify({
								latitude: request.cf.latitude,
								longtitude: request.cf.longitude,
								regionCode: request.cf.regionCode,
								ip: request.headers.get('CF-Connecting-IP') ?? null,
								asn: request.cf.asn,
								asOrganization: request.cf.asOrganization,
								userAgent: request.headers.get('User-Agent'),
								country: request.cf.country,
								continent: request.cf.continent,
								city: request.cf.city,
							}),
			}),
		);
		return { jti, exp, iat, staleRefreshToken: false };
	}

	issueRefreshToken(service: string, request: Request) {
		this.sql.migrateToLatest();
		return this.sql.transactionSync(() => {
			this.cleanExpiredToken();
			const result = this.issueRefreshTokenInternal(request);
			return { ...result, claims: this.getClaims(service) };
		});
	}

	getClaims(service: string) {
		this.sql.migrateToLatest();
		const claims =
			this.sql
				.execute(
					sqlt.selectFrom('ServiceClaims').select('claims').where('service', '=', service).limit(1),
				)
				.singleOrNull()?.claims ?? null;
		if (claims == null) return {};
		return JSON.parse(claims) as Claims;
	}

	updateClaims(service: string, claims: Claims | ((source: Claims) => Promise<Claims>)) {
		this.sql.migrateToLatest();
		return this.sql.transaction(async () => {
			if (typeof claims === 'function') {
				let prevClaims = this.getClaims(service);
				claims = await claims(prevClaims);
			}
			return this.sql.execute(
				sqlt.insertInto('ServiceClaims').values({ service, claims: JSON.stringify(claims) }),
			);
		});
	}
}
