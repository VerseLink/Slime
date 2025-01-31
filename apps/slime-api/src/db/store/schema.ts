import { sql } from 'drizzle-orm';
import { Kyselify } from 'drizzle-orm/kysely';
import { text, sqliteTable, index, foreignKey, check, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const interactedUser = sqliteTable('interactedUser', {
	userId: text().primaryKey(),
	type: text(), // "guest" or "user" (moderator / admin are also user!)
});

export const coupon = sqliteTable(
	'Coupon',
	{
		entryId: text().primaryKey(),
		type: text().notNull(), // "coupon" or "redeem"
		source: text().notNull(), // "community" or "verified" or "vendor" etc
		code: text().notNull(),

		metadata: text(),
		description: text(),
		conditions: text(),
		createdAt: integer().notNull(),
		updatedAt: integer().notNull(),
		expireAt: integer(),
	},
	(table) => [
		// 確保類別是 coupon 或 redeem
		index('Coupon_expireAt_IDX').on(table.expireAt),
		index('Coupon_code_idx').on(table.code),
		index('Coupon_source_idx').on(table.source),
	],
);

export const reportedByUser = sqliteTable(
	'ReportedByUser',
	{
		entryId: text().primaryKey(),
		userId: text().notNull(),
		urlPath: text(), // note this is still required if it was reported by community members, not a requirement for official users
		hostname: text(),
	},
	(table) => [
		foreignKey({ name: 'ReportedByUser_entryId_fk', columns: [table.entryId], foreignColumns: [coupon.entryId] }),
		foreignKey({ name: 'ReportedByUser_userId_fk', columns: [table.userId], foreignColumns: [interactedUser.userId] }),
	],
);

// There's something poetic about user using codes that were used by users.
export const couponUsedByUser = sqliteTable(
	'CouponUsedByUser',
	{
		id: text().primaryKey(),
		entryId: text().notNull(),
		userId: text().notNull(),
		usedAt: integer().notNull(),

		// the result metadata, in json format, contains data like saved?: { currency: string, ammount: number }
		// null if the code applied failed
		result: text(),
	},
	(table) => [
		foreignKey({ name: 'CouponUsedByUser_userId_fk', columns: [table.entryId], foreignColumns: [interactedUser.userId] }),
	],
);

// User id is hashed so we the user is logged as visited anonymously
export const visitedByUser = sqliteTable('VisitedByUser', {
	id: text().primaryKey(),
	userIdHash: text().notNull(),
	visitedAt: integer().notNull(),

	// contains json data of the visitors, like city, regions, country, colo, asn etc
	// no IPs will be logged here, only location data to understand where the location is coming from
	visitorData: text(),
});

export const couponUserRating = sqliteTable(
	'CouponUserRating',
	{
		id: text().primaryKey(),
		entryId: text().notNull(),
		userId: text().notNull(),
		rating: integer().notNull(),
		ratedAt: integer().notNull(),
	},
	(table) => [
		check('rating_check', sql`${table.rating} = 1 OR ${table.rating} = -1`),
		uniqueIndex('rating_entryId_userId_idx').on(table.entryId, table.userId),
		foreignKey({ name: 'rating_entryId_fx', columns: [table.entryId], foreignColumns: [coupon.entryId] }),
		foreignKey({ name: "rating_userId_fx", columns: [table.userId], foreignColumns: [interactedUser.userId] })
	],
);

// Allow users to report the a coupon as offensive etc, a entry that has too much report would be shadow banned for a bit
// until the reports are resolved
// Only registered account are allowed to report
export const couponUserFlaggedReport = sqliteTable(
	'CouponUserFlaggedReport',
	{
		id: text().primaryKey(),
		entryId: text().notNull(),
		// who reported it
		userId: text().notNull(),
		// an enum for reported category,
		reportedCategory: text(),
		reportedReason: text().notNull(),
	},
	(table) => [
		uniqueIndex('flag_entryId_userId_idx').on(table.entryId, table.userId),
		foreignKey({ name: 'flag_entryId_fx', columns: [table.entryId], foreignColumns: [coupon.entryId] }),
		foreignKey({ name: "flag_userId_fx", columns: [table.userId], foreignColumns: [interactedUser.userId] })
	],
);

export interface StoreDb {
	Coupon: Kyselify<typeof coupon>;
	CouponReportedBy: Kyselify<typeof reportedByUser>;
	CouponUsedByUser: Kyselify<typeof couponUsedByUser>;
	CouponUserRating: Kyselify<typeof couponUserRating>;
	CouponUserFlaggedReport: Kyselify<typeof couponUserFlaggedReport>;
	VisitedByUser: Kyselify<typeof visitedByUser>;
}
