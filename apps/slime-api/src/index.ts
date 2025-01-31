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

import { default as apiV1 } from './api/v1';
import { hono } from './api/hono';

const app = hono().basePath('/api').route('/v1', apiV1);

const worker: ExportedHandler<Env> = {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return await app.fetch(request, env, ctx);
	},
};

export default worker;

export { StoreDurableObject } from '@/db/store';
export { UserDurableObject } from '@/db/user';
