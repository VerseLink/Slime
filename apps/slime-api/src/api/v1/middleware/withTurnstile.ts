import { IRequest, StatusError } from "itty-router";

/**
 * A middleware that checks and verify if the turnstile is valid
 * @param role 
 * @returns 
 */
export function withTurnstile(request: IRequest, env: Env, ctx: ExecutionContext) {
    // TODO: Validate turnstile request
    return;
}