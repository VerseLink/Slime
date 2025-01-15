import { CouponCodeMetadata } from "@/request/ReportCodeRequest";
import { ApiQueryResponse } from "./ApiQueryResponse";
export type OfferCodeInfo = CouponCodeInfo | RedeemCodeInfo;

type OfferSource =
    {
        modifiedAt: number;
    }
    & (
        { type: "manual"; }
        | {
            type: "community";
            user: {
                id: string;
                name: string;
            }
        } 
        | {
            type: "services";
            service: "FMTC" | "CJ" | "IR" | "unknown";
        }
    );

type OfferBase = {

    /** A unique id representing the code / description */
    id: string;

    code: string;

    /** How many people have used this code */
    usedByCount?: number;

    /** When the code was last used */
    lastUsedAt?: number;

    /** The community user rating, we may inflate this sometimes if people are actively using it without much dislike */
    userRating?: number;

    urlRegex?: string;
    expireAt?: Date;
    sources: OfferSource[];
}

export type CouponCodeInfo = OfferBase & {
    type: "coupon";

    /** The description to be displayed to user */
    description?: string;

    metadata: CouponCodeMetadata & { version: 1 };
}

export type RedeemCodeInfo = OfferBase & {
    type: "redeem";
    redeemItems: string | { 
        item: string;
        imageUrl?: string;
        count: string;
    }[];
}