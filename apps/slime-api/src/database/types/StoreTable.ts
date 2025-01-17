import { z } from "zod";

export const StoreSchema = z.object({
    storeId: z.string(),
    baseUrlPart: z.string(),
    domain: z.string()
});

export type StoreTable = z.infer<typeof StoreSchema>;
