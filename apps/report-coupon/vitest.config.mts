import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				wrangler: { configPath: './wrangler.toml' },
				miniflare: {
					kvNamespaces: ["JWT_KEY_KV_STORE"],
					d1Databases: ["COUPON_DB"],
				  }
			},
		},
	},
});
