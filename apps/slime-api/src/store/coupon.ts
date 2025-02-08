import { z } from 'zod';
import { CouponCodeMetadata, CouponCodeMetadataSchema, RedeemCodeMetadata, RedeemCodeMetadataSchema } from './metadata';

export const addCouponSchema = z
	.discriminatedUnion('type', [
		z.object({
			type: z.literal('coupon'),
			metadata: CouponCodeMetadataSchema,
		}),
		z.object({
			type: z.literal('redeem'),
			metadata: RedeemCodeMetadataSchema,
		}),
	])
	.and(
		z.object({
			code: z.string(),
			description: z.string().optional(),
			expireAt: z.number(),
			reportedUrl: z.string().url(),
			restrictions: z.string().optional(),
		}),
	);

export type AddCoupon = z.infer<typeof addCouponSchema>;

export const checkoutCouponSchema = z
	.object({
		currency: z.string().optional(),
		totalAmount: z.number().positive(),
		appliedCoupons: z
			.object({
				entryId: z.string(),
				savedAmount: z.number().positive(),
				elected: z.boolean(),
			})
			.array()
			.refine((items) => items.filter(x => x.elected).length <= 1),
	})
	.refine((item) => item.appliedCoupons.every((applied) => item.totalAmount > applied.savedAmount))

export type UserCheckout = z.infer<typeof checkoutCouponSchema>;

export type CouponSource = 'community' | 'verified' | 'vendor';
export type CouponReviewedStatus = 'none' | 'reviewed-filter' | 'reviewed-auto' | 'approved';

export type CouponQueryResult = {
	id: string;
	source: CouponSource;
	reviewed: CouponReviewedStatus;
	code: string;

	description?: string;
	restrictions?: string;
	createdAt: number;
	expireAt?: number;

	rating: {
		total: number;
		likes: number;
	};
	usage: {
		total: number;
		successCount: number;
		lastSaved?: {
			usedAt: number;
			amount: number;
			currency?: string;
		};
	};
} & (
	| {
			type: 'coupon';
			metadata: CouponCodeMetadata;
	  }
	| {
			type: 'redeem';
			metadata: RedeemCodeMetadata;
	  }
);

export type ReportCouponAbuseCategory = ReportCouponAbuse["category"];

export const reportCouponAbuseSchema = z.object({
	entryId: z.string(),
	category: z.enum(['spam-fraud', 'not-working', 'offensive', 'profanity', 'off-topic', 'other']),
	reason: z.string(),
});

export type ReportCouponAbuse = z.infer<typeof reportCouponAbuseSchema>;