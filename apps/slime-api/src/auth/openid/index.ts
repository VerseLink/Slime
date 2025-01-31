import * as openid from "openid-client";

export interface OpenIdServerMetadata extends openid.ServerMetadata {
	code_challenge_methods_supported: ('plain' | 'S256')[];
	issuer: string;
	authorization_endpoint: string;
	token_endpoint: string;
	userinfo_endpoint?: string;
}
