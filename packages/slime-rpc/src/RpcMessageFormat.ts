import { RpcFunctionId } from './RpcFunctionId';
import { RpcSerializedValue } from './serializer/types';

type RpcMessageFormatBase<Type, TContent, TRequestable extends boolean = false> = {
	serviceName: string;
	type: Type;
	content: TContent;
} & (TRequestable extends true ? { requestId: string } : { requestId?: undefined });

type RpcMessageRequestFormat<Type, TContent> = RpcMessageFormatBase<Type, TContent, true>;

type RpcMessageResponseFormat<Type, TResponse> = RpcMessageFormatBase<
	Type,
	{ success: true; result: TResponse } | { success: false; result: unknown },
	true
>;

export type RpcMessageFormat =
	| RpcMessageRequestFormat<
			'request',
			{
				method: string;
				args: RpcSerializedValue[];
			}
	  >
	| RpcMessageResponseFormat<'response', RpcSerializedValue>
	| RpcMessageRequestFormat<
			'callback-request',
			{
				id: RpcFunctionId;
				args: RpcSerializedValue[];
			}
	  >
	| RpcMessageResponseFormat<'callback-response', RpcSerializedValue>
	| RpcMessageFormatBase<'callback-dispose', { callbackId: RpcFunctionId }>
	| RpcMessageFormatBase<'close', { removedCallbacks: RpcFunctionId[] }>;

export type RpcMessageFormatMapped = {
	[K in RpcMessageFormat as K['type']]: K['content'];
};
