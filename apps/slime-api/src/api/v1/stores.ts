import { AutoRouter, IRequest, StatusError } from 'itty-router';
import { ApiResponse, ArrayUtil } from '@/util';
import { CouponCodeInfo, StoreListItem, RedeemCodeInfo, StoreResource } from '@slime/api-v1/response';
import { StoreMetadataDatabase } from '@/db/slime-d1/StoreMetadata';
import { UnknownStoreId } from '@/db/store';
import { hono } from '@/api/hono';
import { success } from '.';

export const router = hono();

function getDomainFromQuery(domainQuery: string | string[] | undefined) {
	const domainUriEncoded = ArrayUtil.lastOrSingle(domainQuery);
	if (domainUriEncoded == null) throw new StatusError(400, "Bad request: 'domain' search params missing");
	return decodeURIComponent(domainUriEncoded);
}

// List stores associated by the root domain
router.get('stores/list', async (context) => {
	const { req, env } = context;
	// query database to get the domain
	const domain = getDomainFromQuery(req.queries('domain'));
	const db = new StoreMetadataDatabase(env.SLIME_DB);
	const stores = await db.getStoresByDomain(domain);

	return success(
		context,
		stores.map((store) => ({
			storeId: store.storeId,
			urlPart: store.urlRegex,
		})),
	);
});

// Get a unsupported store by the domain, this allows people to report coupon from a website
// but not neccessarily that we support this website
router.get('stores/unknown', async (context) => {
	const { req, env } = context;
	const hostname = getDomainFromQuery(req.queries('domain'));

	const db = env.STORE_DURABLE.get(env.STORE_DURABLE.idFromName(UnknownStoreId));
	const coupons = await db.getCommunityCode({ matchHostname: hostname, expired: true });

	return success(context, {
		supportKind: 'unsupported',
		coupons: coupons
			.values()
			.map((coupon): CouponCodeInfo | RedeemCodeInfo | undefined => {
				switch (coupon.type) {
					case 'coupon':
						return {
							type: 'coupon',
							id: coupon.couponId,
							code: coupon.code,
							// usedByCount: , // unsupported
							// lastUsedAt: , // unsupported
							// userRating: ,
							// urlRegex: ,
							expireAt: coupon.expireAt !== null ? new Date(coupon.expireAt) : undefined,
							sources: [], // unsupported
							description: coupon.description != null ? JSON.parse(coupon.description) : undefined,
							metadata: coupon.metadata,
						} satisfies CouponCodeInfo;
					case 'redeem':
						return {
							type: 'redeem',
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
			})
			.filter((x) => x != null)
			.toArray(),
	});
});

// StoreId must be 8 characters +
router.get('stores/id/:storeId', async (context) => {
	const storeId = context.req.param("storeId");

	// TODO: Implement
	throw new Error('Not Implemented');
});
