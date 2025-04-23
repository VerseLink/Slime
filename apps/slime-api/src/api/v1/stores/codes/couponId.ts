import { hono } from '#api/hono';
import { permissionTo } from './permissionTo';
import { CodeRequiredVariables } from './types';

const router = hono<CodeRequiredVariables>()
	.basePath('/:couponId')
	.get('/', permissionTo('read-detail'), async (context) => {
		const { req, env } = context;
		const { storeId } = context.get('store');
		const couponId = req.param('couponId');

		const store = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(storeId));
		const coupon = await store.getCoupon(couponId);

		return context.json(coupon);
	})
	.patch('/', permissionTo('write'), async (context) => {
		const { req, env } = context;
		const { storeId } = context.get('store');
		const couponId = req.param('couponId');

		const store = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(storeId));
		//await store.updateCoupon(couponId, req.body);

		return context.status(204);
	});

export default router;
