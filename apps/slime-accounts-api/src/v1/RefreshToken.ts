import { JwtPayload } from '@tsndr/cloudflare-worker-jwt';
import { IDToken } from 'openid-client';
import { JSONValue } from 'hono/utils/types';
import { ArrayUtil, ArrayValue } from '@slime/util';

export interface RefreshToken extends JwtPayload {
	jti: string;
	iss: string;
	sub: string;
	iat: number;
	exp: number;
}

export type AccessToken<T extends [JWTNamespaces, ...JWTNamespaces[]] = [JWTNamespaces]> = JwtPayload & {
	iss: string;
	sub: string;
	iat: number;
	exp: number;
	aud: T | ArrayValue<T>;
} & {
	[K in ArrayValue<T>]: JWTNamespaceValue[K];
};

export interface RegisterToken extends JwtPayload {
	iss: string;
	iat: number;
	exp: number;
	aud: 'register';
	openid_token: IDToken;
}

export interface LoginState {
	id: string; // random uuid, can be ignored
}

export type JWTNamespaces = keyof JWTNamespaceValue;

export interface JWTNamespaceValue {
	'useslime.com': {
		roles: ('admin' | 'moderator' | 'user')[];
	};
}