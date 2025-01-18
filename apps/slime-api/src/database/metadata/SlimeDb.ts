import { fromDb } from "..";
import { StoreMetadataTable } from "./StoreMetadataTable";

export interface SlimeDatabase {
    StoreMetadata: StoreMetadataTable;
}

export const sqlt = fromDb<SlimeDatabase>();