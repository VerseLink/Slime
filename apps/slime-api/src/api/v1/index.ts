import { hono } from '../hono';

import { router as stores } from './stores';
import { HTTPException } from 'hono/http-exception';
//import { hc } from 'hono/client';

export default hono()
	.basePath('/api/v1')
	.onError((err, c) => {
		if (err instanceof HTTPException) {
			if (c.env.ENVIRONMENT === 'dev') {
				console.error(err);
			}
			if (err.res) {
				return err.res;
			}
			return c.json({ success: false, error: err.message }, err.status);
		}
		console.error(err);
		return c.json({ success: false, error: 'Internal Server Error' }, 500);
	})
	.route('/stores', stores);
