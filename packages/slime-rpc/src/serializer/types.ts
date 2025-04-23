import type { StructuredCloneableData, StructuredCloneablePrimitive } from 'type-fest/source/structured-cloneable';
import { RpcFunctionId } from '../RpcFunctionId';
import { disposeNonPinned } from '../symbols';

export type RpcSerializedValue =
    | StructuredCloneablePrimitive
    | StructuredCloneableData
    | { function: RpcFunctionId; name?: string }
    | { object: Record<string | number, RpcSerializedValue>, prototypeKey?: string }
    | {
            collection:
                | { type: 'set' | 'array' | 'iterable'; content: RpcSerializedValue[] }
                | { type: 'map'; content: [RpcSerializedValue, RpcSerializedValue][] };
      }
    | { custom: string; content: RpcSerializedValue };

export type RpcDeserializedValue = (Disposable & AsyncDisposable & StructuredCloneableData) | StructuredCloneablePrimitive;

export type DeserializedValueResult<T> = { success: true; value: T } | { success: false; value?: undefined };

export type Serializer<T> = {
	canSerialize(object: unknown, serializer: SerializerProvider): boolean;
	serialize(object: T, serializer: SerializerProvider): RpcSerializedValue;
};

export type SerializerProvider = {
	canSerialize(object: unknown): boolean;
	serialize<T>(object: T): RpcSerializedValue;
};

export type AddDisposable = (...args: DisposableOrAsyncDisposable[]) => void;

export type Deserializer<T> = {
	deserialize(value: RpcSerializedValue, deserializer: DeserializerProvider): DeserializedValueResult<T>;
};

export type DeserializerProvider = {
	customTypes: Record<string, { prototype: object; } & Function>;
	deserialize<T>(value: RpcSerializedValue): T;
	addDisposable(disposable: WeakRef<DisposableOrAsyncDisposable>): void;
};

export type SerializerSource<T> = Serializer<T> & Deserializer<T>;

export type DisposableOrAsyncDisposable = {
	[Symbol.dispose]?: () => void;
	[Symbol.asyncDispose]?: () => Promise<void>;
	[disposeNonPinned]?: () => Promise<void> | void;
};
