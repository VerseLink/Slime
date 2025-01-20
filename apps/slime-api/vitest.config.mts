import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'path';

export default defineWorkersConfig({
	test: {
		poolOptions: {
			workers: {
				main: "./test/index.ts",
				wrangler: { configPath: './wrangler.toml' },
				miniflare: {
					kvNamespaces: ["JWT_KEY_KV_STORE"],
					d1Databases: ["COUPON_DB"],
					durableObjects: {
						"MockSqlBackupDO": { className: "MockSqlBackupDo", useSQLite: true }
					},
					cache: true,
					cachePersist: true,
				}
			},
		},
		includeSource: ['src/**/*.{js,ts,sql}']
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'~': path.resolve(__dirname, '.')
		},
	},
});
