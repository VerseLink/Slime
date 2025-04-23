import { Price } from './interface';

export * from './interface';
export * from './SlimeScript';
export * from './SlimeScriptBase';
export type {} from "./global";

function throwRemoteTypeOnly() {
	throw new Error(
		'This type is a stub that can only be created from a remote source and cannot be created locally or directly.',
	);
}

function inhert(func: { new (): object }, inherit: { new (): object }) {
	Object.setPrototypeOf(func.prototype, inherit.prototype);
}

export interface Page {
	getDocumentSnapshot(): Promise<PageDocument> | PageDocument;
	parsePrice(rawText: string, hintCurrency?: string): Promise<Price> | Price;
}

export type PageElementAttribute = {
	value: string;
	index: number;
};

export type PageEventTarget = {
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions,
	): Promise<void>;
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions,
	): Promise<void>;

	dispatchEvent(eventType: string, eventInit?: EventInit): Promise<boolean>;
};

export const PageEventTarget = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageEventTarget };

type PageParentNode = PageEventTarget & {
	querySelector(selectors: string): Promise<PageElement | null>;
	querySelectorAll(selectors: string): Promise<PageElement[]>;
};

type EventTargetSpecialized<T> = {
	addEventListener<K extends keyof T>(
		type: K,
		listener: (ev: T[K]) => any,
		options?: boolean | AddEventListenerOptions,
	): void;
	addEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | AddEventListenerOptions,
	): Promise<void>;

	removeEventListener<K extends keyof T>(
		type: K,
		listener: (ev: T[K]) => any,
		options?: boolean | EventListenerOptions,
	): void;
	removeEventListener(
		type: string,
		listener: EventListenerOrEventListenerObject,
		options?: boolean | EventListenerOptions,
	): Promise<void>;
};

interface SnapshotThis {
	/** Get's a up-to-date snap shot of it's self */
	snapshot(): Promise<this>;
}

export type PageNode = SnapshotThis &
	PageEventTarget & {
		readonly baseURI: string;
		readonly nodeName: string;
		readonly nodeType: number;
		readonly nodeValue: string | null;
		readonly textContent: string | null;
		readonly isConnected: boolean;

		childNodes(): Promise<PageNode[]>;
		parentNode(): Promise<PageNode | null>;
		parentElement(): Promise<PageHTMLElement | null>;

		nextSibling(): Promise<PageNode | null>;
		previousSibling(): Promise<PageNode | null>;

		firstChild(): Promise<PageNode | null>;
		lastChild(): Promise<PageNode | null>;

		hasChildNodes(): Promise<boolean>;
	};

export const PageNode = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageNode };
inhert(PageNode, PageEventTarget);

export type PageLocation = {
	readonly href: string;
	readonly protocol: string;
	readonly host: string;
	readonly hostname: string;
	readonly port: string;
	readonly pathname: string;
	readonly search: string;
	readonly hash: string;
	snapshot(): Promise<PageLocation>;
	assign(url: string): Promise<void>;
	reload(): Promise<void>;
	replace(url: string): Promise<void>;
};

export type PageDocument = PageParentNode &
	EventTargetSpecialized<WindowEventMap> & {
		readonly title: string;
		readonly referrer: string;
		readonly documentURI: string;
		readonly characterSet: string;
		readonly hidden: boolean;
		readonly visibilityState: DocumentVisibilityState;
		readonly location: PageLocation;

		setCookie(cookie: string): Promise<void>;

		getElementById(id: string): Promise<PageHTMLElement | null>;

		// We decide not to support these functions because it returns a Live list of the elements,
		// however, in a RPC environment, it's not possible to keep the list live.
		//
		// getElementsByClassName(className: string): Promise<PageElement[]>;
		// getElementsByTagName(tagName: string): Promise<PageElement[]>;
	};

export const PageDocument = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageDocument };
inhert(PageDocument, PageNode);

export type PageElement = PageNode &
	PageParentNode &
	EventTargetSpecialized<ElementEventMap> & {
		readonly id: string;
		readonly className: string;
		readonly tagName: string;

		readonly attributes: Map<string, PageElementAttribute>;

		readonly innerHTML: string;
		readonly outerHTML: string;

		nextElementSibling(): Promise<PageElement | null>;
		previousElementSibling(): Promise<PageElement | null>;
		children(): Promise<PageElement[]>;
	};

export const PageElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageElement };
inhert(PageElement, PageNode);

export type PageHTMLElement = SnapshotThis &
	PageElement &
	EventTargetSpecialized<HTMLElement> & {
		readonly dataset: Record<string, string | undefined>;
		click(): Promise<void>;
		blur(): Promise<void>;
		focus(): Promise<void>;

		/**
		 * Simulates an user input, this diverts from the the usual HTMLElement because it acts as an helper function. Since setting value usually doesn't update React code.
		 */
		input(value: string | number, option?: PageHTMLElementInputOptions): Promise<void>;
	};

export const PageHTMLElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLElement };
inhert(PageHTMLElement, PageElement);

export interface PageHTMLElementInputOptions {
	/**
	 * Uses document.execCommand instead of event dispatching, useful if the default option doesn't work.
	 * However, since document.execCommand is marked as deprecated, it becomes a fallback option
	 */
	useLegacyExecCommand: boolean;

	/**
	 * Disables focus for the element being inputted. Usually modifying the input requires such field to be focused, set this to true if that's not desirable.
	 */
	noFocus: boolean;
}

type ValidableElement = {
	checkValidity(): Promise<boolean>;
	reportValidity(): Promise<boolean>;
};

type FormChildElement = ValidableElement & {
	willValidate: boolean;
	validity: ValidityState;
	validationMessage: string;

	form(): Promise<PageHTMLFormElement | null>;
};

export type PageHTMLFormElement = PageHTMLElement &
	ValidableElement & {
		submit(): Promise<void>;
		requestSubmit(): Promise<void>;
		reset(): Promise<void>;

		elements(): Promise<PageElement[]>;
	};

export const PageHTMLFormElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLFormElement };
inhert(PageHTMLFormElement, PageHTMLElement);

export type PageHTMLFieldSetElement = PageHTMLElement & FormChildElement;
export const PageHTMLFieldSetElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLFieldSetElement };
inhert(PageHTMLFieldSetElement, PageHTMLElement);

export type PageHTMLOutputElement = PageHTMLElement & FormChildElement;
export const PageHTMLOutputElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLOutputElement };
inhert(PageHTMLOutputElement, PageHTMLElement);

export type PageHTMLObjectElement = PageHTMLElement & FormChildElement;
export const PageHTMLObjectElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLObjectElement };
inhert(PageHTMLObjectElement, PageHTMLElement);

export type PageHTMLButtonElement = PageHTMLElement & FormChildElement;
export const PageHTMLButtonElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLButtonElement };
inhert(PageHTMLButtonElement, PageHTMLElement);

export type PageHTMLSelectElement = PageHTMLElement &
	FormChildElement & {
		options: PageHTMLOptionElement[];

		selectedIndex: number;
		selectedOptions: PageHTMLOptionElement[];

		setValue(value: string): Promise<void>;
	};

export const PageHTMLSelectElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLSelectElement };
inhert(PageHTMLSelectElement, PageHTMLElement);

export type PageHTMLOptionElement = PageHTMLElement & {
	defaultSelected: boolean;
	form(): Promise<PageHTMLFormElement | null>;
};

export const PageHTMLOptionElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLOptionElement };
inhert(PageHTMLOptionElement, PageHTMLElement);

export type PageHTMLInputElement = PageHTMLElement &
	FormChildElement & {
		defaultValue: string;
		list: PageHTMLDataListElement | null;
		checked: boolean;
		defaultChecked: boolean;
		indeterminate: boolean;

		// there's no reason to support files cross iframe boundary for now
		// files
	};

export const PageHTMLInputElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLInputElement };
inhert(PageHTMLInputElement, PageHTMLElement);

export type PageHTMLDataListElement = PageHTMLElement & {
	options: PageHTMLOptionElement[];
};

export const PageHTMLDataListElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLDataListElement };
inhert(PageHTMLDataListElement, PageHTMLElement);

export type PageHTMLTextAreaElement = PageHTMLElement & FormChildElement;
export const PageHTMLTextAreaElement = function () {
	throwRemoteTypeOnly();
} as unknown as { new (): PageHTMLTextAreaElement };
inhert(PageHTMLTextAreaElement, PageHTMLElement);
