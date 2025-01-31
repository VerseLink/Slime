import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { AuthConst } from "./AuthConst";
import { HonoInterface } from "@/hono";

export type TokenDetails = {
    refreshToken: {
        value: string;
        expires: Date;
    } | null;
    accessToken: {
        value: string;
        expires: Date;
    }
}

export function setRequestTokenCookie(ctx: Context<HonoInterface>, token: TokenDetails) {
    if (token.refreshToken) {
        setCookie(ctx, AuthConst.CookieName.RefreshToken, token.refreshToken.value, {
            expires: token.refreshToken.expires,
            path: "/",
            domain: ctx.env.ENVIRONMENT === "dev" ? "127.0.0.1" : ".useslime.com",
            sameSite: "lax",
            httpOnly: true,
            secure: ctx.env.ENVIRONMENT !== "dev"
        });
    }
    if (token.accessToken) {
        setCookie(ctx, AuthConst.CookieName.AccessToken, token.accessToken.value, {
            expires: token.accessToken.expires,
            path: "/",
            domain: ctx.env.ENVIRONMENT === "dev" ? "127.0.0.1" : ".useslime.com",
            sameSite: "lax",
            httpOnly: false,
            secure: ctx.env.ENVIRONMENT !== "dev"
        });
    }
}
