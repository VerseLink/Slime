import { isPrimitiveOrBoxedPrimitive } from '../util';
import {
	DeserializedValueResult,
	DeserializerProvider,
	RpcSerializedValue,
	SerializerProvider,
	SerializerSource,
} from './types';

// Serializes an Event object across JSON / StructureClonable boundary
// Warning, the deserialized Event object is a "synthetic" event, and cannot be passed to EventTarget (dispatchEvent)
// other then that it works pretty much like a normal Event, except functions which would not work

type RawEventValue = {
    name: string;
    type: string;
    data: Map<string | number, any>;
}

export class DefaultEventSerializer implements SerializerSource<Event> {

	canSerialize(object: unknown, serializer: SerializerProvider): boolean {
		return object instanceof Event;
	}

	serialize(event: Event, serializer: SerializerProvider): RpcSerializedValue {
        let key: keyof Event;
        let map = new Map();
		for (key in event) {
            const value = event[key];
            // we don't want to serialize any functions because it would be useless for most cases
			if (typeof value === 'function' || typeof value === "symbol") {
				continue;
			}
            // remove any global value of the object
			if (key in event.constructor || key in Object.getPrototypeOf(event.constructor)) {
                continue;
            }
            // only if we are sure that it can be serialized
            if (serializer.canSerialize(value))
                map.set(key, value);
		}
		return {
			custom: 'event',
			content: serializer.serialize({
                name: event.constructor.name,
                type: event.type,
                data: map,
            } satisfies RawEventValue)
		};
	}

	deserialize(value: RpcSerializedValue, deserializer: DeserializerProvider): DeserializedValueResult<Event> {
        if (isPrimitiveOrBoxedPrimitive(value) || !("custom" in value) || value.custom !== "event") {
            return { success: false };
        }
        const event = deserializer.deserialize<RawEventValue>(value.content);
        return {
            success: true,
            value: new Proxy(new Event(event.type), {
                get: (_, method) => {
                    // symbol cannot cross serialization
                    if (typeof method === "symbol")
                        return undefined;
                    return event.data.get(method);
                },
                getPrototypeOf: () => {
                    return globalThis[event.name as keyof typeof globalThis]?.prototype ?? globalThis["Event"].prototype;
                },
                has: (_, method) => {
                    if (typeof method === "symbol")
                        return false;
                    return event.data.has(method);
                },
                isExtensible: () => false,
                set: () => false,
                setPrototypeOf: () => false,
                deleteProperty: () => false,
                defineProperty: () => false,
                ownKeys: () => Array.from(event.data.keys()).map(x => x.toString()),
            })
        }
	}
}
