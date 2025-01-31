import { HonoInterface } from "@/hono";
import { Context } from "hono";

export function redirectFrontend(ctx: Context<HonoInterface>, path: string) {
    if (ctx.env.ENVIRONMENT === "dev") {
        return ctx.redirect(`http://127.0.0.1:5100${path}`);
    }
    return ctx.redirect(path);
}

export function getFrontendUrl(ctx: Context<HonoInterface>, path: string) {
    if (ctx.env.ENVIRONMENT === "dev") {
        return `http://127.0.0.1:5100${path}`;
    }
    return path;
}

export function getBackendUrl(ctx: Context<HonoInterface>, path: string) {
    if (ctx.env.ENVIRONMENT === "dev") {
        return `http://127.0.0.1:8810${path}`;
    }
    return path;
}