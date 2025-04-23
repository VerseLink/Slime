import { ApplyCodeResult, PageInfo, ParsableData, Price, VariantProductDetail } from "@slime/runtime/v1";

export type SandboxRuntimeEvent = {
    productselected: CustomEvent<VariantProductDetail>;
}

/** The type defintion required */
export interface SandboxRuntimeAdaptor {
    getPageInfo?: () => Promise<PageInfo>;
    applyCode?: (code: string[]) => AsyncIterator<ApplyCodeResult>;

    addEventListener<T extends keyof SandboxRuntimeEvent>(type: T, callback: (event: SandboxRuntimeEvent[T]) => PromiseLike<void> | void, options?: AddEventListenerOptions | boolean): void;
    addEventListener(type: string, callback: (event: Event) => PromiseLike<void> | void, options?: AddEventListenerOptions): void;

    removeEventListener<T extends keyof SandboxRuntimeEvent>(type: T, callback: (event: SandboxRuntimeEvent[T]) => PromiseLike<void> | void, options?: EventListenerOptions | boolean): void;
    removeEventListener(type: string, callback: (event: Event) => PromiseLike<void> | void, options?: EventListenerOptions): void;
}

export abstract class SandboxRuntimeAdaptorBase implements SandboxRuntimeAdaptor {
    
    protected event: EventTarget = new EventTarget();

    addEventListener<T extends keyof SandboxRuntimeEvent>(
        type: T,
        callback: (event: SandboxRuntimeEvent[T]) => PromiseLike<void> | void,
        options?: AddEventListenerOptions | boolean,
    ): void;
    addEventListener(
        type: string,
        callback: (event: Event) => PromiseLike<void> | void,
        options?: AddEventListenerOptions | boolean,
    ): void {
        this.event.addEventListener(type, callback, options);
    }

    removeEventListener<T extends keyof SandboxRuntimeEvent>(
        type: T,
        callback: (event: SandboxRuntimeEvent[T]) => PromiseLike<void> | void,
        options?: EventListenerOptions | boolean,
    ): void;
    removeEventListener(
        type: string,
        callback: (event: Event) => PromiseLike<void> | void,
        options?: EventListenerOptions | boolean,
    ): void {
        this.event.removeEventListener(type, callback, options);
    }


}
