import { AutoRouter, IRequest, StatusError } from "itty-router";
import { D1QB } from "workers-qb";
import { DbStoreTable } from "@/types/DbStoreTable";
import { DbCommunityReportedCouponTable } from "@/types/DbCommunityReportedCouponTable";

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
        const { tableName, field } = DbStoreTable;

        const qb = new D1QB(this.d1);
        const result = await qb.fetchAll<DbStoreTable>({
            tableName: tableName,
            where: {
                conditions: `${field.domain} = ?1`,
                params: domain
            }
        }).execute();

        if (!result.success)
            throw new StatusError(500, "Database query error");

        return result.results ?? [];
    }

    async queryStoreCouponById(id: string) {
        // TODO: Implement
        throw new Error("Not Implemented");
    }

    async queryCouponByHostname(domain: string) {
        const { tableName, field } = DbCommunityReportedCouponTable;

        const qb = new D1QB(this.d1);
        const result = await qb.fetchAll<DbCommunityReportedCouponTable>({
            tableName: tableName,
            where: {
                conditions: [`${field.hostname} = ?1`, `${field.storeId} = ?2`],
                params: [domain, null]
            }
        }).execute();

        if (!result.success)
            throw new StatusError(500, "Database query error");

        return result.results ?? [];
    }
}