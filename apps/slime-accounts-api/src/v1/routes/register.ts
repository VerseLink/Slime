import { hono } from '@/hono';
import { newLoginTokens } from '../NewLoginTokens';
import { deleteCookie, getCookie } from 'hono/cookie';
import { AuthConst } from "../AuthConst";
import { HTTPException } from 'hono/http-exception';
import { v7 as uuidV7 } from 'uuid';
import { D1Query, fromSqlite } from '@slime/cf-sqlite';
import { Database } from '@/db/schema';
import { JWTManager } from '@slime/jwt-kv';
import { RegisterToken } from '../RefreshToken';
import { setRequestTokenCookie } from '../setRequestTokenCookie';

const sqlt = fromSqlite<Database>();

export default hono().post('/', async (ctx) => {
	// External provider path
	const cookie = getCookie(ctx, AuthConst.CookieName.RegisterToken);
	deleteCookie(ctx, AuthConst.CookieName.RegisterToken);
	deleteCookie(ctx, AuthConst.CookieName.InfoSignUpDetails);
	if (!cookie) {
		throw new HTTPException(400, { message: 'Invalid cookie arguments' });
	}

	const form = await ctx.req.json<{
		agreeToMail?: boolean;
		[AuthConst.CookieName.CSRFToken]: string;
	}>();

	// Check for CSRF token
	const csrf = getCookie(ctx, AuthConst.CookieName.CSRFToken);
	if (!csrf || form[AuthConst.CookieName.CSRFToken] !== csrf) {
		throw new HTTPException(400, { message: 'CSRF Token mismatch' });
	}

	const tokenData = await new JWTManager(ctx.env.JWT_KEY_KV_STORE).verify<RegisterToken>(cookie);
	if (!tokenData || !tokenData.openid_token || tokenData.aud !== 'register') {
		throw new HTTPException(403, { message: 'JWT used for registeration expired or invalid' });
	}

	const userId = uuidV7();

	await new D1Query(ctx.env.USER_AUTH).batch([
		sqlt.insertInto('UserId').values({
			userId,
		}),
		sqlt.insertInto('UserOAuth').values({
			userId,
			issuer: tokenData.openid_token.iss,
			issuedId: tokenData.openid_token.sub,
		}),
	]);

	const token = await newLoginTokens(ctx, { userId });
	setRequestTokenCookie(ctx, token);
	return ctx.json({
		access_token: token.accessToken,
		expires_at: token.accessToken.expires.getTime(),
	});
});
