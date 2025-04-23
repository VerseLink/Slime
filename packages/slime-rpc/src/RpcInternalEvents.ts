import { RpcFunctionId } from './RpcFunctionId';
import { RpcMessageFormat, RpcMessageFormatMapped } from './RpcMessageFormat';

export class RpcInternalEventTarget<T> extends EventTarget {
	addEventListener<K extends keyof RpcInternalEventMap>(
		type: K,
		callback:
			| ((this: T, event: RpcInternalEventMap[K]) => void)
			| null
			| { handleEvent(object: RpcInternalEventMap[K]): void },
		options?: AddEventListenerOptions | boolean,
	): void;
	addEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: AddEventListenerOptions,
	) {
		super.addEventListener(type, callback, options);
	}

	removeEventListener<K extends keyof RpcInternalEventMap>(
		type: K,
		callback:
			| ((this: T, event: RpcInternalEventMap[K]) => void)
			| null
			| { handleEvent(object: RpcInternalEventMap[K]): void },
		options?: EventListenerOptions | boolean,
	): void;
	removeEventListener(
		type: string,
		callback: EventListenerOrEventListenerObject | null,
		options?: EventListenerOptions | boolean,
	): void {
		super.removeEventListener(type, callback, options);
	}
}

export type RpcInternalEventMap = {
	[K in RpcMessageFormat as K['type']]: RpcMessageFormattedEvent<K['type']>;
};

type RpcMessageFormatUnpack = {
	[K in RpcMessageFormat as K['type']]: K;
};

export class RpcMessageFormattedEvent<Type extends keyof RpcMessageFormatUnpack> extends Event {
	readonly message: RpcMessageFormatUnpack[Type]["content"];
	readonly requestId: RpcMessageFormatUnpack[Type]["requestId"];

	constructor(type: Type, message: RpcMessageFormatUnpack[Type]["content"], requestId: RpcMessageFormatUnpack[Type]["requestId"], eventInitDict?: EventInit) {
		super(type, eventInitDict);
		this.message = message;
		this.requestId = requestId;
	}
}
