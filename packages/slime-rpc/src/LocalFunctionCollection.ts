import { RpcFunctionId } from "./RpcFunctionId";

export class LocalFunctionCollection {
    private idMap: Map<RpcFunctionId, Function> = new Map();
    private functionMap: Map<Function, RpcFunctionId> = new Map();

    get idList() { return this.idMap.keys() };

    addFunction(func: Function) {
        const id = crypto.randomUUID();
        this.idMap.set(id, func);
        this.functionMap.set(func, id);
        return id;
    }

    getFunctionById(id: RpcFunctionId) {
        return this.idMap.get(id);
    }

    getIdByFunction(func: Function) {
        return this.functionMap.get(func);
    }

    deleteFunction(id: RpcFunctionId) {
        const func = this.idMap.get(id);
        if (!func)
            return;
        this.idMap.delete(id);
        this.functionMap.delete(func);
    }
}