import { z } from "zod";

export const StoreMetadataSchema = z.object({
    storeId: z.string(),
    urlRegex: z.string(),
    domain: z.string()
});

export type StoreMetadataTable = z.infer<typeof StoreMetadataSchema>;
