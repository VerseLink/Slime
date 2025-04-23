import { SerializerPair } from './RpcSerializer';

export class MapSerializer implements SerializerPair<Map<unknown, unknown>> {
	canSerialize(object: unknown): boolean {
		return Array.isArray(object) || object instanceof Set;
	}

	serialize(object: Map<unknown, unknown>, serializer: SerializerProvider): RpcSerializedValue {
		const array: [RpcSerializedValue, RpcSerializedValue][] = [];
		for (let [key, value] of object) {
			array.push([serializer.serialize(key), serializer.serialize(value)]);
		}
		return {
			collection: {
				type: 'map',
				content: array,
			},
		};
	}

	deserialize(
		value: RpcSerializedValue,
		deserializer: DeserializerProvider
	): DeserializedValueResult<Map<unknown, unknown>> {
		if (typeof value !== 'object' || value == null || !('collection' in value)) return { success: false };
		switch (value.collection.type) {
			case 'map':
				return {
					success: true,
					value: new Map(
						value.collection.content.map(([key, value]) => [
							deserializer.deserialize(key),
							deserializer.deserialize(value),
						])
					),
				};
			default:
				return { success: false };
		}
	}
}
