import { Kyselify } from 'drizzle-orm/kysely';
import { foreignKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// We only track what stores users have actively interacted with
// This allows to query the stores that the user have left data in
// If we want to delete the user from the database, we need to go to these stores to clean up all the datas
export const userInteractedStore = sqliteTable('UserInteractedStore', {
	storeId: text().primaryKey(),
});

export const submittedCode = sqliteTable(
	'SubmittedCode',
	{
		entryId: text().primaryKey(),
		storeId: text(),
	},
	(table) => [
		foreignKey({
			name: 'SubmittedCode_storeId_FK',
			columns: [table.storeId],
			foreignColumns: [userInteractedStore.storeId],
		})
			.onDelete('restrict')
			.onUpdate('cascade'),
	],
);

export interface UserDb {
	UserInteractedStore: Kyselify<typeof userInteractedStore>;
}
