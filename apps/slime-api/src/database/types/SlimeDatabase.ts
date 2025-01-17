import { CommunityReportedCouponTable } from "./CommunityReportedCouponTable";
import { StoreTable } from "./StoreTable";
import { VerifiedCouponTable } from "./VerifyCouponTable";

export interface SlimeDatabase {
    VerifiedCoupon: VerifiedCouponTable;
    CommunityReportedCoupon: CommunityReportedCouponTable;
    Store: StoreTable;
}
