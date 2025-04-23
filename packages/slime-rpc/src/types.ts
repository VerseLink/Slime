// This structure is heavily inspired by cloudflare workers RPC system
// This type declartion system is flawed, but it "mostly works", so let's just keep it this way for now

import { metadata } from './symbols';

const __RPC_TARGET_BRAND: '__RPC_TARGET_BRAND' = '__RPC_TARGET_BRAND';
const __RPC_STUB_BRAND: '__RPC_STUB_BRAND' = '__RPC_STUB_BRAND';
interface RpcTargetBranded {
	[__RPC_TARGET_BRAND]: never;
}

type RpcStubable = RpcTargetBranded | ((...args: any[]) => any);

// Types that can be passed over RPC
// The reason for using a generic type here is to build a serializable subset of structured
//   cloneable composite types. This allows types defined with the "interface" keyword to pass the
//   serializable check as well. Otherwise, only types defined with the "type" keyword would pass.
type Serializable<T> =
	// Structured cloneables
	| void
	| undefined
	| null
	| boolean
	| number
	| bigint
	| string
	| ArrayBuffer
	| DataView
	| Date
	| Error
	| RegExp
	// Structured cloneable composites
	| Map<
			T extends Map<infer U, unknown> ? Serializable<U> : never,
			T extends Map<unknown, infer U> ? Serializable<U> : never
	  >
	| Set<T extends Set<infer U> ? Serializable<U> : never>
	| ReadonlyArray<T extends ReadonlyArray<infer U> ? Serializable<U> : never>
	| {
			[K in keyof T]: K extends number | string ? Serializable<T[K]> : never;
	  }
	| RpcFunction<RpcStubable>
	// Serialized as stubs, see `Stubify`
	| RpcStubable;

interface StubBase<T extends RpcStubable> extends Disposable {
	[__RPC_STUB_BRAND]: T;
	[metadata]: {
		id: string;
		pin: () => void;
		onDispose(cb: () => void): void;
	};
}

// Recursively rewrite all `Stubable` types with `Stub`s
type Stubify<T> = T extends RpcStubable
	? RpcFunction<T>
	: T extends Map<infer K, infer V>
		? Map<Stubify<K>, Stubify<V>>
		: T extends Set<infer V>
			? Set<Stubify<V>>
			: T extends Array<infer V>
				? Array<Stubify<V>>
				: T extends ReadonlyArray<infer V>
					? ReadonlyArray<Stubify<V>>
					: T extends {
								[key: string | number]: any;
						  }
						? {
								[K in keyof T]: Stubify<T[K]>;
							}
						: T;

// Recursively rewrite all `Stub<T>`s with the corresponding `T`s.
// Note we use `StubBase` instead of `Stub` here to avoid circular dependencies:
// `Stub` depends on `Provider`, which depends on `Unstubify`, which would depend on `Stub`.
type Unstubify<T> =
	T extends StubBase<infer V>
		? V
		: T extends Map<infer K, infer V>
			? Map<Unstubify<K>, Unstubify<V>>
			: T extends Set<infer V>
				? Set<Unstubify<V>>
				: T extends Array<infer V>
					? Array<Unstubify<V>>
					: T extends ReadonlyArray<infer V>
						? ReadonlyArray<Unstubify<V>>
						: T extends {
									[key: string | number]: unknown;
							  }
							? {
									[K in keyof T]: Unstubify<T[K]>;
								}
							: T;
type UnstubifyAll<A extends any[]> = {
	[I in keyof A]: Unstubify<A[I]>;
};

// Utility type for adding `Provider`/`Disposable`s to `object` types only.
// Note `unknown & T` is equivalent to `T`.
type MaybeProvider<T> = T extends object ? RpcProvider<T> : unknown;
type MaybeDisposable<T> = T extends object ? Disposable : unknown;

// Type for method return or property on an RPC interface.
// - Stubable types are replaced by stubs.
// - Serializable types are passed by value, with stubable types replaced by stubs
//   and a top-level `Disposer`.
// Everything else can't be passed over PRC.
// Technically, we use custom thenables here, but they quack like `Promise`s.
// Intersecting with `(Maybe)Provider` allows pipelining.
type Result<R> = R extends RpcStubable
	? Promise<RpcFunction<R>> & RpcProvider<R>
	: R extends Serializable<R>
		? Promise<Stubify<R> & MaybeDisposable<R>> & MaybeProvider<R>
		: never;

// Type for method or property on an RPC interface.
// For methods, unwrap `Stub`s in parameters, and rewrite returns to be `Result`s.
// Unwrapping `Stub`s allows calling with `Stubable` arguments.
// For properties, rewrite types to be `Result`s.
// In each case, unwrap `Promise`s.
type MethodOrProperty<V> = V extends (...args: infer P) => infer R
	? (...args: UnstubifyAll<P>) => Result<Awaited<R>>
	: Result<Awaited<V>>;

// Type for the callable part of an `Provider` if `T` is callable.
// This is intersected with methods/properties.
type MaybeCallableProvider<T> = T extends (...args: any[]) => any ? MethodOrProperty<T> : unknown;

export type RpcFunction<T extends RpcStubable> = RpcProvider<T> & StubBase<T>;

// Base type for all other types providing RPC-like interfaces.
// Rewrites all methods/properties to be `MethodOrProperty`s, while preserving callable types.
// `Reserved` names (e.g. stub method names like `dup()`) and symbols can't be accessed over RPC.
export type RpcProvider<T extends object, Reserved extends string = never> = MaybeCallableProvider<T> & {
	[K in Exclude<keyof T, Reserved | symbol | keyof StubBase<never>>]: MethodOrProperty<T[K]>;
} & Disposable;

type MapRpcArgument<T> = {
	[K in keyof T]: RpcArgument<T[K]>;
};

type AwaitedMethodOrProperty<V> = V extends (...args: infer P) => infer R
	? (...args: MapRpcArgument<P>) => Awaited<R> | R | RpcObjectify<R> | RpcObjectify<Awaited<R>>
	: Awaited<V> | V | RpcObjectify<V> | RpcObjectify<Awaited<V>>;

type RpcObjectify<T> =
	T extends Map<infer K, infer V>
		? Map<RpcObjectify<K>, RpcObjectify<V>>
		: T extends Set<infer V>
			? Set<RpcObjectify<V>>
			: T extends Array<infer V>
				? Array<RpcObjectify<V>>
				: T extends ReadonlyArray<infer V>
					? ReadonlyArray<RpcObjectify<V>>
					: T extends string
						? string
						: T extends object
							? RpcObject<T>
							: T;

export type RpcObject<T extends object, Reserved extends string = never> = {
	[K in Exclude<keyof T, Reserved | symbol | keyof StubBase<never>>]: AwaitedMethodOrProperty<T[K]>;
};

type ArgumentMethodOrProperty<V> = V extends (...args: infer P) => infer R
	? RpcFunction<(...args: UnstubifyAll<P>) => Result<Awaited<R>>>
	: V;

type RpcArgumentObject<T extends object, Reserved extends string = never> = MaybeCallableProvider<T> & {
	[K in Exclude<keyof T, Reserved | symbol | keyof StubBase<never>>]: ArgumentMethodOrProperty<T[K]>;
} & Disposable;


type RpcArgumentFunction<T extends RpcStubable> = ArgumentMethodOrProperty<T>;

export type RpcArgument<T> = T extends string
	? T
	: T extends RpcStubable
		? RpcArgumentFunction<T>
		: T extends object
			? RpcArgumentObject<T>
			: T;
