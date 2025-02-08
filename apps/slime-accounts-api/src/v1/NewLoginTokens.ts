import { HonoInterface } from '@/hono';
import { JWTManager } from '@slime/jwt-kv';
import { TimeSpan, DateTimeUtc } from '@slime/util';
import { Context } from 'hono';
import { RefreshToken, AccessToken, JWTNamespaceValue } from './RefreshToken';
import { TokenDetails } from './setRequestTokenCookie';

type LoginInformation = {
	userId: string;
	loginFor?: keyof JWTNamespaceValue;
};

export async function newLoginTokens(
	ctx: Context<HonoInterface>,
	{ userId,  loginFor }: LoginInformation,
): Promise<TokenDetails> {
	loginFor ??= "useslime.com";
	const iss = new URL(ctx.req.url).hostname;

	const user = ctx.env.USER_DURABLE.get(ctx.env.USER_DURABLE.idFromName(userId));
	const { jti, claims, exp, iat } = await user.issueRefreshToken(loginFor, new Request(ctx.req.raw, { body: null }));

	const tokenManager = new JWTManager(ctx.env.JWT_KEY_KV_STORE);
	const refresh_token = await tokenManager.sign<RefreshToken>({
		jti,
		iss,
		exp,
		iat,
		sub: userId,
	});

	const expires_in = TimeSpan.fromSeconds(ctx.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS);
	const accessExpireAt = DateTimeUtc.now.add(expires_in);
	const access_token = await tokenManager.sign<AccessToken>({
		iss,
		iat,
		sub: userId,
		aud: loginFor,
		exp: accessExpireAt.toUnixSeconds(),
		[loginFor]: claims as any,
	});

	return {
		accessToken: {
			value: access_token,
			expires: accessExpireAt.toJsDate(),
		},
		refreshToken: {
			value: refresh_token,
			expires: DateTimeUtc.fromUnixSeconds(exp).toJsDate()
		}
	};
}

