import { z } from "zod";

const CouponMetadataSchema = z.object({
    percentOff: z.string().optional(),
    dollarOff: z.string().optional(),
    freeShipping: z.boolean().optional(),
    firstPurchase: z.boolean().optional(),
    sitewide: z.boolean().optional(),
    freeGift: z.string().array().optional(),
    bogo: z.boolean().optional(),
    onlineOnly: z.boolean().optional(),
    exclusions: z.string().array().optional()
});

const ReportCodeRequestSchema = z.intersection(
    z.object({
        storeId: z.string(),
        reportedUrl: z.string().url(),
        code: z.string(),
        restrictions: z.string(),
        expireAt: z.string().optional()
    }),
    z.discriminatedUnion("type", [
        z.object({
            type: z.literal("coupon"),
            description: z.string().optional(),
            metadata: CouponMetadataSchema.optional()
        }),
        z.object({
            type: z.literal("redeem"),
            redeemItems: z.union([
                z.string(),
                z.object({
                    item: z.string(),
                    count: z.number().positive(),
                    imageUrl: z.string().optional()
                }).array()
            ])
        })
    ])
);

export type CouponCodeMetadata = z.infer<typeof CouponMetadataSchema>;
export type ReportCodeRequestSchema = z.infer<typeof ReportCodeRequestSchema>;
