import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { JWTManager } from '@slime/jwt-kv';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import * as openid from 'openid-client';
import { OpenIdServerMetadata } from '@/auth/openid';
import { CookieOptions } from 'hono/utils/cookie';
import { Env as HonoEnv } from 'hono';
import { LoginState } from './RefreshToken';
import { getBackendUrl } from './redirect';
import { HonoInterface } from '@/hono';

type OpenIdClientData = {
	clientId: string;
	clientSecret: string;
};

interface ApiEnv extends HonoEnv {
	Bindings: Env;
}

export type AuthenticationConfigurations<T extends ApiEnv> = {
	basePath: string;
	onAuthenticated: (
		ctx: Context<T>,
		from: string,
		token: openid.IDToken,
		state: LoginState,
	) => Promise<Response>;
	providers: {
		[key: string]: {
			config: OpenIdServerMetadata | string;
			scopes: string[];
			getClientData: (env: T['Bindings']) => OpenIdClientData;
		};
	};
};

export function useOpenIdAuthentication<T extends ApiEnv>(
	hono: Hono<T>,
	config: AuthenticationConfigurations<T>,
) {
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
				: await openid.discovery(
						new URL(provider.config),
						client.clientId,
						client.clientSecret,
						undefined,
						{
							[openid.customFetch]: (url, options) => {
								return fetch(url, {
									...options,
									cf: {
										cacheEverything: true,
										// cache the openid response, 3600 seconds by default
										cacheTtl: 3600,
									},
								});
							},
						},
					);
		};

		hono.all(`${path}/*`, (ctx, next) =>
			cors({
				origin: ctx.env.WHITELIST_DOMAINS,
				allowMethods: ['POST', 'GET', 'OPTIONS'],
				credentials: true,
			})(ctx, next),
		);

		hono.get(`${path}/${name}`, async (context: Context<HonoInterface>) => {
			const client = provider.getClientData(context.env);
			const clientConfig = await getClientConfig(client);
			const state: LoginState = {
				id: crypto.randomUUID(), // to prevent replay attack and attach a random data to state
			};
			const redirectUrl = getBackendUrl(context, `/api/v1/external/google/callback`);//new URL(callbackUrl, context.env.ENVIRONMENT === "dev" ? "http://localhost:8810/api/v1" : context.req.url);
			
			const cookieOptions: CookieOptions = {
				httpOnly: true,
				sameSite: "lax",
				domain: context.env.ENVIRONMENT !== 'dev' ? ".useslime.com" : "127.0.0.1",
				secure: context.env.ENVIRONMENT !== 'dev',
				expires: new Date(new Date().setMinutes(new Date().getMinutes() + 10)),
			};

			const params: Record<string, string> = {
				state: JSON.stringify(state),
				redirect_uri: redirectUrl,
				scope: provider.scopes.join(' '),
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
				const nonce = await new JWTManager(context.env.JWT_KEY_KV_STORE).sign({
					exp: Date.now() + 60,
				});
				params.nonce = nonce;

				setCookie(context, cookieNames.nonce, nonce, cookieOptions);
			}
			// in the future we might want refresh token to access Google services, but since we only use Google for login, not really atm
			// params['access_type'] = 'offline'
			// params['prompt'] = 'consent'

			return context.redirect(openid.buildAuthorizationUrl(clientConfig, params));
		});

		hono.get(callbackUrl, async (context) => {
			const client = provider.getClientData(context.env);
			const clientConfig = await getClientConfig(client);

			const url = new URL(context.req.url);
			const cookieOptions = { };

			const state = getCookie(context, cookieNames.state);
			deleteCookie(context, cookieNames.state, cookieOptions);

			const nonce = getCookie(context, cookieNames.nonce);
			deleteCookie(context, cookieNames.nonce, cookieOptions);

			const code_verifier = getCookie(context, cookieNames.code_verifier);
			deleteCookie(context, cookieNames.code_verifier, cookieOptions);

			let idToken: openid.IDToken | undefined;
			console.log(context.req.header("Cookie"));
			try {
				const tokens = await openid.authorizationCodeGrant(clientConfig, url, {
					pkceCodeVerifier: code_verifier,
					expectedNonce: nonce,
					expectedState: state,
					idTokenExpected: true,
				});
				idToken = tokens.claims();
			} catch (e) {
				console.error(e);
				throw new HTTPException(400, {
					message: 'Missing parameters, cookies or invalid token',
					cause: e,
				});
			}
			if (idToken === undefined) {
				throw new HTTPException(502, {
					message: 'Upstream server error, no id_token were returned',
				});
			}

			return await config.onAuthenticated(context, name, idToken, JSON.parse(state!) as LoginState);
		});
	}
	return hono;
}
