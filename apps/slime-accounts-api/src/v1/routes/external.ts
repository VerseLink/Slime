import { OpenIdServerDefaults } from '@/auth/openid/google';
import { JWTManager } from '@slime/jwt-kv';
import { useOpenIdAuthentication } from '../useAuthentication';
import { DateTimeUtc } from '@slime/util';
import { hono } from '@/hono';
import { D1Query, fromSqlite } from '@slime/cf-sqlite';
import { Database } from '@/db/schema';
import { getCookie, setCookie } from 'hono/cookie';
import { newLoginTokens } from '../NewLoginTokens';
import { setRequestTokenCookie } from '../setRequestTokenCookie';
import { RegisterToken } from '../RefreshToken';
import { AuthConst } from "../AuthConst";
import { redirectFrontend } from '../redirect';

const sqlt = fromSqlite<Database>();

export default useOpenIdAuthentication(hono(), {
	basePath: '',
	providers: {
		google: {
			config: OpenIdServerDefaults.google,
			scopes: ['openid', 'profile', 'email'],
			getClientData: (env) => ({
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			}),
		},
		/*
		paypal: {
			config: 'https://www.paypalobjects.com/.well-known/openid-configuration',
			scopes: ['openid', 'profile', 'email'],
			getClientData: (env) => ({
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			}),
		},
		*/
	},
	onAuthenticated: async (ctx, from, token, state) => {
		const result = await new D1Query(ctx.env.USER_AUTH).execute(
			sqlt
				.selectFrom('UserOAuth')
				.where('issuer', '=', token.iss)
				.where('issuedId', '=', token.sub)
				.select('userId')
				.limit(1),
		);

		// User is registered
		if (result.results.length > 0) {
			const { userId } = result.results[0];
			console.log(getCookie(ctx, AuthConst.CookieName.RefreshToken) ?? "No Token");
			const tokens = await newLoginTokens(ctx, { userId });
			setRequestTokenCookie(ctx, tokens);
			return redirectFrontend(ctx, "/complete");
		}

		// User is not located in our database!
		const jwt = new JWTManager(ctx.env.JWT_KEY_KV_STORE);
		const expiresAt = DateTimeUtc.now.addSeconds(30);
		const registerToken = await jwt.sign<RegisterToken>({
			iss: new URL(ctx.req.url).hostname,
			iat: DateTimeUtc.now.toUnixSeconds(),
			exp: expiresAt.toUnixSeconds(), // we want the register to expire in 30s
			aud: 'register', // for registering new account only
			openid_token: token,
		});

		setCookie(ctx, AuthConst.CookieName.RegisterToken, registerToken, {
			sameSite: 'strict',
			path: AuthConst.Path.Register,
			secure: ctx.env.ENVIRONMENT !== 'dev',
			httpOnly: true,
			expires: expiresAt.toJsDate(),
		});

		setCookie(
			ctx,
			AuthConst.CookieName.InfoSignUpDetails,
			JSON.stringify({ email: token.email, isEU: ctx.req.raw.cf?.isEUCountry === '1' }),
			{
				sameSite: 'strict',
				path: '/',
				secure: ctx.env.ENVIRONMENT !== 'dev',
			},
		);

		return redirectFrontend(ctx, "/signup");
	},
});
