import { Kyselify } from 'drizzle-orm/kysely';
import { int, text, sqliteTable, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

// Run the following command to initiate migration
// npx drizzle-kit generate --config=drizzle.config.ts

export const userId = sqliteTable('UserId', {
	userId: text().primaryKey(),
});

export const userAuthTable = sqliteTable(
	'UserOAuth',
	{
		rowId: int().primaryKey({ autoIncrement: true }),
		userId: text()
			.notNull()
			.references(() => userId.userId),
		issuer: text().notNull(),
		issuedId: text().notNull(),
	},
	(table) => [
		index('UserOAuth_INDEX_userId').on(table.userId),
		index('UserOAuth_INDEX_issuedId').on(table.issuedId),
		uniqueIndex('UserOAuth_INDEX_issuer_issuedId').on(table.issuer, table.issuedId),
	],
);

export interface Database {
	UserId: Kyselify<typeof userId>;
	UserOAuth: Kyselify<typeof userAuthTable>;
}
