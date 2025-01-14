export type JwtAnonymousUserToken = {
    
    // JWT Fields

    /** Issued At */
    iat: number;
    /** Issuer, here most likely is our good coupon service */
    iss: "slime-reward-service";
    /** Subject, the UUID for the anonymous user */
    sub: string;
    /** Audience */
    aud: "anon-reward-user";

    // Custom Field

    /** The version of the anonymous id is created from */
    version: number;
    /** The rating/standing for the user, the higher the score the more we trust them */
    rating: number;
    
};
