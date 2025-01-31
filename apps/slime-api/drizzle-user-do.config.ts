import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './src/db/user/.drizzle',
	schema: './src/db/user/schema.ts',
	dialect: 'sqlite',
	driver: 'durable-sqlite',
});
