import { DbTableSchema } from "@slime/util";
import { z } from "zod";

export const DbStoreTable = new DbTableSchema("StoreTable", 
    z.object({
        storeId: z.string(),
        urlRegex: z.string(),
        domain: z.string()
    })
);

export type DbStoreTable = z.infer<typeof DbStoreTable.schema>;
