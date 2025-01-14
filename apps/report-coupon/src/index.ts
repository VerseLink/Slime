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

import { AutoRouter, error, IRequest, json } from "itty-router";
import { ApiRouter } from "./api/v1";

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: "/api/v1" });

router.all("/activity", ApiRouter.activity.fetch)
	  .all("/stores", ApiRouter.stores.fetch)
	  .all("/report", ApiRouter.report.fetch)

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return router.fetch(request, env, ctx).then(json).catch(error);
	}
} satisfies ExportedHandler<Env>;