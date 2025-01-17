import { DbCommunityReportedCouponTable } from "@/types/DbCommunityReportedCouponTable";
import { D1Query, sqlt } from ".";
import { ReportCode } from "@slime/api-v1/request";
import { UserOrAnonymousId } from "@/types/UserOrAnonymousId";

export class CouponCodeDatabase {
    private d1: D1Database;

    constructor(d1: D1Database) {
        this.d1 = d1;
    }

    async addCommunityCode(code: ReportCode, reportBy: UserOrAnonymousId) {
        switch(code.type) {
            case "redeem":

            case "coupon":

        }
        /**
        db.insertInto("CommunityReportedCoupon")
            .values({
                code: code.code,
                description: code.des
            })
        */
    }

    async addVerifiedCode() {

    }

    // 更新官方的優惠碼
    // 因為社群回報的優惠碼是 "回報" 我們不打算讓他們更動
    async updateVerifiedCode() {

    }

    async removeCommunityCodeById(id: string) {

    }

    async removeVerifiedCodeById(id: string) {

    }

    // 回報使用者使用了一個Community Code
    async usedCommunityCode() {

    }

    // 回報使用者使用了一個Verified Code
    async useVerifiedCode() {

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