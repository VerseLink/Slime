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
import { AutoRouter, error, IRequest, json, StatusError } from "itty-router";
import { DbCouponTable } from "./types/DbCouponTable";
import { z } from "zod";
import { D1QB } from "workers-qb";

export type CouponConditions = {
	type: "sumGreaterThan" | "sumGreaterOrEqualThan",
	value: number,
} |
{
	type: "itemGreaterThan" | "itemGreaterOrEqualThan",
	itemCount: number,
} |
{
	type: "other",
	details: string,
};

export type CouponContent = {

}

export type CouponReportRequest = {
	domain: string,
	pathRegex?: string,
	coupon: string,
	couponContent?: CouponContent[],
	conditions?: CouponConditions[],
	expireAt?: number,
};

export type CouponResult = {
	coupon: string;
	pathRegex?: string;
	couponContent: CouponContent[],
	conditions: CouponConditions[],
	expireAt?: number,
}

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: "/api/v1" });

router.post("/coupon/report", async (request, env) => {
	const body = await request.json<CouponReportRequest>();

	try {
		const qb = new D1QB(env.COUPON_DB);
		const result = await qb.insert<DbCouponTable>({
			tableName: DbCouponTable.TableName,
			data: [
				{
					Id: crypto.randomUUID(),
					Domain: body.domain,
					PathRegex: body.pathRegex ?? null,
					Coupon: body.coupon,
					CouponContent: JSON.stringify(body.couponContent),
					Conditions: JSON.stringify(body.conditions),
					DiscoveredAt: Date.now(),
					ExpireAt: body.expireAt ?? null,
				}
			] satisfies DbCouponTable[]
		}).execute();

		if (result.success)
			return { success: true };
		throw new StatusError(500, "Internal Database Error, please try again later.");
	}
	catch (err: unknown) {
		if (!(err instanceof StatusError))
			console.error(err);
		throw err;
	}
});

router.get("/coupon", async (request, env) => {

	const domain = request.params["domain"];
	if (domain == null)
		throw new StatusError(400, "Missing domain");

	try {
		const qb = new D1QB(env.COUPON_DB);
		const result = await qb.fetchAll<DbCouponTable>({
			tableName: DbCouponTable.TableName,
			fields: ['*'],
			where: {
				conditions: 'Domain = ?1',
				params: [domain]
			}
		}).execute();

		if (result.success) {
			return result.results?.map(item => ({
				coupon: item.Coupon,
				pathRegex: item.PathRegex ?? undefined,
				conditions: JSON.parse(item.Conditions),
				couponContent: JSON.parse(item.CouponContent),
				expireAt: item.ExpireAt ?? undefined,
			} satisfies CouponResult));
		}
		throw new StatusError(500, "Internal Database Error");
	}
	catch (err: unknown) {
		if (!(err instanceof StatusError))
			console.error(err);
		throw err;
	}
});

export default class CouponReport extends WorkerEntrypoint<Env> {

	async fetch(request: Request): Promise<Response> {
		return router.fetch(request, this.env, this.ctx).then(json).catch(error);
	}

}