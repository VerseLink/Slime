import { z } from "zod";
import { DbTableSchema } from "@slime/util";

export const DbCommunityReportedCouponTable = new DbTableSchema("CommunityReportedCoupon",
    z.object({
        id: z.string(),
        type: z.literal("coupon").or(z.literal("redeem")),
        storeId: z.string().nullable(),
        urlPath: z.string(),
        hostname: z.string(),
        code: z.string(),
        metadata: z.string(),
        description: z.string().nullable(),
        condition: z.string().nullable(),
        reportAt: z.number(),
        expireAt: z.number(),
    })
);

export type DbCommunityReportedCouponTable = z.infer<typeof DbCommunityReportedCouponTable.schema>;