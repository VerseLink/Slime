import { disposeNonPinned, metadata } from '../symbols';
import { Logger } from '../logging';
import { RpcFunctionId } from '../RpcFunctionId';
import { LocalFunctionCollection } from '../LocalFunctionCollection';
import { RpcInternalEventTarget, RpcMessageFormattedEvent } from '../RpcInternalEvents';
import { RpcSerializedValue, DeserializedValueResult, DeserializerProvider, SerializerSource  } from './types';

interface RpcBridge extends RpcInternalEventTarget<unknown> {
	localFunctions: LocalFunctionCollection;
	logger: Logger;
	invokeRemoteMethod: (functionId: RpcFunctionId, args: any[]) => unknown;
	disposeRemoteMethod: (functionId: RpcFunctionId) => Promise<void> | void;
}

type FunctionLikeProxy = (() => void) & ProxyBase;

type ProxyBase = {
	[metadata]: { id: string };
	[disposeNonPinned]: () => void;
	[Symbol.dispose]: () => void;
};

export class DefaultFunctionSerializer implements SerializerSource<Function> {
	private rpc: RpcBridge;
	private log: Logger;

	private localFunctions: LocalFunctionCollection;
	private pinnedRemoteFunctions: Map<RpcFunctionId, WeakRef<FunctionLikeProxy>> = new Map();

	constructor(rpc: RpcBridge) {
		rpc.addEventListener('close', ({ message }: RpcMessageFormattedEvent<'close'>) => {
			for (let functionId of message.removedCallbacks) {
				const pinnedFunction = this.pinnedRemoteFunctions.get(functionId)?.deref();
				if (!pinnedFunction) {
					continue;
				}
				pinnedFunction[Symbol.dispose]();
				this.pinnedRemoteFunctions.delete(functionId);
			}
		});
		this.localFunctions = rpc.localFunctions;
		this.rpc = rpc;
		this.log = rpc.logger;
	}

	private finalizers = new FinalizationRegistry(
		(disposeInfo: { invoke: () => void; data: { function: RpcFunctionId; name?: string } }) => {
			this.log.info(
				`A pinned function "${disposeInfo.data.name}"(id: ${disposeInfo.data.function}) was not correctly disposed, disposing it now`,
			);
			disposeInfo.invoke();
		},
	);

	canSerialize(object: unknown): boolean {
		return typeof object === 'function';
	}

	serialize(func: Function): RpcSerializedValue {
		const existingCallbackId = this.localFunctions.getIdByFunction(func);
		if (existingCallbackId) {
			return { function: existingCallbackId, name: func.name };
		}
		return { function: this.localFunctions.addFunction(func), name: func.name };
	}

	deserialize(data: RpcSerializedValue, deserializer: DeserializerProvider): DeserializedValueResult<Function> {
		if (typeof data !== 'object' || data == null || !('function' in data)) {
			return { success: false };
		}
		const pinned = this.pinnedRemoteFunctions.get(data.function)?.deref();
		if (pinned) {
			return { success: true, value: pinned };
		}
		let isDisposed = false;
		let onDisposeCallbacks: (() => void)[] = [];
		const disposeFunction = () => {
			this.log.debug(`Disposing function ${data.name ?? data.function}`);
			this.rpc.disposeRemoteMethod(data.function);
			this.pinnedRemoteFunctions.delete(data.function);
			for (let callback of onDisposeCallbacks) {
				callback();
			}
		};
		this.log.debug(`Function stub created ${data.name ?? data.function}`);
		const proxy = new Proxy(() => {}, {
			get: (_, method) => {
				switch (method) {
					case Symbol.dispose:
					case Symbol.asyncDispose:
						return () => {
							if (isDisposed) return;
							isDisposed = true;
							disposeFunction();
							this.finalizers.unregister(proxy);
						};
					case disposeNonPinned:
						return () => {
							if (this.pinnedRemoteFunctions.has(data.function)) {
								return;
							}
							proxy[Symbol.dispose]();
						};
					case metadata:
						return {
							id: data.function,
							onDispose: (disposable: () => void) => {
								onDisposeCallbacks.push(disposable);
							},
							pin: () => {
								this.pinnedRemoteFunctions.set(data.function, new WeakRef(proxy));
							},
						};
				}
				return undefined;
			},
			has: (_, method) => {
				switch (method) {
					case Symbol.dispose:
					case Symbol.asyncDispose:
					case disposeNonPinned:
					case metadata:
						return true;
				}
				return false;
			},
			apply: (_, __, argArray) => {
				if (isDisposed) throw new Error('Function is disposed and thus cannot be called');
				return this.rpc.invokeRemoteMethod(data.function, argArray);
			},
		}) as FunctionLikeProxy;
		this.finalizers.register(proxy, { invoke: disposeFunction, data }, proxy);
		deserializer.addDisposable(new WeakRef(proxy));
		return { success: true, value: proxy };
	}
}
