import { z } from "zod";
import { DbTableSchema } from "@slime/util";

export const DbVerifyCouponTable = new DbTableSchema("CommunityReportedCoupon",
    z.object({
        couponId: z.string(),
        type: z.literal("coupon").or(z.literal("redeem")),
        storeId: z.string(),
        code: z.string(),
        metadata: z.string(),
        description: z.string().nullable(),
        conditions: z.string().nullable(),
        reportAt: z.number(),
        expireAt: z.number().nullable(),
    })
);

export type DbVerifyCouponTable = z.infer<typeof DbVerifyCouponTable.schema>;