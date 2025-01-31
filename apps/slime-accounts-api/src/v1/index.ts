import { hono, HonoInterface } from '@/hono';
import external from './routes/external';
import register from './routes/register';
import token from './routes/token';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

export default hono()
	.use(
		'*',
		(ctx, next) =>
			secureHeaders({
				contentSecurityPolicy: {
					frameAncestors: ctx.env.WHITELIST_DOMAINS,
				},
			})(ctx, next),

		(ctx, next) =>
			cors({
				origin: ctx.env.WHITELIST_DOMAINS,
				allowMethods: ['POST', 'GET', 'OPTIONS'],
				credentials: true,
			})(ctx, next),
	)
	.route('/external', external)
	.route('/register', register)
	.route('/token', token);
