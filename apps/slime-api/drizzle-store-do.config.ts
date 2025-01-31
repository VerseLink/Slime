import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './src/db/store/.drizzle',
	schema: './src/db/store/schema.ts',
	dialect: 'sqlite',
	driver: 'durable-sqlite',
});
