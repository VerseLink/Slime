import { fromSqlite } from '@slime/cf-sqlite';
import { Kyselify } from 'drizzle-orm/kysely';
import {
	int,
	text,
	sqliteTable,
	index,
	uniqueIndex,
	foreignKey,
	AnySQLiteColumn,
	check,
	integer,
} from 'drizzle-orm/sqlite-core';

export const storeUrlRule = sqliteTable("StoreUrlRule", {
    entryId: integer().primaryKey({ autoIncrement: true }),
    
    storeId: text().notNull(),
    
    // 網站Url使用的片段，譬如 shop.google.com/nexus/phone-model-123 
    // 而這個商店只存在在 shop.google.com/nexus 下的話，那只有 shop.google.com/nexus 才會被這邊儲存
    urlRegex: text().notNull(),

    // 儲存網站域名 (例如如果是 shop.google.com/product/1234，那 google.com 會被儲存)
    domain: text().notNull(),
});

export const storeId = sqliteTable("StoreId", {
    storeId: text().primaryKey()
});

export interface SlimeDb {
    StoreUrlRule: Kyselify<typeof storeUrlRule>;
    StoreId: Kyselify<typeof storeId>;
}

export const sqlt = fromSqlite<SlimeDb>();