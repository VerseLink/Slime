import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './src/user/.drizzle',
	schema: './src/user/schema.ts',
	dialect: 'sqlite',
	driver: 'durable-sqlite',
});
