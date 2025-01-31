import { hono } from '@/api/hono';
import { apiQueryFormatter } from './middleware/responseFormatter';

import { router as activity } from './activity';
import { router as code } from './code';
import { router as stores } from './stores';
import { Context } from 'hono';
import { useOpenIdAuthentication } from '../../../../slime-accounts-api/src/v1/useAuthentication';
import { OpenIdServerDefaults } from '@/auth/openid/google';
import { D1Query } from '@/db/query';
import { sqlt } from '@/db/slime-d1/SlimeDb';
import { JWTManager } from '../../../../../packages/cf-sqlite/src';
import { DateTimeUtc } from '@slime/util';

const router = hono();

router.use(apiQueryFormatter);

// TODO 以後把這段程式碼移到新的伺服器 API 並實現 OAuth 伺服器
useOpenIdAuthentication(router, {
	basePath: '/oauth',
	providers: {
		google: {
			config: OpenIdServerDefaults.google,
			scopes: ['openid', 'profile', 'email'],
			getClientData: (env) => ({
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			}),
		},
		paypal: {
			config: 'https://www.paypalobjects.com/.well-known/openid-configuration',
			scopes: ['openid', 'profile', 'email'],
			getClientData: (env) => ({
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			}),
		},
	},
	onAuthenticated: async (ctx, from, token) => {
		const result = await new D1Query(ctx.env.SLIME_DB).execute(
			sqlt
				.selectFrom('UserOAuth')
				.where('issuer', '=', token.iss)
				.where('issueId', '=', token.sub)
				.innerJoin('UserDurableObjectMapping', (join) => join.onRef('UserOAuth.userId', '=', 'UserDurableObjectMapping.userId'))
				.select(['UserOAuth.userId', 'UserDurableObjectMapping.durableObjectId'])
				.limit(1),
		);
		if (result.results.length > 0) {
			const { userId, durableObjectId } = result.results[0];
			const user = ctx.env.USER_DURABLE.get(ctx.env.USER_DURABLE.idFromString(durableObjectId));
			const tokenManager = new JWTManager(ctx.env.JWT_KEY_KV_STORE);
            const { jti } = await user.issueRefreshToken(ctx.req.raw);
			return success(ctx, {
				access_token: await user.issueAccessToken(),
				refresh_token: ,
			});
			// return issueLoginToken();
		}
		const registerToken = await new JWTManager(ctx.env.JWT_KEY_KV_STORE).sign({
			iss: 'https://account.useslime.com/',
			iat: DateTimeUtc.now.toUnixSeconds(),
			exp: DateTimeUtc.now.addSeconds(30).toUnixSeconds(), // we want the register to expire in 30s
			aud: 'register', // for registering new account only
			openid_token: token,
		});
		return success(ctx, { registerToken });
	},
});

router.route('/activity', activity);
router.route('/stores', stores);
router.route('/report', code);

export default router;

export const success = <T>(context: Context, item: T) => {
	return context.json({
		success: true,
		result: item,
	});
};
