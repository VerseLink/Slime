import type { StructuredCloneablePrimitive } from "type-fest/source/structured-cloneable";
import { RpcSerializedValue } from "./types";
import { DeserializedValueResult, SerializerSource } from "./types";

export class PrimitiveSerializer implements SerializerSource<StructuredCloneablePrimitive> {
    validTarget(object: unknown): object is StructuredCloneablePrimitive {
        switch (typeof object) {
            case 'bigint':
            case 'boolean':
            case 'number':
            case 'string':
            case 'undefined':
                return true;
            case 'object':
                return object == null;
            default:
                return false;
        }
    }

    canSerialize(object: unknown) {
        return this.validTarget(object);
    }

    serialize(object: StructuredCloneablePrimitive): RpcSerializedValue {
        return object;
    }

    deserialize(value: RpcSerializedValue): DeserializedValueResult<StructuredCloneablePrimitive> {
        if (this.validTarget(value)) {
            return { success: true, value };
        }
        return { success: false };
    }
}
