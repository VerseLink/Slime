import { ArrayUtil } from "@/util";
import { D1Query, sqlt } from ".";

export class StoreDatabase {
    private d1: D1Database;

    constructor(d1: D1Database) {
        this.d1 = d1;
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
                sqlt.selectFrom("Store")
                    .selectAll()
                    .where("domain", "=", domain)
            )
            .then(res => res.results ?? []);
    }

    async getStoreCouponById(id: string) {
        return await new D1Query(this.d1)
            .execute(
                sqlt.selectFrom("Store")
                    .selectAll()
                    .where("storeId", "=", id)
                    .limit(1)
            )
            .then(res => ArrayUtil.singleOrDefault(res.results, null));
    }

}