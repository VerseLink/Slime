import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
	'./apps/slime-api/vitest.config.mts',
	'./apps/slime-accounts/vite.config.ts',
	'./packages/jwt-kv/vitest.config.ts',
	'./packages/cf-sqlite/vitest.config.ts',
]);
