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

import { WorkerEntrypoint } from "cloudflare:workers";
import { AutoRouter, error, IRequest, json } from "itty-router";

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: "/api/v1" });

router.post("/coupon/report", (request, env) => {
	
});

router.get("/coupon", (request, env) => {
	return "Hello world";
});

export default class CouponReport extends WorkerEntrypoint<Env> {

	async fetch(request: Request): Promise<Response> {
		return router.fetch(request, this.env, this.ctx).then(json).catch(error);
	}

}