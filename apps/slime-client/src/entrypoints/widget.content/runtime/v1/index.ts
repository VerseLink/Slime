import { Dispatch, SetStateAction } from 'react';
import { SandboxRuntimeAdaptor, SandboxRuntimeEvent, SandboxRuntimeAdaptorBase } from '../../SandboxRuntimeAdaptor';
import { ApplyCodeResult, Page, PageDocument, PageInfo, ParsableData, Price, SlimeScript } from '@slime/runtime/v1';
import { RpcProvider } from '@slime/rpc';
import { RpcDocument } from './document';
import { PromiseObserver, PromiseSource } from '@/lib/PromiseSource';
import { ISOCurrency, ISOCurrencyToSymbol, SymbolToISOCurrency } from '@slime/runtime';

export default function (
	setter: Dispatch<SetStateAction<SandboxRuntimeAdaptor | null>>,
	client: RpcProvider<SlimeScript>,
) {
	setter(new SandboxRuntimeAdaptorV1(client));
	return {
		getDocumentSnapshot(): PageDocument {
			return new RpcDocument({ listeners: new Map() }) as unknown as PageDocument;
		},
		parsePrice(rawText: string, hintCurrency?: string): Price {
			const parsed = /([^\d.]*)([\d.,]+)/.exec(rawText);
			if (!parsed) {
				return { rawText };
			}
			const currencyPart = parsed[1].trim();
			const amountPart = parsed[2];
			let currencyCandidate = SymbolToISOCurrency.get(currencyPart);
			if (currencyCandidate && currencyCandidate.length !== 1) {
				currencyCandidate = undefined;
			}
			return {
				rawText,
				currency: currencyCandidate?.[0] ?? (ISOCurrencyToSymbol.has(hintCurrency as ISOCurrency) ? hintCurrency as ISOCurrency : undefined),
				currencyPart,
				amountPart: parseFloat(amountPart),
			};
		},
	} satisfies Page;
}

type Linked<TResult> = { result: TResult; next: PromiseSource<Linked<TResult>> };

class SandboxRuntimeAdaptorV1 extends SandboxRuntimeAdaptorBase {
	#client: RpcProvider<SlimeScript>;

	constructor(client: RpcProvider<SlimeScript>) {
		super();
		this.#client = client;
		this.#client.onSelectProduct((product) => {
			this.event.dispatchEvent(
				new CustomEvent('productselected' satisfies keyof SandboxRuntimeEvent, { detail: product }),
			);
		});
	}

	getPageInfo(): Promise<PageInfo> {
		return this.#client.getPageInfo();
	}

	async *applyCode(code: string[]) {
		let promise = new PromiseSource<Linked<ApplyCodeResult>>();
		let clientPromise = promise;
		const task = new PromiseObserver(
			this.#client.applyDiscount(code, async (result) => {
				let next = new PromiseSource<Linked<ApplyCodeResult>>();
				clientPromise.resolve({ result, next });
				clientPromise = next;
			}),
		);
		let loopPromise = promise;
		while (!task.isCompleted) {
			const { result, next } = await loopPromise.promise;
			yield result;
			loopPromise = next;
		}
	}
}
