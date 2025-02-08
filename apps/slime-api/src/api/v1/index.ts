import { hono } from '@/api/hono';
import { jsonFormatter } from './middleware/jsonFormatter';

import { router as stores } from './stores';
import { HTTPException } from 'hono/http-exception';

const router = hono().basePath('/api/v1');

router.use(jsonFormatter);
router.onError((err, c) => {
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
});

router.route('/stores', stores);

export default router;
