import { getRpcNameFromPrototype, isRpcClass, RpcTarget } from '../RpcTarget';
import {
	RpcSerializedValue,
	DeserializedValueResult,
	DeserializerProvider,
	SerializerSource,
	SerializerProvider,
} from './types';

function getAllProperties(obj: object) {
	let proto = obj;
	const members = new Map<string, any>();
	while (proto && proto !== Object.prototype) {
		const descriptors = Object.getOwnPropertyDescriptors(proto);
		for (let key in descriptors) {
			if (members.has(key)) continue;
			const descriptor = descriptors[key];
			// skip any constructors of a class
			if (key === 'constructor' && typeof descriptor.value === 'function') continue;
			// because we treat getters as value and not RPC-functions, we get the result as soon as possible
			// we don't care about setters since non RPC-functions are treated as readonly (that is, setting the value at remote client doesn't update the ones here)
			if (descriptor.get) {
				members.set(key, descriptor.get.bind(obj)());
				continue;
			}
			if (descriptor.value != null) {
				if (typeof descriptor.value === 'function') {
					members.set(key, descriptor.value.bind(obj));
					continue;
				}
				members.set(key, descriptor.value);
			}
			// we don't care about setters
		}
		proto = Object.getPrototypeOf(proto);
	}
	return members;
}

export class DefaultClassSerializer implements SerializerSource<object> {
	canSerialize(object: unknown): boolean {
		if (object instanceof RpcTarget) {
			return true;
		}
		return typeof object === 'object' && object != null && isRpcClass(object);
	}

	serialize(object: object, serializer: SerializerProvider): RpcSerializedValue {
		// this doesn't work well with property chain!
		// const entries = Object.entries(object).map(([key, value]) => [key, serializer.serialize(value)]);
		const entries: [string, RpcSerializedValue][] = [];

		for (let [key, value] of getAllProperties(object)) {
			entries.push([key, serializer.serialize(value)]);
		}

		return {
			object: Object.fromEntries(entries),
			prototypeKey: getRpcNameFromPrototype(object),
		};
	}

	deserialize(value: RpcSerializedValue, deserializer: DeserializerProvider): DeserializedValueResult<object> {
		if (typeof value !== 'object' || value == null) {
			return { success: false };
		}
		if (!('object' in value)) {
			return { success: false };
		}
		const entries = Object.entries(value.object).map(([key, value]) => [key, deserializer.deserialize(value)]);
		const obj = Object.fromEntries(entries);
		if (value.prototypeKey !== undefined) {
			const proto = deserializer.customTypes[value.prototypeKey];
			if (proto) Object.setPrototypeOf(obj, proto.prototype);
		}
		return { success: true, value: obj };
	}
}
