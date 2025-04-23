import * as Runtime from ".";

export {};

declare global {
    const SlimeScriptBase: typeof Runtime.SlimeScriptBase;
    const PageEventTarget: typeof Runtime.PageEventTarget;
    const PageNode: typeof Runtime.PageNode;
    const PageDocument: typeof Runtime.PageDocument;
    const PageElement: typeof Runtime.PageElement;
    const PageHTMLElement: typeof Runtime.PageHTMLElement;
    const PageHTMLFormElement: typeof Runtime.PageHTMLFormElement;
    const PageHTMLFieldSetElement: typeof Runtime.PageHTMLFieldSetElement;
    const PageHTMLOutputElement: typeof Runtime.PageHTMLOutputElement;
    const PageHTMLObjectElement: typeof Runtime.PageHTMLObjectElement;
    const PageHTMLButtonElement: typeof Runtime.PageHTMLButtonElement;
    const PageHTMLSelectElement: typeof Runtime.PageHTMLSelectElement;
    const PageHTMLOptionElement: typeof Runtime.PageHTMLOptionElement;
    const PageHTMLInputElement: typeof Runtime.PageHTMLInputElement;
    const PageHTMLDataListElement: typeof Runtime.PageHTMLDataListElement;
    const PageHTMLTextAreaElement: typeof Runtime.PageHTMLTextAreaElement;
}