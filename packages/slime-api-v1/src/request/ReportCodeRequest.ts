import { z } from "zod";
import { CouponMetadataSchema } from "@/CouponMetadata";

export const ReportCodeRequestSchema = z.intersection(
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

export type ReportCodeRequest = z.infer<typeof ReportCodeRequestSchema>;
