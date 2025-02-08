import { EnvBindings } from '@/api/hono';
import { SlimeRoles, User } from '@/user';
import { zValidator } from '@hono/zod-validator';
import { JWTManager } from '@slime/jwt-kv';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { AccessToken } from '@slime/auth/v1';
import { ArrayUtil } from '@slime/util';
import { Context } from 'hono';

function missingBearerToken(c: Context) {
	return c.json({ success: false, error: "Authentication required: Bearer token missing" }, 401, {
		'WWW-Authenticate': `Bearer realm="useslime.com", error="invalid_request", error_description="The Authorization header is missing a bearer token that holds a access token."`,
	});
}

export const signedIn = createMiddleware<EnvBindings<{ user: User }>>(async (c, next) => {
	if (!c.get('user')) {
		return missingBearerToken(c);
	}
	await next();
});

export const useAuthorization = createMiddleware<EnvBindings<{ user?: User }>>(async (c, next) => {
	const { req, env } = c;
	const authHeader = req.header('Authorization');
	if (authHeader === undefined) {
		c.set('user', undefined);
		await next();
		return;
	}
	const jwt = new JWTManager(env.JWT_KEY_KV_STORE);
	const token = authHeader.split(' ')[1];
	if (token === undefined || !authHeader.startsWith('Bearer')) {
		return missingBearerToken(c);
	}

	const accessToken = await jwt.verify<AccessToken>(token);
	if (!accessToken) {
		throw new HTTPException(403, { message: 'Token invalidated or expired.' });
	}

	let user: User;
	if (ArrayUtil.includes(accessToken.aud, 'useslime.com')) {
		user = {
			id: accessToken.sub,
			roles: accessToken['useslime.com'].roles,
		};
	} else {
		user = {
			id: accessToken.sub,
			roles: [],
		};
	}
	c.set('user', user);

	await next();
});
