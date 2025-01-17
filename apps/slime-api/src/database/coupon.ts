import { DbCommunityReportedCouponTable } from "@/types/DbCommunityReportedCouponTable";
import { D1Query, sqlt } from "./db";
import { ReportCode } from "@slime/api-v1/request";

export class CouponCodeDatabase {
    private d1: D1Database;

    constructor(d1: D1Database) {
        this.d1 = d1;
    }

    reportCode(code: ReportCode) {
        /**
        db.insertInto("CommunityReportedCoupon")
            .values({
                code: code.code,
                description: code.des
            })
        */
    }

    async getCommunityCodeByHostname(hostname: string, options?: { excludeKnownStores?: boolean }): Promise<DbCommunityReportedCouponTable[]> {

        let query = sqlt.selectFrom("CommunityReportedCoupon")
            .selectAll()
            .where("hostname", "=", hostname)
            .where(eq => eq.or([
                eq("expireAt", "is", null), // 以後可能要限制一下太久沒人用的兌換碼要過濾掉
                eq("expireAt", ">", Date.now())
            ]));

        if (options?.excludeKnownStores)
            query = query.where("storeId", "=", null);

        const result = await new D1Query(this.d1).execute(query);
        return result.results ?? [];
    }

    async getCodeByStoreId(storeId: string) {
        const result = await new D1Query(this.d1).batch([
            sqlt.selectFrom("VerifiedCoupon")
                .selectAll()
                .where("storeId", "=", storeId)
                .where(eq => eq.or([
                    eq("expireAt", "is", null), // 以後可能要限制一下太久沒人用的兌換碼要過濾掉
                    eq("expireAt", ">", Date.now())
                ])),
            sqlt.selectFrom("CommunityReportedCoupon")
                .selectAll()
                .where("storeId", "=", storeId)
                .where(eq => eq.or([
                    eq("expireAt", "is", null), // 以後可能要限制一下太久沒人用的兌換碼要過濾掉
                    eq("expireAt", ">", Date.now())
                ]))
        ]);
        return {
            verified: result[0].results ?? [],
            community: result[1].results ?? [],
        };
    }

}