import { ApiQueryResponse } from "./ApiQueryResponse";
import { OfferCodeInfo } from "./OfferCode";
import { StoreSupportKind } from "./StoreSupportKind";

export type QueryStoreByIdResponse = ApiQueryResponse<StoreResource>;

type StoreResource = UnsupportedStoreResource | RecognizedStoreResource;

/**
 * Represents unsupported store. We do not recognize this store, but community has reported code for the domain.
 * 我們不認得這個商家，但是有人有回報優惠碼，因此我們依然會顯示能夠使用的優惠碼。
 */
type UnsupportedStoreResource = {
    supportKind: StoreSupportKind.Unsupported;
    coupons: OfferCodeInfo[];
}

/**
 * We know which domains are recognized are stores! But we are unable to apply the coupon automatically at this moment.
 * No rewards, no automatic apply coupon
 * 最基礎的支持，我們認得這個商家！但是我們沒辦法自動使用這些優惠碼。
 */
type RecognizedStoreResource = {
    id: string;
    name: string;
    supportKind: StoreSupportKind.Recognized;
    coupon: OfferCodeInfo[];
}