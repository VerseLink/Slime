import { CommunityReportedCouponTable } from "@/database/store/CommunityReportedCouponTable";
import { VerifiedCouponTable } from "./VerifiedCouponTable";

export interface StoreDatabase {
    CommunityReportedCoupon: CommunityReportedCouponTable,
    VerifiedCoupon: VerifiedCouponTable;
}
