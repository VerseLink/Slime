import { z } from "zod";

export const StoreSchema = z.object({
    storeId: z.string(),
    urlRegex: z.string(),
    domain: z.string()
});

export type StoreTable = z.infer<typeof StoreSchema>;
