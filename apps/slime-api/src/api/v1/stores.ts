import { AutoRouter, IRequest, StatusError } from "itty-router";
import { ApiResponse, ArrayUtil } from "@/util";
import { CouponCodeInfo, StoreListItem, RedeemCodeInfo, StoreResource } from "@slime/api-v1/response";
import { StoreMetadataDatabase } from "@/database/metadata/storeMetadata";
import { UnknownStoreId } from "@/database/store";

export const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: "/api/v1" });

function getDomainFromQuery(domainQuery: string | string[] | undefined) {
    const domainUriEncoded = ArrayUtil.lastOrSingle(domainQuery);
    if (domainUriEncoded == null)
        throw new StatusError(400, "Bad request: 'domain' search params missing");
    return decodeURIComponent(domainUriEncoded);
}

// List stores associated by the root domain
router.get("stores/list", async (request, env): Promise<StoreListItem[]> => {
    // query database to get the domain
    const domain = getDomainFromQuery(request.query.domain);
    const db = new StoreMetadataDatabase(env.SLIME_DB);
    const stores = await db.getStoresByDomain(domain);

    return stores.map(store => ({
        storeId: store.storeId,
        urlPart: store.urlRegex,
    }));

});

// Get a unsupported store by the domain, this allows people to report coupon from a website
// but not neccessarily that we support this website
router.get("stores/unknown", async (request, env): Promise<StoreResource> => {
    const hostname = getDomainFromQuery(request.query.hostname);

    const db = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(UnknownStoreId));
    const coupons = await db.getCommunityCode({ matchHostname: hostname, expired: true });

    return {
        supportKind: "unsupported",
        coupons: coupons.values().map((coupon): CouponCodeInfo | RedeemCodeInfo | undefined => {
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
                default:
                    console.error(`Found unsupported coupon type ${coupon.type}`, coupon);
                    return undefined;
            }
        }).filter(x => x != null).toArray()
    };
});

// StoreId must be 8 characters +
router.get("stores/id/:storeId", async (request, env): Promise<StoreResource> => {
    const storeId = request.params.storeId;

    // TODO: Implement
    throw new Error("Not Implemented");
})