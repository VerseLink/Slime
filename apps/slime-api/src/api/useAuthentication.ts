import { hono, HonoInterface } from '@/api/hono';
import { Context, Hono } from 'hono';
import { StatusError } from '@/api/StatusError';
import { JWTManager } from '../../../../packages/cf-sqlite/src';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import * as openid from 'openid-client';
import { OpenIdServerMetadata } from '@/auth/openid';
import { CookieOptions } from 'hono/utils/cookie';

type OpenIdClientData = {
	clientId: string;
	clientSecret: string;
};

export type AuthenticationConfigurations = {
	basePath: string;
	onAuthenticated: (ctx: Context<HonoInterface>, from: string, token: openid.IDToken) => Promise<unknown>;
	providers: {
		[key: string]: {
			config: OpenIdServerMetadata | string;
			scopes: string[];
			getClientData: (env: Env) => OpenIdClientData;
		};
	};
};

export function useOpenIdAuthentication(hono: Hono<HonoInterface>, config: AuthenticationConfigurations) {
	for (let name of Object.keys(config.providers)) {
		const path = config.basePath;
		const provider = config.providers[name];
		const callbackUrl = `${path}/${name}/callback`;
		const cookieNames = {
			state: `__${name}_state`,
			nonce: `__${name}_nonce`,
			code_verifier: `__${name}_code_verifier`,
		};

		const getClientConfig = async (client: OpenIdClientData) => {
			return typeof provider.config !== 'string'
				? new openid.Configuration(provider.config, client.clientId, client.clientSecret)
				: await openid.discovery(new URL(provider.config), client.clientId, client.clientSecret, undefined, {
                    [openid.customFetch]: (url, options) => {
                        return fetch(url, {
                            ...options,
                            cf: {
                                cacheEverything: true,
                                // cache the openid response, 3600 seconds by default
                                cacheTtl: 3600,
                            }
                        })
                    }
                });
		};

		hono.post(`${path}/${name}`, async (context) => {
			const client = provider.getClientData(context.env);
			const clientConfig = await getClientConfig(client);

			const redirectUrl = new URL(callbackUrl, context.req.url);

			const cookieOptions: CookieOptions = {
				path: redirectUrl.pathname,
				httpOnly: true,
				secure: context.env.ENVIRONMENT !== 'dev',
                expires: new Date(new Date().setMinutes(new Date().getMinutes() + 10))
			};

			const params: Record<string, string> = {
				redirect_uri: redirectUrl.href,
				scope: provider.scopes.join(' '),
				state: openid.randomState(),
			};

			setCookie(context, cookieNames.state, params.state, cookieOptions);

			if (clientConfig.serverMetadata().supportsPKCE()) {
				const code_verifier = openid.randomPKCECodeVerifier();
				const code_challenge = await openid.calculatePKCECodeChallenge(code_verifier);

				params.code_challenge = code_challenge;
				params.code_challenge_method = 'S256';

				setCookie(context, cookieNames.code_verifier, code_verifier, cookieOptions);
			} else {
				// expire the nonce after 60s to prevent replay attack
				const nonce = await new JWTManager(context.env.JWT_KEY_KV_STORE).sign({ exp: Date.now() + 60 });
				params.nonce = nonce;

				setCookie(context, cookieNames.nonce, nonce, cookieOptions);
			}
			// in the future we might want refresh token to access Google services, but since we only use Google for login, not really atm
			// params['access_type'] = 'offline'
			// params['prompt'] = 'consent'

			return context.redirect(openid.buildAuthorizationUrl(clientConfig, params));
		});

		hono.post(callbackUrl, async (context) => {
			const client = provider.getClientData(context.env);
			const clientConfig = await getClientConfig(client);

			const url = new URL(context.req.url);
			const cookieOptions = { path: url.pathname };

			const state = getCookie(context, cookieNames.state);
			deleteCookie(context, cookieNames.state, cookieOptions);

			const nonce = getCookie(context, cookieNames.nonce);
			deleteCookie(context, cookieNames.nonce, cookieOptions);

			const code_verifier = getCookie(context, cookieNames.code_verifier);
			deleteCookie(context, cookieNames.code_verifier, cookieOptions);

			let idToken: openid.IDToken | undefined;
			try {
				const tokens = await openid.authorizationCodeGrant(clientConfig, url, {
					pkceCodeVerifier: code_verifier,
					expectedNonce: nonce,
					expectedState: state,
					idTokenExpected: true,
				});
				idToken = tokens.claims();
			} catch (e) {
				throw new StatusError(400, 'Missing parameters, cookies or invalid token', { cause: e });
			}
			if (idToken === undefined) throw new StatusError(502, 'Upstream server error, no id_token were returned');

			await config.onAuthenticated(context, name, idToken);
		});
	}
}
