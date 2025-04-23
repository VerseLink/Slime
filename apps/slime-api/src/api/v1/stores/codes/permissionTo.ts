import { codePermission, StoreCodePermission } from "#store/permission";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { CodeRequiredVariables } from "./types";

export const permissionTo = (action: StoreCodePermission) => createMiddleware<{ Variables: CodeRequiredVariables }>(async (context, next) => {
    const store = context.get('store');
	const user = context.get('user');

	if (!codePermission.withUser(user).can(action).item({ store })) {
		throw new HTTPException(403);
	}
    await next();
});