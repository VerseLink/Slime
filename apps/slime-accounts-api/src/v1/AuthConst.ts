export namespace AuthConst {
    export namespace CookieName {
        export const RefreshToken = "__slime_refresh_token";
        export const AccessToken = "__slime_access_token";
        export const RegisterToken = "__slime_register_token";
        export const CSRFToken = "csrf_token";
        export const InfoSignUpDetails = "signup_details";
    }

    export namespace Path {
        export const Register = "/api/v1/register";
        export const Token = "/api/v1/token";
        export const Signup = "/signup";
    }
}
