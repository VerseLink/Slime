import { MiddlewareHandler } from "hono";
import { StatusError } from "../../StatusError";
import { ApiQueryFailedResponse } from "@slime/api-v1/response";
import { StatusCode } from "hono/utils/http-status";

const getMessage = (code: number): string => ({
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	500: 'Internal Server Error',
})[code] || 'Unknown Error';

export const apiQueryFormatter: MiddlewareHandler = async (context, next) => {
	await next();
	if (!context.error) {
		return;
	}
	const err = context.error;
	if (err instanceof StatusError) {
		const fail: ApiQueryFailedResponse = typeof err.body === "string" ?
		{
			success: false,
			error: err.body,
		} :
		{
			...err.body,
			success: false,
			error: err.body?.error,
		};
		context.status(err.status);
		return context.json(fail);
	}

	let errorCode: StatusCode;
	if (typeof err !== "number") {
		// unexpected error!
		console.error(err);
		errorCode = 500;
	}
	else {
		errorCode = err;
	}
	const fail: ApiQueryFailedResponse = {
		success: false,
		error: getMessage(errorCode),
	};
	context.status(errorCode);
	return context.json(fail);
}