import { AutoRouter, IRequest, StatusError } from "itty-router";
import { D1QB } from "workers-qb";
import { DbStoreTable } from "@/types/DbStoreTable";
import { DbCommunityReportedCouponTable } from "@/types/DbCommunityReportedCouponTable";
import { D1Query, sqlt } from "./db";

export class StoreDatabase {
    private d1: D1Database;

    constructor(d1: D1Database) {
        this.d1 = d1;
    }

    async createStore() {
        // TODO: Implement
        throw new Error("Not Implemented");
    }

    async queryStoresByDomain(domain: string) {
        return await new D1Query(this.d1)
            .execute(
                sqlt.selectFrom("Store")
                    .selectAll()
                    .where("domain", "=", domain)
            )
            .then(res => res.results ?? []);
    }

    async queryStoreCouponById(id: string) {
        // TODO: Implement
        throw new Error("Not Implemented");
    }

}