import { MessageRpc, RpcArgument, RpcObject, RpcFunction, RpcClassAs } from '@slime/rpc';
import {
	PageElement,
	PageElementAttribute,
	PageHTMLElementInputOptions,
	PageEventTarget,
	PageHTMLElement,
	PageHTMLFormElement,
	PageNode,
	PageHTMLFieldSetElement,
	PageHTMLOutputElement,
	PageHTMLObjectElement,
	PageHTMLButtonElement,
	PageHTMLSelectElement,
	PageHTMLOptionElement,
	PageHTMLInputElement,
	PageHTMLDataListElement,
	PageHTMLTextAreaElement,
	PageDocument,
	PageLocation,
} from '@slime/runtime/v1';

interface RpcElementInit {
	listeners: Map<string, RpcFunction<EventListener>>;
}

function mapAttributes(attributes: NamedNodeMap) {
	const result: Map<string, PageElementAttribute> = new Map();
	for (let i = 0; i < attributes.length; i++) {
		const attr = attributes[i];
		result.set(attr.name, { value: attr.value, index: i });
	}
	return result;
}

// https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-change-or-input-event-in-react-js#46012210
function setValueReactCompatible(element: EventTarget & { value: string }, value: string) {
	const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set;
	if (setter) {
		setter.call(element, value);
	} else {
		element.value = value;
	}
	const event = new Event('input', { bubbles: true }) as Event & { simulated: boolean };
	// in case it was React <= 15.6.0
	event.simulated = true;
	element.dispatchEvent(event);
}

function toPageNode(element: HTMLTextAreaElement, init: RpcElementInit): RpcHTMLTextAreaElement;
function toPageNode(element: HTMLTextAreaElement | null, init: RpcElementInit): RpcHTMLTextAreaElement | null;
function toPageNode(element: HTMLFieldSetElement, init: RpcElementInit): RpcHTMLFieldSetElement;
function toPageNode(element: HTMLFieldSetElement | null, init: RpcElementInit): RpcHTMLFieldSetElement | null;
function toPageNode(element: HTMLOutputElement, init: RpcElementInit): RpcHTMLOutputElement;
function toPageNode(element: HTMLOutputElement | null, init: RpcElementInit): RpcHTMLOutputElement | null;
function toPageNode(element: HTMLObjectElement, init: RpcElementInit): RpcHTMLObjectElement;
function toPageNode(element: HTMLObjectElement | null, init: RpcElementInit): RpcHTMLObjectElement | null;
function toPageNode(element: HTMLButtonElement, init: RpcElementInit): RpcHTMLButtonElement;
function toPageNode(element: HTMLButtonElement | null, init: RpcElementInit): RpcHTMLButtonElement | null;
function toPageNode(element: HTMLSelectElement, init: RpcElementInit): RpcHTMLSelectElement;
function toPageNode(element: HTMLSelectElement | null, init: RpcElementInit): RpcHTMLSelectElement | null;
function toPageNode(element: HTMLOptionElement, init: RpcElementInit): RpcHTMLOptionElement;
function toPageNode(element: HTMLOptionElement | null, init: RpcElementInit): RpcHTMLOptionElement | null;
function toPageNode(element: HTMLInputElement, init: RpcElementInit): RpcHTMLInputElement;
function toPageNode(element: HTMLInputElement | null, init: RpcElementInit): RpcHTMLInputElement | null;
function toPageNode(element: HTMLDataListElement, init: RpcElementInit): RpcHTMLDataListElement;
function toPageNode(element: HTMLDataListElement | null, init: RpcElementInit): RpcHTMLDataListElement | null;
function toPageNode(element: HTMLFormElement, init: RpcElementInit): RpcHTMLFormElement;
function toPageNode(element: HTMLFormElement | null, init: RpcElementInit): RpcHTMLFormElement | null;
function toPageNode(element: HTMLElement, init: RpcElementInit): RpcHTMLElement;
function toPageNode(element: HTMLElement | null, init: RpcElementInit): RpcHTMLElement | null;
function toPageNode(element: Element, init: RpcElementInit): RpcElement;
function toPageNode(element: Element | null, init: RpcElementInit): RpcElement | null;
function toPageNode(element: Node, init: RpcElementInit): RpcNode;
function toPageNode(element: Node | null, init: RpcElementInit): RpcNode | null;
function toPageNode(element: EventTarget, init: RpcElementInit): RpcEventTarget;
function toPageNode(element: EventTarget | null, init: RpcElementInit): RpcEventTarget | null;
function toPageNode(element: null, init: RpcElementInit): null;
function toPageNode(
	element: EventTarget | null,
	init: RpcElementInit,
): RpcEventTarget | RpcNode | RpcElement | RpcHTMLElement | null {
	if (element == null) return null;
	// specialized elements

	if (element instanceof HTMLFormElement) return new RpcHTMLFormElement(element, init);
	if (element instanceof HTMLFieldSetElement) return new RpcHTMLFieldSetElement(element, init);
	if (element instanceof HTMLOutputElement) return new RpcHTMLOutputElement(element, init);
	if (element instanceof HTMLObjectElement) return new RpcHTMLObjectElement(element, init);
	if (element instanceof HTMLButtonElement) return new RpcHTMLButtonElement(element, init);
	if (element instanceof HTMLSelectElement) return new RpcHTMLSelectElement(element, init);
	if (element instanceof HTMLOptionElement) return new RpcHTMLOptionElement(element, init);
	if (element instanceof HTMLInputElement) return new RpcHTMLInputElement(element, init);
	if (element instanceof HTMLTextAreaElement) return new RpcHTMLTextAreaElement(element, init);
	if (element instanceof HTMLDataListElement) return new RpcHTMLDataListElement(element, init);

	// any non specific HTMLElement
	if (element instanceof HTMLElement) return new RpcHTMLElement(element, init);
	if (element instanceof Element) return new RpcElement(element, init);
	if (element instanceof Node) return new RpcNode(element, init);

	return new RpcEventTarget(element, init);
}

@RpcClassAs(PageEventTarget.name)
class RpcEventTarget implements RpcObject<PageEventTarget> {
	#target: EventTarget;
	#listeners: Map<string, RpcFunction<EventListener>>;

	constructor(target: EventTarget, init: RpcElementInit) {
		this.#target = target;
		this.#listeners = init.listeners;
	}

	addEventListener(type: string, listener: any, options?: boolean | AddEventListenerOptions): void {
		//RpcArgument<EventListener | EventListenerObject | { (event: Event): any }>
		let listenerCallback = typeof listener === 'object' ? listener.handleEvent : listener;
		const callbackFunc = (e: Event) => {
			listenerCallback(e);
		};
		const metadata = listenerCallback[MessageRpc.metadata];
		// pin the callback
		metadata.pin();
		metadata.onDispose(() => {
			this.#listeners.delete(metadata.id);
			this.#target.removeEventListener(type, callbackFunc, options);
		});
		this.#listeners.set(metadata.id, listenerCallback);
		this.#target.addEventListener(type, callbackFunc, options);
	}

	removeEventListener(type: string, listener: any, options?: boolean | EventListenerOptions): void {
		let listenerCallback = typeof listener === 'object' ? listener.handleEvent : listener;
		const metadata = listenerCallback[MessageRpc.metadata];
		const realListener = this.#listeners.get(metadata.id);
		if (realListener) {
			this.#target.removeEventListener(type, realListener, options);
			realListener[Symbol.dispose]();
		}
	}

	dispatchEvent(eventType: string, eventInit?: EventInit): boolean {
		return this.#target.dispatchEvent(new Event(eventType, eventInit));
	}
}

@RpcClassAs(PageNode.name)
//@ts-ignore Ignore type instatiation is potentially infinite (because of TS complex type system)
class RpcNode extends RpcEventTarget implements RpcObject<PageNode> {
	#node: Node;
	#init: RpcElementInit;

	readonly baseURI: string;
	readonly nodeName: string;
	readonly nodeType: number;
	readonly nodeValue: string | null;
	readonly textContent: string | null;
	readonly isConnected: boolean;

	constructor(node: Node, init: RpcElementInit) {
		super(node, init);
		this.#node = node;
		this.#init = init;
		this.baseURI = node.baseURI;
		this.nodeName = node.nodeName;
		this.nodeType = node.nodeType;
		this.nodeValue = node.nodeValue;
		this.textContent = node.textContent;
		this.isConnected = node.isConnected;
	}

	childNodes(): RpcNode[] {
		return Array.from(this.#node.childNodes).map((child) => toPageNode(child, this.#init));
	}

	parentNode(): RpcNode | null {
		return toPageNode(this.#node.parentNode, this.#init);
	}

	parentElement(): RpcHTMLElement | null {
		return toPageNode(this.#node.parentElement, this.#init);
	}

	nextSibling(): RpcNode | null {
		return toPageNode(this.#node.nextSibling, this.#init);
	}

	previousSibling(): RpcNode | null {
		return toPageNode(this.#node.previousSibling, this.#init);
	}

	firstChild(): RpcNode | null {
		return toPageNode(this.#node.firstChild, this.#init);
	}

	lastChild(): RpcNode | null {
		return toPageNode(this.#node.lastChild, this.#init);
	}

	hasChildNodes(): boolean {
		return this.#node.hasChildNodes();
	}

	snapshot(): this {
		return this;
	}
}

@RpcClassAs(PageElement.name)
class RpcElement extends RpcNode implements RpcObject<PageElement> {
	#element: Element;
	#init: RpcElementInit;

	readonly id: string;
	readonly className: string;
	readonly attributes: Map<string, PageElementAttribute>;
	readonly tagName: string;
	readonly innerHTML: string;
	readonly outerHTML: string;

	constructor(element: Element, init: RpcElementInit) {
		super(element, init);
		this.#element = element;
		this.#init = init;
		this.id = element.id;
		this.className = element.className;
		this.attributes = mapAttributes(element.attributes);
		this.tagName = element.tagName;
		this.innerHTML = element.innerHTML;
		this.outerHTML = element.outerHTML;
	}

	nextElementSibling(): RpcObject<PageElement> | null {
		return toPageNode(this.#element.nextElementSibling, this.#init);
	}

	previousElementSibling(): RpcObject<PageElement> | null {
		return toPageNode(this.#element.previousElementSibling, this.#init);
	}

	children(): RpcElement[] {
		const children = Array.from(this.#element.children);
		return children.map((child) => toPageNode(child, this.#init));
	}

	querySelector(selectors: string): RpcElement | null {
		const child = this.#element.querySelector(selectors);
		return toPageNode(child, this.#init);
	}

	querySelectorAll(selectors: string): RpcObject<PageElement>[] {
		const children = Array.from(this.#element.querySelectorAll(selectors));
		return children.map((child) => toPageNode(child, this.#init));
	}
}

@RpcClassAs(PageHTMLElement.name)
class RpcHTMLElement extends RpcElement implements RpcObject<PageHTMLElement> {
	#element: HTMLElement;
	dataset: Record<string, string | undefined>;

	constructor(element: HTMLElement, init: RpcElementInit) {
		super(element, init);
		this.#element = element;
		this.dataset = { ...element.dataset };
	}

	click() {
		return this.#element.click();
	}
	blur() {
		return this.#element.blur();
	}
	focus() {
		return this.#element.focus();
	}

	input(value: string | number, option?: PageHTMLElementInputOptions): void {
		if (!option?.noFocus) {
			this.#element.focus();
		}
		if (option?.useLegacyExecCommand) {
			document.execCommand('insertText', false, value.toString());
			return;
		}
		if (this.#element instanceof HTMLInputElement || this.#element instanceof HTMLTextAreaElement) {
			this.#element.setRangeText(value.toString());
			this.#element.dispatchEvent(new Event('input', { bubbles: true }));
		}
	}
}

@RpcClassAs(PageHTMLFormElement.name)
class RpcHTMLFormElement extends RpcHTMLElement implements RpcObject<PageHTMLFormElement> {
	#element: HTMLFormElement;
	#init: RpcElementInit;

	constructor(element: HTMLFormElement, init: RpcElementInit) {
		super(element, init);
		this.#init = init;
		this.#element = element;
	}

	submit() {
		this.#element.submit();
	}

	requestSubmit() {
		this.#element.requestSubmit();
	}

	reset() {
		this.#element.reset();
	}

	checkValidity() {
		return this.#element.checkValidity();
	}

	reportValidity() {
		return this.#element.reportValidity();
	}

	elements() {
		return Array.from(this.#element.elements).map((child) => toPageNode(child, this.#init));
	}
}

type FormChildElements =
	| HTMLFieldSetElement
	| HTMLOutputElement
	| HTMLObjectElement
	| HTMLButtonElement
	| HTMLSelectElement
	| HTMLInputElement
	| HTMLTextAreaElement;

abstract class RpcHTMLFormChildElementBase<T extends FormChildElements> extends RpcHTMLElement {
	#element: T;
	#init: RpcElementInit;

	constructor(element: T, init: RpcElementInit) {
		super(element, init);
		this.#init = init;
		this.#element = element;
		this.willValidate = element.willValidate;
		this.validity = element.validity;
		this.validationMessage = element.validationMessage;
	}

	willValidate: boolean;
	validity: ValidityState;
	validationMessage: string;

	form() {
		return toPageNode(this.#element.form, this.#init);
	}

	checkValidity() {
		return this.#element.checkValidity();
	}

	reportValidity() {
		return this.#element.reportValidity();
	}
}

@RpcClassAs(PageHTMLFieldSetElement.name)
class RpcHTMLFieldSetElement
	extends RpcHTMLFormChildElementBase<HTMLFieldSetElement>
	implements RpcObject<PageHTMLFieldSetElement> {}

@RpcClassAs(PageHTMLOutputElement.name)
class RpcHTMLOutputElement
	extends RpcHTMLFormChildElementBase<HTMLOutputElement>
	implements RpcObject<PageHTMLOutputElement> {}

@RpcClassAs(PageHTMLObjectElement.name)
class RpcHTMLObjectElement
	extends RpcHTMLFormChildElementBase<HTMLObjectElement>
	implements RpcObject<PageHTMLObjectElement> {}

@RpcClassAs(PageHTMLButtonElement.name)
class RpcHTMLButtonElement
	extends RpcHTMLFormChildElementBase<HTMLButtonElement>
	implements RpcObject<PageHTMLButtonElement> {}

@RpcClassAs(PageHTMLSelectElement.name)
class RpcHTMLSelectElement
	extends RpcHTMLFormChildElementBase<HTMLSelectElement>
	implements RpcObject<PageHTMLSelectElement>
{
	#element: HTMLSelectElement;

	constructor(element: HTMLSelectElement, init: RpcElementInit) {
		super(element, init);
		const map = new Map<Element, RpcHTMLOptionElement>();
		for (let option of element.options) {
			map.set(option, toPageNode(option, init));
		}
		this.#element = element;
		this.options = Array.from(map.values());
		this.selectedIndex = element.selectedIndex;
		this.selectedOptions = Array.from(element.selectedOptions).map(
			(selected) => map.get(selected) ?? toPageNode(selected, init),
		);
	}

	options: RpcObject<PageHTMLOptionElement>[];
	selectedIndex: number;
	selectedOptions: RpcObject<PageHTMLOptionElement>[];

	setValue(value: string) {
		setValueReactCompatible(this.#element, value);
	}
}

@RpcClassAs(PageHTMLOptionElement.name)
class RpcHTMLOptionElement extends RpcHTMLElement implements RpcObject<PageHTMLOptionElement> {
	#element: HTMLOptionElement;
	#init: RpcElementInit;

	constructor(element: HTMLOptionElement, init: RpcElementInit) {
		super(element, init);
		this.#init = init;
		this.#element = element;
		this.defaultSelected = element.defaultSelected;
	}

	defaultSelected: boolean;

	form() {
		return toPageNode(this.#element.form, this.#init);
	}
}

@RpcClassAs(PageHTMLInputElement.name)
class RpcHTMLInputElement
	extends RpcHTMLFormChildElementBase<HTMLInputElement>
	implements RpcObject<PageHTMLInputElement>
{
	constructor(element: HTMLInputElement, init: RpcElementInit) {
		super(element, init);
		this.defaultValue = element.defaultValue;
		this.list = toPageNode(element.list, init);
		this.checked = element.checked;
		this.defaultChecked = element.defaultChecked;
		this.indeterminate = element.indeterminate;
	}

	defaultValue: string;
	list: RpcObject<PageHTMLDataListElement> | null;
	checked: boolean;
	defaultChecked: boolean;
	indeterminate: boolean;
}

@RpcClassAs(PageHTMLDataListElement.name)
class RpcHTMLDataListElement extends RpcHTMLElement implements RpcObject<PageHTMLDataListElement> {
	options: RpcObject<PageHTMLOptionElement>[];

	constructor(element: HTMLDataListElement, init: RpcElementInit) {
		super(element, init);
		this.options = Array.from(element.options).map((option) => toPageNode(option, init));
	}
}

@RpcClassAs(PageHTMLTextAreaElement.name)
class RpcHTMLTextAreaElement
	extends RpcHTMLFormChildElementBase<HTMLTextAreaElement>
	implements RpcObject<PageHTMLTextAreaElement> {}

class RpcDocumentLocation implements RpcObject<PageLocation> {
	get href() {
		return document.location.href;
	}
	get protocol() {
		return document.location.protocol;
	}
	get host() {
		return document.location.host;
	}
	get hostname() {
		return document.location.hostname;
	}
	get port() {
		return document.location.port;
	}
	get pathname() {
		return document.location.pathname;
	}
	get search() {
		return document.location.search;
	}
	get hash() {
		return document.location.hash;
	}

	snapshot() {
		return this as RpcObject<PageLocation>;
	}

	assign(url: string) {
		document.location.assign(url);
	}

	reload() {
		document.location.reload();
	}

	replace(url: string) {
		document.location.replace(url);
	}
}

@RpcClassAs(PageDocument.name)
export class RpcDocument extends RpcNode implements RpcObject<PageDocument> {
	#init: RpcElementInit;

	constructor(init: RpcElementInit) {
		super(document, init);
		this.#init = init;
		this.title = document.title;
		this.referrer = document.referrer;
		this.documentURI = document.documentURI;
		this.characterSet = document.characterSet;
		this.hidden = document.hidden;
		this.visibilityState = document.visibilityState;
		this.cookie = document.cookie;
		this.location = new RpcDocumentLocation();
	}

	title: string;
	referrer: string;
	documentURI: string;
	characterSet: string;
	hidden: boolean;
	visibilityState: DocumentVisibilityState;
	location: RpcObject<PageLocation>;
	cookie: string;

	setCookie(cookie: string) {
		document.cookie = cookie;
	}

	querySelector(selector: string): RpcObject<PageElement> | null {
		return toPageNode(document.querySelector(selector), this.#init) as RpcObject<PageElement> | null;
	}

	querySelectorAll(selector: string): RpcObject<PageElement>[] {
        // @ts-ignore
		return Array.from(document.querySelectorAll(selector)).map((child) => toPageNode(child, this.#init));
	}

	getElementById(id: string): RpcObject<PageHTMLElement> | null {
		return toPageNode(document.getElementById(id), this.#init) as RpcObject<PageHTMLElement> | null;
	}
}

