import { z } from "zod";

export const CouponCodeMetadataSchema = z.object({
    percentOff: z.number().optional(),
    dollarOff: z.number().optional(),
    dollarMinimum: z.number().optional(),
    noMinimum: z.boolean().optional(),
    products: z.string().optional(),
    freeShipping: z.boolean().optional(),
    newComersOnly: z.boolean().optional(),
    sitewide: z.boolean().optional(),
    freeGift: z.string().array().optional(),
    bogo: z.boolean().optional(),
    onlineOnly: z.boolean().optional(),
    exclusions: z.string().optional()
});

export type CouponCodeMetadata = z.infer<typeof CouponCodeMetadataSchema>;

export const RedeemCodeMetadataSchema = z.object({
    // how many times it can be used (normally 1)
    usage: z.number().optional(),
    newComersOnly: z.boolean().optional(),
    content: z.array(z.object({
        description: z.string(),
        count: z.number(),
    }))
});

export type RedeemCodeMetadata = z.infer<typeof RedeemCodeMetadataSchema>;
