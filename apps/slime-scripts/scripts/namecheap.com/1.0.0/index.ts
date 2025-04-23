/// <reference types="@slime/runtime/v1/global" />

import type { SlimeScriptMetadata } from '@slime/runtime';
import type {
	ApplyCodeResult,
	PageDocument,
	PageInfo,
	ParsableData,
	ParsedDiscountResult,
	Price,
	ProductInfo,
	VariantProductDetail,
} from '@slime/runtime/v1';

class Script extends SlimeScriptBase {

	async getPageInfo(): Promise<PageInfo> {
		const document = await this.page.getDocumentSnapshot();
		return {
			canApplyDiscount: /\/shoppingcart/i.test(document.location.pathname),
			isLoggedIn: (await document.querySelector('.gb-sign-up')) != null,
			productInfo: undefined, // namecheap is domain register, doesn't really have product info, so we don't support it
		} satisfies PageInfo;
	}

	async resetDiscountOnce(document: PageDocument) {
		const removeDiscount = await (document.querySelector('[data-e2e-id="sc-promo-remove-promo-btn"]') ??
			document.querySelector('.gb-sticky-cart a'));
		if (!removeDiscount || !(removeDiscount instanceof PageHTMLElement)) {
			return false;
		}
		await removeDiscount.click();
		return true;
	}

	async applyDiscountOnce(document: PageDocument, code: string): Promise<boolean> {
		const field = await document.querySelector('#promo-code');
		const button =
			(await document.querySelector('[data-e2e-id="sc-promo-apply-promo-btn"]')) ?? (await field?.nextElementSibling());
		if (!(field instanceof PageHTMLInputElement) || !(button instanceof PageHTMLButtonElement)) {
			return false;
		}
		await field.input(code);
		await button.click();
		return true;
	}

	async getCurrentCartPrice(document: PageDocument): Promise<ParsableData<Price> | undefined> {
		const orderTotal = await document.querySelector('[data-e2e-id="sc-order-total"]');
		if (!orderTotal || orderTotal.textContent == null) {
			return;
		}
		const currencyHint = await document.querySelector(
			'.gb-top-block__commerce-nav :not(.gb-cart) .gb-dropdown__toggle',
		);
		const rawText = [orderTotal.textContent];
		if (currencyHint?.textContent != null) {
			rawText.push(currencyHint.textContent);
		}
		return {
			raw: rawText,
			parsed: await this.page.parsePrice(orderTotal.textContent, currencyHint?.textContent ?? undefined),
		};
	}

	async getDiscountResult(document: PageDocument): Promise<ParsedDiscountResult> {
		const appliedMsg = await document.querySelector('[data-e2e-id="sc-notification-message"]');
		if (!appliedMsg || !appliedMsg.textContent) {
			return { success: undefined };
		}
		// ERROR: This coupon has expired or has already been applied to your account(s). Coupon code is not available. Please enter a valid promotion code.
		if (/error/i.test(appliedMsg.textContent)) {
			return { success: false, failureReason: appliedMsg.textContent };
		}
		// COUPON CODE SUCCESSFULLY APPLIED. Pricing for applicable products will be adjusted.
		if (/success/i.test(appliedMsg.textContent)) {
			return { success: true, successReason: appliedMsg.textContent, category: ["dollar-off"] };
		}
		return { success: undefined };
	}

	onSelectProduct(callback: (product: VariantProductDetail) => Promise<void> | void): Promise<void> { 
		return Promise.resolve();
	}
}

export default {
	runtime: {
		version: 1,
	},
	getScript(page) {
		return new Script(page);
	},
} satisfies SlimeScriptMetadata;
