/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { AutoRouter, error, IRequest, json, StatusError } from "itty-router";
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

	let errStat: number;
	if (typeof err !== "number") {
		// unexpected error!
		console.error(err);
		errStat = 500;
	}
	else {
		errStat = err;
	}
	const fail: ApiQueryFailedResponse = {
		success: false,
		error: getMessage(errStat),
	};
	return json(fail, { status: errStat });
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
	*/
	missing: () => apiError(404)
})
	.all("/activity", ApiRouter.activity.fetch)
	.all("/stores", ApiRouter.stores.fetch)
	.all("/report", ApiRouter.report.fetch);

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return await router.fetch(request, env, ctx);
	}
} satisfies ExportedHandler<Env>;