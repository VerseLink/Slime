import { sql } from 'drizzle-orm';
import { Kyselify } from 'drizzle-orm/kysely';
import { text, sqliteTable, index, foreignKey, check, integer, uniqueIndex, real } from 'drizzle-orm/sqlite-core';

export const interactedUser = sqliteTable('InteractedUser', {
	userId: text().primaryKey(),
	type: text(), // "guest" or "user" (moderator / admin are also user!)
});

export const coupon = sqliteTable(
	'Coupon',
	{
		entryId: text().primaryKey(),
		type: text({ enum: ['coupon', 'redeem'] }).notNull(), // "coupon" or "redeem"
		source: text({ enum: ['community', 'verified', 'vendor'] }).notNull(), // "community" or "verified" or "vendor" etc

		// "none": the review process was not initiated
		// "reviewed-filter": the review process was performed by a simple filter (such as profanity)
		// "reviewed-auto": reviewed perform by an LLM, ML model or any automatic system), if the reviewed state is reviewed-ai, the table CouponReviewedByAI should also have reason's and confidence
		// "approved": A human manually approved the code or the source is verified or trusted vendor
		reviewed: text({ enum: ['none', 'reviewed-filter', 'reviewed-auto', 'approved'] }).notNull(),
		code: text().notNull(),

		metadata: text(),
		description: text(),
		restrictions: text(),
		createdAt: integer().notNull(),
		expireAt: integer(),
	},
	(table) => [
		// 確保類別是 coupon 或 redeem
		index('Coupon_expireAt_IDX').on(table.expireAt),
		index('Coupon_code_idx').on(table.code),
		index('Coupon_source_idx').on(table.source),
	],
);

export const couponDiscoveredByUser = sqliteTable(
	'CouponDiscoveredByUser',
	{
		id: text().primaryKey(),
		entryId: text().notNull(),
		userId: text().notNull(),
		urlPath: text(), // note this is still required if it was reported by community members, not a requirement for official users
		hostname: text(),
		updatedAt: integer().notNull(),
	},
	(table) => [
		foreignKey({
			name: 'CouponDiscoveredByUser_entryId_fk',
			columns: [table.entryId],
			foreignColumns: [coupon.entryId],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		foreignKey({
			name: 'CouponDiscoveredByUser_userId_fk',
			columns: [table.userId],
			foreignColumns: [interactedUser.userId],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	],
);

export const couponApprovedByUser = sqliteTable(
	'CouponApprovedByUser',
	{
		entryId: text().primaryKey(),
		approvedBy: text().notNull(),
		approvedAt: integer().notNull(), // if the type changed from community to verified, this shall not be null
	},
	(table) => [
		foreignKey({
			name: 'CouponDiscoveredByUser_entryId_fk',
			columns: [table.entryId],
			foreignColumns: [coupon.entryId],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		foreignKey({
			name: 'CouponDiscoveredByUser_userId_fk',
			columns: [table.approvedBy],
			foreignColumns: [interactedUser.userId],
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	],
);

export const checkoutUser = sqliteTable(
	'CheckoutUser',
	{
		id: text().primaryKey(),
		userIdHash: text().notNull(),
		checkoutAt: integer().notNull(),
		
		currency: text(),
		totalAmount: real().notNull()
	}
)

export const couponAppliedByUser = sqliteTable(
	'CouponAppliedByUser',
	{
		id: text().primaryKey(),
		checkoutId: text().notNull(),
		entryId: text().notNull(),
		savedAmount: real().notNull(),
		elected: integer({ mode: "boolean" }).notNull()
	},
	(table) => [
		foreignKey({ name: "CouponAppliedByUser_checkoutId_fk", columns: [table.checkoutId], foreignColumns: [checkoutUser.id] }),
		index('CouponAppliedByUser_entryId_idx').on(table.entryId),
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
		foreignKey({ name: 'rating_entryId_fx', columns: [table.entryId], foreignColumns: [coupon.entryId] })
			.onDelete('cascade')
			.onUpdate('cascade'),
		foreignKey({ name: 'rating_userId_fx', columns: [table.userId], foreignColumns: [interactedUser.userId] })
			.onDelete('cascade')
			.onUpdate('cascade'),
	],
);

// Allow users to report the a coupon as offensive etc, a entry that has too much report would be shadow banned for a bit
// until the reports are resolved
// Only registered account are allowed to report
export const reportCouponAbuse = sqliteTable(
	'ReportCouponAbuse',
	{
		id: text().primaryKey(),
		entryId: text().notNull(),
		// who reported it
		userId: text().notNull(),
		// an enum for reported category,
		category: text().notNull(),
		reason: text().notNull(),
	},
	(table) => [
		uniqueIndex('flag_entryId_userId_idx').on(table.entryId, table.userId),
		foreignKey({ name: 'flag_entryId_fx', columns: [table.entryId], foreignColumns: [coupon.entryId] })
			.onDelete('cascade')
			.onUpdate('cascade'),
		foreignKey({ name: 'flag_userId_fx', columns: [table.userId], foreignColumns: [interactedUser.userId] })
			.onDelete('cascade')
			.onUpdate('cascade'),
	],
);

export interface StoreDb {
	Coupon: Kyselify<typeof coupon>;
	CouponDiscoveredByUser: Kyselify<typeof couponDiscoveredByUser>;
	CouponAppliedByUser: Kyselify<typeof couponAppliedByUser>;
	CouponUserRating: Kyselify<typeof couponUserRating>;
	ReportCouponAbuse: Kyselify<typeof reportCouponAbuse>;
	CheckoutUser: Kyselify<typeof checkoutUser>;
	InteractedUser: Kyselify<typeof interactedUser>;
	VisitedByUser: Kyselify<typeof visitedByUser>;
}
