import { Permission } from "#permission";
import { SlimeRoles, User } from "#user";
import { CouponSource } from "./coupon";

export type StoreBasicData = {
    type: "supported";
    storeId: string;
} | {
    type: "unknown";
    url: string;
    storeId: string;
}

export type StoreCodeData = {
    store: StoreBasicData;
    source?: CouponSource;
};

export type StoreCodePermission = 
    "list" |
    "report-abuse" |
    "report-usage" |
    "read-detail" |
    "audit" |
    "write" |
    "create" |
    "delete";

export const codePermission = new Permission<StoreCodeData, StoreCodePermission, User, SlimeRoles>({
    [Permission.base]: {
        "list": true,
        "report-usage": true,
        "report-abuse": true,
    },
    "user": {
        "list": true,
        "create": (_, action) => action.source === "community",
    },
    "moderator": {
        "list": true,
        "audit": true,
        "read-detail": true,
        "create": true,
        "delete": true,
    }
});

export type StorePermission = 
    "read" |
    "update" |
    "create" |
    "delete";

export const storePermission = new Permission<StoreBasicData, StorePermission, User, SlimeRoles>({
    [Permission.base]: {
        "read": true,
    },
    "user": {
        "read": true,
        "create": (_, action) => action.type === "unknown",
        "update": false, // In the future, we want to let store owners able to update their data
    },
    "moderator": {
        "read": true,
        "create": true,
        "update": true,
        "delete": true,
    }
});
