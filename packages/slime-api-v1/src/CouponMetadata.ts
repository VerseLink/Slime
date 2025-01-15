import { z } from "zod";

export const CouponMetadataSchema = z.object({
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

export type CouponCodeMetadata = z.infer<typeof CouponMetadataSchema>;