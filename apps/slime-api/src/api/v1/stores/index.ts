import { StoreMetadataDatabase } from '@/store-discovery';
import { EnvBindings, hono } from '@/api/hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { storeMiddleware, urlToStoreId } from './middleware';
import codesRoute from './codes';
import { signedIn } from '../middleware/authorization';

export const router = hono();

// List stores associated by the root domain
router.get('/', zValidator('query', z.object({ domain: z.string() })), async (context) => {
	const { req, env } = context;
	// query database to get the domain
	const { domain } = req.valid('query');
	const db = new StoreMetadataDatabase(env.SLIME_DB);
	const stores = await db.getStoresByDomain(domain);

	return context.json(
		stores.map((store) => ({
			storeId: store.storeId,
			urlPart: store.urlRegex,
		})),
	);
});

router.get('/:storeId', signedIn, async (context) => {
	// return store info
	const { req, env } = context;
	const storeId = req.param('storeId');

	const store = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(storeId));
	if (!store.exists()) {
		throw new HTTPException(404);
	}
	//return await store.getMetadata();
});

const namedStoreCodes = hono().use(signedIn, storeMiddleware).route('/', codesRoute);
router.route('/:storeId/codes', namedStoreCodes);

const unknownStoreCodes = hono().use(signedIn, urlToStoreId).route('/', codesRoute);
router.route('/unknown/:url/codes', unknownStoreCodes);
