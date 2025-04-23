import { disposeNonPinned } from '../symbols';
import { isPrimitiveOrBoxedPrimitive } from '../util';
import {
	DeserializedValueResult,
	DeserializerProvider,
	DisposableOrAsyncDisposable,
	RpcDeserializedValue,
	RpcSerializedValue,
	SerializerSource,
	SerializerProvider,
} from './types';

export interface RpcSerializerOptions {
	serializers: SerializerSource<unknown>[];
	customTypes?: Record<string, { prototype: object; } & Function>;
	maxDepth: number;
}

export class RpcSerializer {
	constructor(options: RpcSerializerOptions) {
		this.serializers = options.serializers;
		this.maxDepth = options.maxDepth;
		this.customTypes = options.customTypes ?? {};
	}

	private serializers: SerializerSource<unknown>[];
	private customTypes: RpcSerializerOptions["customTypes"] & {};
	private maxDepth: number;

	private createSerializer(depth: number) {
		if (depth > this.maxDepth) {
			throw new Error('Object depth too deep, may have self reference or recursion');
		}
		return {
			canSerialize: (object: unknown) => {
				const serializer = this.createSerializer(depth++);
				for (let builtIn of this.serializers) {
					if (builtIn.canSerialize(object, serializer)) {
						return true;
					}
				}
				return false;
			},
			serialize: (object: any): RpcSerializedValue => {
				const serializer = this.createSerializer(depth++);
				for (let builtIn of this.serializers) {
					if (builtIn.canSerialize(object, serializer)) {
						return builtIn.serialize(object, serializer);
					}
				}
				throw new Error(`Unable to serialize ${object}`);
			},
		} satisfies SerializerProvider;
	}

	private createDeserializer(
		depth: number,
		addDisposableArg: (disposable: WeakRef<DisposableOrAsyncDisposable>) => void,
	) {
		if (depth > 256) {
			throw new Error('Object depth too deep, may have self reference or recursion');
		}
		const deserializer: DeserializerProvider = {
			customTypes: this.customTypes,
			deserialize: <T>(value: RpcSerializedValue): T => {
				const deserializer = this.createDeserializer(depth++, addDisposableArg);
				for (let builtIn of this.serializers) {
					const result = builtIn.deserialize(value, deserializer);
					if (result.success) {
						return result.value as T;
					}
				}
				throw new Error(`Unable to deserialize ${value}`);
			},
			addDisposable: (disposable: WeakRef<DisposableOrAsyncDisposable>) => {
				addDisposableArg(disposable);
			},
		};
		return deserializer;
	}

	serialize(object: any): RpcSerializedValue {
		return this.createSerializer(0).serialize(object);
	}

	deserialize(data: RpcSerializedValue): RpcDeserializedValue {
		const disposables: WeakRef<DisposableOrAsyncDisposable>[] = [];
		const value = this.createDeserializer(0, (disposable) =>
			disposables.push(disposable),
		).deserialize<RpcDeserializedValue>(data);

		if (typeof value !== "object" || value == null) {
			return value;
		}
		return new Proxy(value, {
			get: (target, method) => {
				switch (method) {
					case Symbol.dispose:
						return () => {
							for (let disposableRef of disposables) {
								const disposable = disposableRef.deref();
								if (!disposable) {
									continue;
								}
								if (disposeNonPinned in disposable) {
									disposable[disposeNonPinned]?.();
									continue;
								}
								if (Symbol.dispose in disposable) {
									disposable[Symbol.dispose]?.();
									continue;
								}
							}
							if (Symbol.dispose in target) {
								return target[Symbol.dispose];
							}
						};
					case Symbol.asyncDispose:
						return async () => {
							for (let disposableRef of disposables) {
								const disposable = disposableRef.deref();
								if (!disposable) {
									continue;
								}
								if (disposeNonPinned in disposable) {
									await disposable[disposeNonPinned]?.();
									continue;
								}
								if (Symbol.asyncDispose in disposable) {
									await disposable[Symbol.asyncDispose]?.();
									continue;
								}
								disposable[Symbol.dispose]?.();
							}
							if (Symbol.asyncDispose in target) {
								return target[Symbol.asyncDispose];
							}
						};
					default:
						return target[method as keyof typeof target]; // doesn't matter if it returns undefined
				}
			},
			has: (target, method) => {
				return method === Symbol.dispose || method === Symbol.asyncDispose || method in target;
			},
		});
	}
}
