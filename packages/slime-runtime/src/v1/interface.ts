import { ISOCurrency } from "../currency";

export type PageInfo = {
    /** Describes if this page can apply discount onto it, usually a checkout page or a redeeem page */
    canApplyDiscount: boolean;
    /** Describes the product this page contains, undefined if not supported or not a product page */
    productInfo?: GeneralProductInfo;
    /** Is the user logged in */
    isLoggedIn?: boolean;
}

export type ProductInfo = {
    title?: string;
    id?: string;
    image?: string | string[];
    description?: string | string[];
    reviews?: ParsableData<number>;
    /** The remaining stock of the item */
    stocks?: ParsableData<number>;
    /** The current price after discount */
    price?: ParsableData<Price>;
    /** Does the website claim the price was discounted? If so what was the original price */
    originalPrice?: ParsableData<Price>;
    priceRange?: {
        low: ParsableData<Price>;
        high: ParsableData<Price>;
    };
    aggregateRating?: {
        bestRating?: number;
        worstRating?: number;
        ratingCount?: ParsableData<number>;
        ratingValue?: ParsableData<number>;
    };
}

export type GeneralProductInfo = ProductInfo & {
    variants?: VariantProductDetail[];
}

export type VariantProductDetail = {
    // for example ["white socks", "short"] or "white pants"
    option?: string | string[];
    description?: string;
    price?: ParsableData<Price>;
}

export type VariantProductInfo = ProductInfo & {
    variant?: VariantProductDetail;
}

export type Price = {
    rawText: string;
    currency?: ISOCurrency;
    currencyPart?: string;
    amountPart?: number;
}

export type ParsableData<T> = {
    raw: string | string[];
    parsed?: T;
}

export type ApplyCodeResult = {
    originalPrice?: ParsableData<Price>;
    currentPrice?: ParsableData<Price>;
    code: string;
} & (
    | { 
        success: true; 
        successText: string | string[];
        category: SuccessAppliedResult[];
         // if it's only redeem code
        content?: ParsableData<{
            description: string;
            count?: number;
        }>[];
    }
    | {
        success: false;
        failureText: string | string[];
        failureReason?: {
            dollarMinimum?: number | boolean;
            newComersOnly?: boolean;
            specificItemsOnly?: boolean;
        };
    }
    // Undefined means we don't know if the code is valid or not, but we can still apply it
    | {
        success: undefined;
    }
)

export type SuccessAppliedResult = "percent-off" | "dollar-off" | "free-shipping" | "bogo" | "free-items";
export type FailureReason = "new-comers-only" | "dollarMinimum";