import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './src/db/.drizzle',
	schema: './src/db/schema.ts',
	dialect: 'sqlite',
	driver: 'd1-http',
});
