import { Constructor, StructuredCloneable } from 'type-fest';
import { disposeNonPinned, metadata } from './symbols';
import { Logger, LogLevel } from './logging';
import { RpcSerializer, structureClonableSerializers } from './serializer';
import { RpcDeserializedValue, RpcSerializedValue, SerializerSource } from './serializer/types';
import { LocalFunctionCollection } from './LocalFunctionCollection';
import { RpcFunctionId } from './RpcFunctionId';
import { RpcMessageFormat } from './RpcMessageFormat';
import { RpcInternalEventTarget, RpcMessageFormattedEvent } from './RpcInternalEvents';
import { isPrimitiveOrBoxedPrimitive } from './util';
import { DefaultFunctionSerializer } from './serializer/DefaultFunctionSerializer';

export type RpcMessageHandler = (data: RpcMessageFormat) => void | Promise<void>;

type PromiseHandler<TResolve = RpcSerializedValue, TReject = unknown> = {
	resolve: (value: TResolve) => void;
	reject: (value: TReject) => void;
	promise: Promise<TResolve>;
};

function createPromiseHandler<TResolve = RpcSerializedValue, TReject = unknown>() {
	let resolve: (value: TResolve) => void = () => {};
	let reject: (value: TReject) => void = () => {};
	const promise = new Promise<TResolve>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { resolve, reject, promise };
}

async function disposeDeserializedValue(values: RpcDeserializedValue[]) {
	for (let arg of values) {
		if (isPrimitiveOrBoxedPrimitive(arg)) {
			continue;
		}
		await arg[Symbol.asyncDispose]?.();
		continue;
	}
}

export interface RpcOptions {
	serviceName: string;
	messageHandler: RpcMessageHandler;
	serializers?: SerializerSource<unknown>[];
	customTypes?: Record<string, { new (): unknown }> | { new (): unknown }[];
	logLevel?: LogLevel;
}

abstract class RpcBase extends EventTarget {
	protected readonly serviceName: string;
	protected readonly messageHandler: RpcMessageHandler;
	protected readonly log: Logger;

	private localFunctions = new LocalFunctionCollection();
	protected readonly serializer: RpcSerializer;
	protected readonly internalEvents = new RpcInternalEventTarget<RpcBase>();

	#callbackRequests: Map<string, PromiseHandler<RpcSerializedValue>> = new Map();

	static #throwCallbackNotFound() {
		return new Error('Callback was either disposed or removed.');
	}

	constructor(options: RpcOptions) {
		super();
		this.serviceName = options.serviceName;
		this.messageHandler = options.messageHandler;

		this.log = new Logger({ level: options.logLevel, prefix: `[MessageRPC] [${this.serviceName}]` });
		this.serializer = new RpcSerializer({
			serializers: [
				...(options.serializers ?? []),
				...structureClonableSerializers,
				new DefaultFunctionSerializer({
					addEventListener: this.internalEvents.addEventListener.bind(this.internalEvents),
					removeEventListener: this.internalEvents.removeEventListener.bind(this.internalEvents),
					dispatchEvent: this.internalEvents.dispatchEvent.bind(this.internalEvents),
					invokeRemoteMethod: this.#invokeCallbackRequest,
					disposeRemoteMethod: this.#invokeCallbackDispose,
					localFunctions: this.localFunctions,
					logger: this.log,
				}),
			],
			customTypes: Array.isArray(options.customTypes)
				? Object.fromEntries(options.customTypes.map((x) => [x.name, x]))
				: (options.customTypes ?? {}),
			maxDepth: 256,
		});

		window.addEventListener('message', this.#handleOnMessage);
		this.internalEvents.addEventListener('callback-request', this.#handleCallbackRequest);
		this.internalEvents.addEventListener('callback-response', this.#handleCallbackResponse);
		this.internalEvents.addEventListener('callback-dispose', this.#handleCallbackDispose);
	}

	#handleCallbackRequest = async ({ message, requestId }: RpcMessageFormattedEvent<'callback-request'>) => {
		const { id, args } = message;
		this.log.debug(`Start handling callback ${id}`, args);
		const callback = this.localFunctions.getFunctionById(id);
		if (!callback) {
			this.log.debug(`Requested callback ${id} not found`, requestId);
			await this.messageHandler({
				requestId: requestId,
				serviceName: this.serviceName,
				type: 'callback-response',
				content: {
					success: false,
					result: RpcBase.#throwCallbackNotFound(),
				},
			});
			return;
		}
		const composedArguments = args.map((arg) => this.serializer.deserialize(arg));
		try {
			const result = await callback(...composedArguments);
			this.log.debug(`Requested callback ${id} found`, requestId);
			await this.messageHandler({
				requestId,
				serviceName: this.serviceName,
				type: 'callback-response',
				content: {
					success: true,
					result: this.serializer.serialize(result),
				},
			});
		} catch (e) {
			this.log.warn(`Requested callback ${id} throw an error`, requestId, e);
			await this.messageHandler({
				requestId,
				serviceName: this.serviceName,
				type: 'callback-response',
				content: {
					success: false,
					result: e,
				},
			});
		} finally {
			this.log.debug(`Callback completed, disposing composed arguments`, requestId, composedArguments);
			await disposeDeserializedValue(composedArguments);
		}
	};

	#handleCallbackResponse = ({ message, requestId }: RpcMessageFormattedEvent<'callback-response'>) => {
		const handler = this.#callbackRequests.get(requestId);
		if (!handler) {
			return;
		}
		this.#callbackRequests.delete(requestId);
		if (message.success) {
			handler.resolve(message.result);
		} else {
			handler.reject(message.result);
		}
	};

	#handleCallbackDispose = ({ message }: RpcMessageFormattedEvent<'callback-dispose'>) => {
		const callback = this.localFunctions.getFunctionById(message.callbackId);
		if (!callback) {
			return;
		}
		this.log.debug(`Callback ${message.callbackId} disposed`, message);
		this.localFunctions.deleteFunction(message.callbackId);
	};

	#handleOnMessage = async (event: MessageEvent<RpcMessageFormat>) => {
		if (event.data == null || event.data.serviceName !== this.serviceName) {
			return;
		}
		this.internalEvents.dispatchEvent(
			new RpcMessageFormattedEvent(event.data.type, event.data.content, event.data.requestId),
		);
	};

	#invokeCallbackRequest = async (callbackId: RpcFunctionId, args: any[]) => {
		const callbackArgs = args.map((x) => this.serializer.serialize(x));
		const id = crypto.randomUUID();
		const handler = createPromiseHandler<RpcSerializedValue>();
		this.#callbackRequests.set(id, handler);
		await this.messageHandler({
			requestId: id,
			serviceName: this.serviceName,
			type: 'callback-request',
			content: {
				id: callbackId,
				args: callbackArgs,
			},
		});
		return this.serializer.deserialize(await handler.promise);
	};

	#invokeCallbackDispose = (callbackId: RpcFunctionId) => {
		return this.messageHandler({
			type: 'callback-dispose',
			serviceName: this.serviceName,
			content: { callbackId },
		});
	};

	[Symbol.dispose]() {
		this.messageHandler({
			type: 'close',
			serviceName: this.serviceName,
			content: { removedCallbacks: Array.from(this.localFunctions.idList) },
		});
		window.removeEventListener('message', this.#handleOnMessage);
	}
}

export class RpcClient extends RpcBase {
	#requests: Map<string, PromiseHandler<RpcSerializedValue>> = new Map();
	#disposables: WeakRef<Disposable>[] = [];

	constructor(options: RpcOptions) {
		super(options);

		this.internalEvents.addEventListener('response', ({ message, requestId }) => {
			const request = this.#requests.get(requestId);
			if (!request) return;
			try {
				if (message.success) {
					request.resolve(message.result);
				} else {
					request.reject(message.result);
				}
			} finally {
				this.#requests.delete(requestId);
			}
		});
	}

	async invoke(method: string, arg: unknown[]) {
		const requestId = crypto.randomUUID();
		const handler = createPromiseHandler();
		this.#requests.set(requestId, handler);
		await this.messageHandler({
			requestId,
			serviceName: this.serviceName,
			type: 'request',
			content: {
				method,
				args: arg.map((arg) => this.serializer.serialize(arg)),
			},
		});
		const response = await handler.promise;
		const result = this.serializer.deserialize(response);
		if (isPrimitiveOrBoxedPrimitive(result)) {
			return result;
		}
		if (Symbol.dispose in result) {
			this.#disposables.push(new WeakRef(result));
		}
		return result;
	}

	[Symbol.dispose] = () => {
		super[Symbol.dispose];
		for (let disposables of this.#disposables) {
			disposables.deref()?.[Symbol.dispose]();
		}
	};
}

export class RpcServer extends RpcBase {
	#server: Record<string | number | symbol, any>;

	constructor(server: object, options: RpcOptions) {
		super(options);
		this.#server = server;
		serverManager.open(options.serviceName);

		this.internalEvents.addEventListener('request', this.#onRequest);
	}

	#onRequest = async ({ message, requestId }: RpcMessageFormattedEvent<'request'>) => {
		const { method, args } = message;
		const compositeArgs = args.map((arg) => this.serializer.deserialize(arg));
		try {
			const serverMethod = this.#server[method].bind(this.#server);
			if (typeof serverMethod !== 'function')
				throw new Error(`Trying to invoke ${method} as a function, but it was a ${typeof serverMethod}`);
			const result = await serverMethod(...compositeArgs);
			await this.messageHandler({
				requestId: requestId,
				serviceName: this.serviceName,
				type: 'response',
				content: {
					success: true,
					result: this.serializer.serialize(result),
				},
			});
		} catch (error: unknown) {
			await this.messageHandler({
				requestId: requestId,
				serviceName: this.serviceName,
				type: 'response',
				content: {
					success: false,
					result: error,
				},
			});
		} finally {
			await disposeDeserializedValue(compositeArgs);
		}
	};

	[Symbol.dispose]() {
		super[Symbol.dispose]();
		serverManager.close(this.serviceName);
	}
}

class RpcServerManager {
	#services: Set<string> = new Set();

	open(serviceName: string) {
		if (this.#services.has(serviceName))
			throw new Error(`Unable to create MessageRpc server because ${serviceName} is already running`);
		this.#services.add(serviceName);
	}

	close(serviceName: string) {
		this.#services.delete(serviceName);
	}
}

const serverManager = new RpcServerManager();
