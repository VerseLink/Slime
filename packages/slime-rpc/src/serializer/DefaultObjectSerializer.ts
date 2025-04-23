import {
	RpcSerializedValue,
	DeserializedValueResult,
	DeserializerProvider,
	SerializerSource,
	SerializerProvider,
} from './types';

export class DefaultObjectSerializer implements SerializerSource<object> {

	canSerialize(object: unknown): boolean {
		return typeof object === 'object';
	}

	serialize(object: object, serializer: SerializerProvider): RpcSerializedValue {
		// this doesn't work well with property chain!
		const entries = Object.entries(object).map(([key, value]) => [key, serializer.serialize(value)]);
		return {
			object: Object.fromEntries(entries),
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
		if (value.prototypeKey) {
			Object.setPrototypeOf(obj, deserializer.customTypes[value.prototypeKey].prototype);
		}
		return { success: true, value: obj };
	}
}
