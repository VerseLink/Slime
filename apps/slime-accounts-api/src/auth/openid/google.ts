import * as openid from "openid-client";
import { OpenIdServerMetadata } from ".";

export namespace OpenIdServerDefaults {
    export const google: OpenIdServerMetadata = {
        code_challenge_methods_supported: ['plain', 'S256'],
        issuer: 'https://accounts.google.com',
        authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        userinfo_endpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
        token_endpoint: 'https://oauth2.googleapis.com/token',
    }
}