import { addCouponSchema, checkoutCouponSchema, CouponQueryResult, reportCouponAbuseSchema } from '@/store/coupon';
import { User } from '@/user';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { hono } from '@/api/hono';
import { codePermission, StoreBasicData, StoreCodePermission } from '@/store/permission';
import { AddCouponWorkflowParams } from '@/workflows/addCoupon';
import { HTTPException } from 'hono/http-exception';
import { createMiddleware } from 'hono/factory';

type CodeRequiredVariables = {
    store: StoreBasicData; 
    user: User;
}

const permissionTo = (action: StoreCodePermission) => createMiddleware<{ Variables: CodeRequiredVariables }>(async (context, next) => {
    const store = context.get('store');
	const user = context.get('user');

	if (!codePermission.withUser(user).can(action).item({ store })) {
		throw new HTTPException(403);
	}
    await next();
});

const router = hono<CodeRequiredVariables>();
export default router;

const listCouponSchema = z.object({
	cursor: z.string().optional(),
	limit: z.number().positive().max(30).optional(),
});

router.get('/', permissionTo('list'), zValidator('query', listCouponSchema), async (context) => {
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
});

router.post('/', permissionTo('create'), zValidator('form', addCouponSchema), async (context) => {
	const { req, env } = context;

	await env.ADD_COUPON.create({
		params: {
			user: context.get('user'),
			storeId: context.get('store').storeId,
			addCoupon: req.valid('form'),
		} satisfies AddCouponWorkflowParams,
	});

	return context.json({}, 201);
});


router.post('/report-abuse', permissionTo("report-abuse"), zValidator('form', reportCouponAbuseSchema), async (context) => {
	const { req, env } = context;
	const user = context.get('user');
	const store = context.get('store');

	const storeDurable = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(store.storeId));
	await storeDurable.reportAbuse(user, req.valid('form'));

	return context.json({}, 201);
});

router.post('/report-usage', permissionTo("report-usage"), zValidator('form', checkoutCouponSchema), async (context) => {
    const { req, env } = context;
    const user = context.get('user');
    const store = context.get('store');

    const storeDurable = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(store.storeId));
    await storeDurable.checkout(user, req.valid('form'));

    return context.json({}, 201);
});

router.get('/:couponId', permissionTo('read-detail'), async (context) => {
    const { req, env } = context;
    const { storeId } = context.get('store');
    const couponId = req.param('couponId');

    const store = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(storeId));
    const coupon = await store.getCoupon(couponId);

    return context.json(coupon);
});

router.patch("/:couponId", permissionTo("write"), async (context) => {
    const { req, env } = context;
    const { storeId } = context.get('store');
    const couponId = req.param('couponId');

    const store = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(storeId));
    await store.updateCoupon(couponId, req.body);

    return context.json({}, 204);
});