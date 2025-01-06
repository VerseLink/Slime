export type DbCouponTable = {
    Id: string,
    Domain: string,
    PathRegex: string | null,
    Coupon: string,
    CouponContent: string,
    Conditions: string,
    DiscoveredAt: number,
    ExpireAt: number | null,
};

export namespace DbCouponTable {
    export const TableName = "CouponTable";
}