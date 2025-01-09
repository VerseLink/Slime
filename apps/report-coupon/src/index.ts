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
import { AutoRouter, error, IRequest, json, StatusError, text } from "itty-router";
import { DbCouponTable } from "./types/DbCouponTable";
import { z } from "zod";
import { D1QB } from "workers-qb";
import jwt from "@tsndr/cloudflare-worker-jwt"

export type CouponCondition = {
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

export type RedeemContent = {
	type: "other",
	details: string,
	amount: number,
}

export type RedeemCondition = {
	type: "other",
	details: string
}

export type CodeReportRequest = {
	domain: string,
	pathRegex?: string,
} & ({
	type: "coupon"
	code: string,
	content?: CouponContent[],
	conditions?: CouponCondition[],
	expireAt?: number,
} | {
	type: "redeem",
	code: string,
	content?: RedeemContent[],
	conditions?: RedeemCondition[],
	expireAt?: number,
});

export type CouponResult = {
	coupon: string;
	pathRegex?: string;
	couponContent: CouponContent[],
	conditions: CouponCondition[],
	expireAt?: number,
}

const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: "/api/v1" });

router.post("/register", async () =>{
	const token = await jwt.sign({
		iss: "BIGUBIRD",
		point: 0,
		iat: Date.now(),
		jti: crypto.randomUUID()
    }, "IAM2025PENGUIN")

	return token;
});

async function verify(request: IRequest) {
	const token = request.headers.get("X-Temp-User");
	if (token == null){
		throw new StatusError(400, "Bad Request");
	}
	const verifiedToken = await jwt.verify(token, "IAM2025PENGUIN")

    if (!verifiedToken){
		throw new StatusError(401, "Unauthorized");
	}
};

router.post("/code/report", async (request, env) => {
	await verify(request);
	const body = await request.json<CodeReportRequest>();

	const schema = z.discriminatedUnion("type", [
		z.object({
			type: z.literal("coupon"),
			domain: z.string().nonempty().url(),
			coupon: z.string().nonempty().max(128),
			couponContent: z.discriminatedUnion("type", [
				z.object({ type: z.literal("other"), details: z.string() }),
			]),
			conditions: z.discriminatedUnion("type", [
				z.object({ type: z.literal("other"), details: z.string(), amount: z.number().nullish() }),
			])
		}),
		z.object({
			type: z.literal("redeem"),
			domain: z.string().nonempty().url(),
		})
	]);

	schema.parse(body);
	try {
		const qb = new D1QB(env.COUPON_DB);
		const result = await qb.insert<DbCouponTable>({
			tableName: DbCouponTable.TableName,
			data: [
				{
					Id: crypto.randomUUID(),
					Domain: body.domain,
					PathRegex: body.pathRegex ?? null, // body?.pathRegex
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

router.get("/code", async (request, env) => {

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