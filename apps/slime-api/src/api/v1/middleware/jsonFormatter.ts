import { MiddlewareHandler } from "hono";

export const jsonFormatter: MiddlewareHandler = async (context, next) => {
	context.json({
		
	})
}