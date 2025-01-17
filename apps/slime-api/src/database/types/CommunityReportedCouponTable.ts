import { z } from "zod";

export const CommunityReportedCouponSchema = z.object({
    couponId: z.string(),
    type: z.literal("coupon").or(z.literal("redeem")),
    storeId: z.string().nullable(),
    userId: z.string().nullable(),
    sessionId: z.string().nullable(),
    urlPath: z.string(),
    hostname: z.string(),
    code: z.string(),
    metadata: z.string(),
    description: z.string().nullable(),
    conditions: z.string().nullable(),
    reportAt: z.number(),
    expireAt: z.number().nullable(),
});

export type CommunityReportedCouponTable = z.infer<typeof CommunityReportedCouponSchema>;