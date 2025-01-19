import { z } from "zod";
import { nameof } from "./database";

export const CommunityCouponSchema = z.object({
    couponId: z.string(),
    type: z.literal("coupon").or(z.literal("redeem")),
    storeId: z.string().nullable(),
    userId: z.string().nullable(),
    sessionId: z.string().nullable(),
    urlPath: z.string(),
    hostname: z.string(),
    code: z.string(),
    metadata: z.string().nullable(),
    description: z.string().nullable(),
    conditions: z.string().nullable(),
    reportAt: z.number(),
    expireAt: z.number().nullable(),
});

export type CommunityCouponTable = z.infer<typeof CommunityCouponSchema>;
export const CommunityCoupon = nameof(CommunityCouponSchema);