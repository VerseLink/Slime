import { AutoRouter, IRequest, StatusError } from "itty-router";
import { ApiResponse, ArrayUtil } from "@/util";
import { CouponCodeInfo, QueryStoreByDomainResponse, QueryStoreByIdResponse, RedeemCodeInfo } from "@slime/api-v1";
import { StoreDatabase } from "@/database/store";

export const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: "/api/v1" });

function getDomainFromQuery(domainQuery: string | string[] | undefined) {
    const domainUriEncoded = ArrayUtil.lastOrSingle(domainQuery);
    if (domainUriEncoded == null)
        throw new StatusError(400, "Bad request: 'domain' search params missing");
    return decodeURIComponent(domainUriEncoded);
}

// List stores associated by the root domain
router.get("stores/list", async (request, env): Promise<QueryStoreByDomainResponse> => {
    // query database to get the domain
    const domain = getDomainFromQuery(request.query.domain);
    const db = new StoreDatabase(env.COUPON_DB);
    const stores = await db.queryStoresByDomain(domain);

    const response = stores.map(store => ({
        storeId: store.storeId,
        urlPart: store.baseUrlPart,
    }));

    return ApiResponse.success(response);
});

// Get a unsupported store by the domain, this allows people to report coupon from a website
// but not neccessarily that we support this website
router.get("stores/unknown", async (request, env): Promise<QueryStoreByIdResponse> => {
    const domain = getDomainFromQuery(request.query.domain);

    const db = new StoreDatabase(env.COUPON_DB);
    const coupons = await db.queryCouponByHostname(domain);

    return ApiResponse.success({
        supportKind: "unsupported",
        coupons: coupons.map(coupon => {
            switch(coupon.type) {
                case "coupon":
                    return {
                        type: "coupon",
                        id: coupon.couponId,
                        code: coupon.code,
                        // usedByCount: , // unsupported
                        // lastUsedAt: , // unsupported
                        // userRating: , 
                        // urlRegex: ,
                        expireAt: coupon.expireAt !== null ? new Date(coupon.expireAt) : undefined,
                        sources: [], // unsupported
                        description: coupon.description != null ? JSON.parse(coupon.description) : undefined,
                        metadata: coupon.metadata
                    } satisfies CouponCodeInfo;
                case "redeem": 
                    return {
                        type: "redeem",
                        id: coupon.couponId,
                        code: coupon.code,
                        // usedByCount: , // unsupported
                        // lastUsedAt: , // unsupported
                        // userRating: , 
                        // urlRegex: ,
                        expireAt: coupon.expireAt !== null ? new Date(coupon.expireAt) : undefined,
                        sources: [], // unsupported
                        redeemItems: coupon.description !== null ? JSON.parse(coupon.description) : undefined,
                    } satisfies RedeemCodeInfo;
            }
        })
    });
});

// StoreId must be 8 characters +
router.get("stores/id/:storeId", async (request, env): Promise<QueryStoreByIdResponse> => {
    const storeId = request.params.storeId;

    // TODO: Implement
    throw new Error("Not Implemented");
})