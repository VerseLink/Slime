import { JwtPayload } from '@tsndr/cloudflare-worker-jwt';
import { IDToken } from 'openid-client';

export interface RefreshToken extends JwtPayload {
	jti: string;
	iss: string;
	sub: string;
	iat: number;
	exp: number;
}

export interface AccessToken extends JwtPayload {
    iss: string;
    sub: string;
    iat: number;
    exp: number;
    claims: Record<string, Rpc.Serializable<unknown>>;
}

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