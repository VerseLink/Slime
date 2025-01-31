import { hono } from '@/hono';
import { getCookie } from 'hono/cookie';
import { AuthConst } from "../AuthConst";
import { HTTPException } from 'hono/http-exception';
import { JWTManager } from '@slime/jwt-kv';
import { DateTimeUtc, TimeSpan } from '@slime/util';
import { RefreshTokenResult } from '@/user';
import { AccessToken, RefreshToken } from '../RefreshToken';
import { setRequestTokenCookie } from '../setRequestTokenCookie';

export default hono().post('/', async (ctx) => {
	const oldRefreshToken = getCookie(ctx, AuthConst.CookieName.RefreshToken);
	if (!oldRefreshToken) {
		throw new HTTPException(403, { message: 'No refresh token present.' });
	}
    const tokenManager = new JWTManager(ctx.env.JWT_KEY_KV_STORE);
	const content = await tokenManager.verify<Partial<RefreshToken>>(oldRefreshToken);

	if (!content || !content.ref || !content.jti || !content.aud || !content.iss || !content.sub) {
		throw new HTTPException(403, { message: 'Invalid or expired refresh token.' });
	}
	const user = ctx.env.USER_DURABLE.get(ctx.env.USER_DURABLE.idFromName(content.sub));
	const result: RefreshTokenResult = await user.rotateRefreshToken(ctx.req.raw, content.jti, content.aud as string);
    // authentication failed
    if (!result.success) {
        throw new HTTPException(result.error.status, { message: result.error?.message });
    }
    const { jti, claims, exp, iat, staleRefreshToken } = result.result;
    const refresh_token = staleRefreshToken ? null : await tokenManager.sign<RefreshToken>({
        jti,
        iat,
        exp,
        iss: content.iss,
        sub: content.sub,
        ref: content.ref,
    });

    const expires_in = TimeSpan.fromSeconds(ctx.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS);
    const accessExpireAt = DateTimeUtc.now.add(expires_in);
    const access_token = await tokenManager.sign<AccessToken>({
        iss: content.iss,
        sub: content.sub,
        iat: DateTimeUtc.now.toUnixSeconds(),
        exp: accessExpireAt.toUnixSeconds(),
        claims
    });

    setRequestTokenCookie(ctx, {
        accessToken: {
            value: access_token,
            expires: accessExpireAt.toJsDate(),
        },
        refreshToken: !refresh_token ? null : {
            value: refresh_token,
            expires: DateTimeUtc.fromUnixSeconds(exp).toJsDate(),
        }
    });
    return ctx.json({ access_token, expires_in: expires_in.totalSeconds });
});