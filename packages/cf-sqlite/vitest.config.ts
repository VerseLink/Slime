import { defineWorkersProject } from '@cloudflare/vitest-pool-workers/config';
import path from 'path';

export default defineWorkersProject({
	test: {
		poolOptions: {
			workers: {
				main: "./test/index.ts",
				wrangler: {
					configPath: './wrangler.jsonc',
				},
				miniflare: {
					durableObjects: {
						"MockSqlBackupDO": { className: "MockSqlBackupDo", useSQLite: true }
					},
				}
			},
		},
		includeSource: ['src/**/*.{js,ts}']
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'~': path.resolve(__dirname, '.')
		},
	},
});
