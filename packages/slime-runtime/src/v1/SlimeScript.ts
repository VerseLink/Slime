import { PageInfo, ApplyCodeResult, VariantProductDetail } from "./interface";

export type SlimeScript = {
    /** Get's any useful information on the current page */
    getPageInfo(): Promise<PageInfo> | PageInfo;

    /** Apply's an array of discounts, invoke the callback once the discount is applied. Throw an exception if the page couldn't apply a discount */
    applyDiscount(codes: string[], discountCallback: (data: ApplyCodeResult) => Promise<void>): Promise<void> | void;

    /** Fires the callback when a user clicks on a product that doesn't trigger location change */
    onSelectProduct(callback: (product: VariantProductDetail) => Promise<void> | void): Promise<void> | void;
};
