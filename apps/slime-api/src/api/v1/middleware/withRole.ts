import { IRequest, StatusError } from "itty-router";

/**
 * A middleware that checks and verify JWT token claims
 * @param role 
 * @returns 
 */
export function withRole(role: ("anonymous")[]) {
    return (request: IRequest, env: Env, ctx: ExecutionContext) => {
        // TODO: validate JWT token
        const user = request.headers.get("X-Anonymous-JWT-User");
        if (user == null)
            throw new StatusError(401, "Authenication required");
        request.jwt = user;
    };
}