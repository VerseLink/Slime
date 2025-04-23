import { Page, PageDocument } from '.';
import { PageInfo, ApplyCodeResult, VariantProductDetail, ParsableData, Price, SuccessAppliedResult } from './interface';
import { SlimeScript } from './SlimeScript';

export type ParsedDiscountResult =
	| { success: false; failureReason: string; }
	| { success: true; successReason: string; category: SuccessAppliedResult[] }
	| { success: undefined };

export abstract class SlimeScriptBase implements SlimeScript {
	protected page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	abstract resetDiscountOnce(document: PageDocument): Promise<boolean>;
	abstract applyDiscountOnce(document: PageDocument, code: string): Promise<boolean>;
	abstract getCurrentCartPrice(document: PageDocument): Promise<ParsableData<Price> | undefined>;
	abstract getDiscountResult(document: PageDocument, originalPrice: ParsableData<Price> | undefined, currentPrice: ParsableData<Price> | undefined): Promise<ParsedDiscountResult>;

	abstract getPageInfo(): Promise<PageInfo>;

    async #setResult(document: PageDocument, code: string, originalPrice: ParsableData<Price> | undefined, discountCallback: (data: ApplyCodeResult) => Promise<void>) {
        const currentPrice = await this.getCurrentCartPrice(document);
        const result = await this.getDiscountResult(document, originalPrice, currentPrice);
        if (result.success) {
            await discountCallback({
                originalPrice,
                currentPrice,
                code,
                success: true,
                successText: result.successReason,
                category: result.category,
            });
            return;
        }
        if (result.success == undefined) {
            await discountCallback({
                success: undefined,
                code,
                originalPrice,
                currentPrice,
            });
            return;
        }
        await discountCallback({
            originalPrice,
            currentPrice,
            code,
            success: false,
            failureText: result.failureReason,
        });
    }

	async applyDiscount(
		codes: string[],
		discountCallback: (data: ApplyCodeResult) => Promise<void>,
	): Promise<void> {
		const document = await this.page.getDocumentSnapshot();
		for (let code of codes) {
			const originalPrice = await this.getCurrentCartPrice(document);
			if (!await this.applyDiscountOnce(document, code)) {
                return;
            }
            await this.#setResult(document, code, originalPrice, discountCallback);
            await this.resetDiscountOnce(document);
		}
	}

	// overridable
	abstract onSelectProduct(callback: (product: VariantProductDetail) => Promise<void> | void): Promise<void> | void;
}
