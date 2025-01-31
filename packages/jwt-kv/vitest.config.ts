import { defineWorkersProject } from '@cloudflare/vitest-pool-workers/config';
import path from 'path';

export default defineWorkersProject({
	test: {
		poolOptions: {
			workers: {
				singleWorker: true,
				wrangler: {
					configPath: './wrangler.jsonc',
				},
			},
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'~': path.resolve(__dirname, '.')
		},
	},
});
