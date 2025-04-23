import { ArrayUtil } from "@slime/util";
import { sqlt } from "./schema";
import { D1Query } from "@slime/cf-sqlite";

export class StoreMetadataDatabase {
    private d1: D1Database;

    constructor(d1: D1Database) {
        this.d1 = d1;
    }

    async matchStoreByUrl(url: string): Promise<boolean> {

    }

    async createStore() {
        // TODO: Implement
        throw new Error("Not Implemented");
    }

    async removeStoreById(id: string) {

    }

    async updateStore() {
        
    }

    async getStoresByDomain(domain: string) {
        return await new D1Query(this.d1)
            .execute(
                sqlt.selectFrom("StoreUrlRule")
                    .selectAll()
                    .where("domain", "=", domain)
            )
            .then(res => res.results ?? []);
    }

    async getStoreCouponById(id: string) {
        return await new D1Query(this.d1)
            .execute(
                sqlt.selectFrom("StoreUrlRule")
                    .selectAll()
                    .where("storeId", "=", id)
                    .limit(1)
            )
            .then(res => ArrayUtil.singleOrDefault(res.results, null));
    }

}