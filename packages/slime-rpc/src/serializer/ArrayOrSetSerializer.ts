import { RpcSerializedValue } from './types';
import { DeserializedValueResult, DeserializerProvider, SerializerSource, SerializerProvider } from './types';

export class ArrayOrSetSerializer implements SerializerSource<Set<unknown> | Array<unknown>> {
	canSerialize(object: unknown): boolean {
		return Array.isArray(object) || object instanceof Set;
	}

	serialize(object: Set<unknown> | Array<unknown>, serializer: SerializerProvider): RpcSerializedValue {
		const array = [];
		for (let item of object) {
			array.push(serializer.serialize(item));
		}
		return {
			collection: {
				type: object instanceof Set ? 'set' : 'array',
				content: array,
			},
		};
	}

	deserialize(
		value: RpcSerializedValue,
		deserializer: DeserializerProvider
	): DeserializedValueResult<Set<unknown> | unknown[]> {
		if (typeof value !== 'object' || value == null || !('collection' in value)) {
			return { success: false };
		}
		switch (value.collection.type) {
			case 'array':
				let array = value.collection.content.map((x) => deserializer.deserialize(x));
				return { success: true, value: array };
			case 'set':
				let set = value.collection.content.map((x) => deserializer.deserialize(x));
				return { success: true, value: new Set(set) };
			default:
				return { success: false };
		}
	}
}
