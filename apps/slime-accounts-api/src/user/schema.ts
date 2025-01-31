import { Kyselify } from 'drizzle-orm/kysely';
import { int, text, sqliteTable, index, uniqueIndex, foreignKey, AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

// Run the following command to initiate migration
// npx drizzle-kit generate --config=drizzle-user-do.config.ts

export const jwtId = sqliteTable('JwtId', {
    jti: text().primaryKey().notNull(),
    initJti: text().notNull(),
    fromJti: text().references((): AnySQLiteColumn => jwtId.jti, { onDelete: "set null", onUpdate: "cascade" }),
    issuedAt: int().notNull(),
    expiresAt: int().notNull(),
    metadata: text(),
}, table => [
    uniqueIndex("JwtId_fromJti_idx").on(table.fromJti),
    index("JwtId_initJti_idx").on(table.initJti),
    index("JwtId_expireAt_idx").on(table.expiresAt)
]);

// A table for dedicated services
// Kind of like YouTube <--> Google, without the need of OAuth
// OAuth will need another table
export const serviceClaims = sqliteTable("ServiceClaims", {
    service: text().primaryKey().notNull(),
    claims: text(),
})

export interface UserDoSqliteDB {
	JwtId: Kyselify<typeof jwtId>;
    ServiceClaims: Kyselify<typeof serviceClaims>;
}
