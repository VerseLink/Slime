import { AutoRouter, IRequest, json, StatusError } from "itty-router";
import { ApiRouter } from "./api/v1";
import { ApiQueryFailedResponse } from "@slime/api-v1";

const getMessage = (code: number): string => ({
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	500: 'Internal Server Error',
})[code] || 'Unknown Error';

const apiError = (err: unknown) => {
    
	if (err instanceof StatusError) {
		const fail: ApiQueryFailedResponse = {
			success: false,
			error: err.message,
		};
		return json(fail, { status: err.status });
	}

	let errorCode: number;
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
	return json(fail, { status: errorCode });
}

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({
	base: "/api/v1",
	catch: apiError,
	/**
	format: (response) => {
		return json({
			success: true,
			result: response,
		});
	},
	// add finally so we can ask the client to properly cache some api result
	finally: (res) => {

	},
	*/
	missing: () => apiError(404)
});

router.all("/activity", ApiRouter.activity.fetch)
	  .all("/stores", ApiRouter.stores.fetch)
	  .all("/report", ApiRouter.code.fetch);

export default router;