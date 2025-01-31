import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './src/db/slime-d1/.drizzle',
	schema: './src/db/slime-d1/schema.ts',
	dialect: 'sqlite',
	driver: 'd1-http',
});
