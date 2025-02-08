import { default as apiV1 } from './api/v1';
import { hono } from './api/hono';

const app = hono().route('/', apiV1);

const worker: ExportedHandler<Env> = {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return await app.fetch(request, env, ctx);
	},
};

export default worker;

export { StoreDurableObject } from '@/store';
export { UserDurableObject } from '@/user/index';
export { AddCouponWorkflow } from "@/workflows/addCoupon";