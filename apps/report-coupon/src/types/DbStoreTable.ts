import { DbTableSchema } from "@slime/util";
import { z } from "zod";

export const DbStoreTable = new DbTableSchema("StoreTable", 
    z.object({
        storeId: z.string(),
        baseUrlPart: z.string(),
        domain: z.string()
    })
);

export type DbStoreTable = z.infer<typeof DbStoreTable.schema>;
