import { RpcClient, RpcOptions, RpcServer } from './rpc';

import * as Symbols from './symbols';
import { RpcProvider } from './types';
export { RpcClass, RpcTarget, RpcClassAs } from "./RpcTarget";
export type { LogLevel } from "./logging";
export * from "./types";

function createRpcClient(proxyTarget: any, options: RpcOptions) {
	const client = new RpcClient(options);
	return new Proxy(proxyTarget, {
		get: (target, method) => {
			if (method === Symbol.dispose || method === Symbol.asyncDispose) {
				return () => {
					if (Symbol.dispose in target) {
						target[Symbol.dispose]();
					}
					client[Symbol.dispose]();
				};
			}
			if (typeof method !== 'string') {
				throw new Error('Unable to call symbol methods over RPC');
			}
			return (...args: any[]) => {
				return client.invoke(method, args);
			}
		},
		has: (_, method) => {
			// in the future we may want to know what types the target server provides
			// though this is JS so things can be dynamic...
			return method === Symbol.dispose || method === Symbol.asyncDispose;
		},
	});
}

export namespace MessageRpc {
    export import metadata = Symbols.metadata;

	export function createClient<T extends object>(options: RpcOptions): RpcProvider<T> {
		return createRpcClient({}, options);
	}

	export function createServer(server: object, options: RpcOptions) {
		return new RpcServer(server, options);
	}
}
