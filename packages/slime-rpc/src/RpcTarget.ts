export class RpcTarget {}

const isSerializableClass: Map<Function, string> = new Map();

function addRpcClass(target: Function, name: string) {
	isSerializableClass.set(target, name);
}

export function RpcClass(target: Function) {
	addRpcClass(target, target.name);
}

export function RpcClassAs(asClassName: string) {
	return (target: Function) => {
		addRpcClass(target, asClassName);
	};
}

export function getRpcNameFromPrototype(item: object) {
	let proto = item;
	while (proto && proto !== Object.prototype) {
		if (!('constructor' in proto)) return undefined;
		let target = isSerializableClass.get(proto.constructor);
		if (target) return target;
		proto = Object.getPrototypeOf(proto);
	}
	return undefined;
}

export function isRpcClass(item: object) {
	return getRpcNameFromPrototype(item) != null;
}
