import { StoreBasicData } from '#store/permission';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import psl from 'psl';

/**
 * Middleware to extract the storeId from the url (?url={url})
 */
export const urlToStoreId = createMiddleware<{ Variables: { store: StoreBasicData } }>(async (c, next) => { 
	const url = c.req.param('url');
    if (!url) {
        throw new HTTPException(400, { message: 'Missing url parameter' });
    }

	const parsed = psl.parse(url);
	if (parsed.error) {
		throw new HTTPException(400, { message: `Invalid url: ${parsed.error.message}`, cause: parsed.error });
	}
	if (!parsed.domain) {
		throw new HTTPException(400, { message: 'Provided url does not have a valid domain' });
	}

    c.set('store', {
        type: "unknown",
        url: url,
        storeId: parsed.domain,
    });
    await next();
});

/**
 * Middleware to extract the storeId from the url (?storeId={storeId})
 */
export const storeMiddleware = createMiddleware<{ Variables: { store: StoreBasicData } }>(async (c, next) => {
    const storeId = c.req.param('storeId');
    if (!storeId) {
        throw new HTTPException(400, { message: 'Missing storeId parameter' });
    }

    c.set('store', {
        type: "supported",
        storeId: storeId,
    });
    await next();
});