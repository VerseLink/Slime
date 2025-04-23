import { StoreMetadataDatabase } from '#store-discovery';
import { EnvBindings, hono } from '#api/hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { storeMiddleware, urlToStoreId } from './middleware';
import codesRoute from './codes';
import { signedIn } from '../middleware/authorization';
import { CouponQueryResult, PartialContent } from '#store/coupon.js';
import { StoreMetadata } from '#store/index.js';

export interface StoreInformation {
	metadata?: StoreMetadata;
	coupons: PartialContent<CouponQueryResult>;
}

export const router = hono()
	// List stores associated by the root domain
	.get('/', zValidator('query', z.object({ domain: z.string() })), async (context) => {
		const { req, env } = context;
		// query database to get the domain
		const { domain } = req.valid('query');
		const db = new StoreMetadataDatabase(env.SLIME_DB);
		const stores = await db.getStoresByDomain(domain);

		return context.json(
			stores.map((store) => ({
				storeId: store.storeId,
				urlPart: store.urlRegex,
			})) as { storeId: string; urlPart: string }[],
		);
	})
	.get('/:storeId', signedIn, async (context) => {
		// return store info
		const { req, env } = context;
		const storeId = req.param('storeId');

		const store = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(storeId));
		if (!store.exists()) {
			throw new HTTPException(404);
		}
		const response: StoreInformation = {
			metadata: await store.getMetadata(),
			coupons: await store.getCoupons({ expired: false, limit: 30, cursor: req.query('cursor') }),
		}
		return context.json(response);
	})
	.route('/:storeId/codes', hono().use(signedIn, storeMiddleware).route('/', codesRoute))
	.route('/unknown/:url/codes', hono().use(signedIn, urlToStoreId).route('/', codesRoute));
