import { addCouponSchema, checkoutCouponSchema, CouponQueryResult, reportCouponAbuseSchema } from '#/store/coupon';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { hono } from '#api/hono';
import { AddCouponWorkflowParams } from '#workflows/addCoupon';
import { CodeRequiredVariables } from './types';
import { permissionTo } from './permissionTo';
import couponIdRouter from './couponId';

const listCouponSchema = z.object({
	cursor: z.string().optional(),
	limit: z.number().positive().max(30).optional(),
});

const router = hono<CodeRequiredVariables>()
	.route('/', couponIdRouter)
	.get('/', permissionTo('list'), zValidator('query', listCouponSchema), async (context) => {
		const { req, env } = context;

		const { storeId } = context.get('store');
		const user = context.get('user');

		const data = req.valid('query');
		const store = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(storeId));
		const coupons: CouponQueryResult[] = await store.getCoupons({
			expired: false,
			limit: data.limit ?? 30,
			cursor: data.cursor,
		});

		await store.addVisitor(user);

		return context.json(coupons);
	})
	.post('/', permissionTo('create'), zValidator('form', addCouponSchema), async (context) => {
		const { req, env } = context;

		if (context.get('store').type === 'unknown') {
			// If it was reported as an unknown store, we need to check if the store is already registered
		}

		await env.ADD_COUPON.create({
			params: {
				user: context.get('user'),
				storeId: context.get('store').storeId,
				addCoupon: req.valid('form'),
			} satisfies AddCouponWorkflowParams,
		});

		return context.json({}, 201);
	})
	.post('/report-abuse', permissionTo('report-abuse'), zValidator('form', reportCouponAbuseSchema), async (context) => {
		const { req, env } = context;
		const user = context.get('user');
		const store = context.get('store');

		const storeDurable = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(store.storeId));
		await storeDurable.reportAbuse(user, req.valid('form'));

		return context.json({}, 201);
	})
	.post('/report-usage', permissionTo('report-usage'), zValidator('form', checkoutCouponSchema), async (context) => {
		const { req, env } = context;
		const user = context.get('user');
		const store = context.get('store');

		const storeDurable = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(store.storeId));
		await storeDurable.checkout(user, req.valid('form'));

		return context.json({}, 201);
	})

export default router;
