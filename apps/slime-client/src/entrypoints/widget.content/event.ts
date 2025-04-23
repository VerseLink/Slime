interface SlimeEventMap {
    applyCode: Event,
}

interface SlimeEvent {
    addEventListener<T extends keyof SlimeEventMap>(type: T, listener: (event: SlimeEventMap[T]) => any, options?: AddEventListenerOptions | boolean): void;
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;
    dispatchEvent(event: Event): boolean;
    removeEventListener<T extends keyof SlimeEventMap>(type: T, listener: (event: SlimeEventMap[T]) => any, options?: EventListenerOptions | boolean): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean): void;
}

export const slimeEvent: SlimeEvent = new EventTarget();