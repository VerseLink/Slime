import { RpcArgument, RpcFunction } from '../types';
import { isPrimitiveOrBoxedPrimitive } from '../util';
import {
	DeserializedValueResult,
	DeserializerProvider,
	RpcSerializedValue,
	SerializerProvider,
	SerializerSource,
} from './types';

export class AbortSignalSerializer implements SerializerSource<AbortSignal> {
	canSerialize(object: unknown, serializer: SerializerProvider): boolean {
		return object instanceof AbortSignal;
	}

	serialize(signal: AbortSignal, serializer: SerializerProvider): RpcSerializedValue {
		const complexFunction = async (callback: RpcArgument<(reason: any) => void>) => {
			const aborted = async () => {
				if (signal.reason && serializer.canSerialize(signal.reason)) await callback(signal.reason);
				else await callback(undefined);
				return;
			};
			if (signal.aborted) {
				await aborted();
			}
			signal.addEventListener('abort', () => aborted(), { once: true });
		};

		return {
			custom: 'signal',
			content: serializer.serialize(complexFunction),
		};
	}

	deserialize(value: RpcSerializedValue, deserializer: DeserializerProvider): DeserializedValueResult<AbortSignal> {
		if (isPrimitiveOrBoxedPrimitive(value) || !('custom' in value) || value.custom !== 'signal') {
			return { success: false };
		}
		const func = deserializer.deserialize<RpcFunction<(callback: (reason: any) => void) => Promise<void>>>(value.content);
		const abortController = new AbortController();
		func((reason) => { 
            abortController.abort(reason);
            func[Symbol.dispose]();
        });
		return { success: true, value: abortController.signal };
	}
}
