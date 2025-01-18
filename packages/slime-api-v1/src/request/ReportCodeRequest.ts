import { z } from "zod";
import { CouponMetadataSchema } from "../CouponMetadata";

export const ReportCodeSchema = z.intersection(
    z.object({
        storeId: z.string().optional(),
        reportedUrl: z.string().url(),
        code: z.string(),
        coditions: z.string(),
        expireAt: z.number().optional()
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

export type ReportCode = z.infer<typeof ReportCodeSchema>;