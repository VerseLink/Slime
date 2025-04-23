import type { StructuredCloneableData } from "type-fest/source/structured-cloneable";
import { RpcSerializedValue } from "./types";
import { SerializerSource, DeserializedValueResult } from "./types";

function isInstanceOf(object: unknown, key: string) {
    const type = globalThis[key as keyof typeof globalThis];
    if (type) return object instanceof type;
    return false;
}


export class StructuredCloneableSerializer implements SerializerSource<StructuredCloneableData> {
    validTarget(object: unknown): object is StructuredCloneableData {
        return (
            object instanceof ArrayBuffer ||
            object instanceof DataView ||
            object instanceof Date ||
            object instanceof Error ||
            object instanceof RegExp ||
            // typed array
            object instanceof Int8Array ||
            object instanceof Int16Array ||
            object instanceof Int32Array ||
            object instanceof BigInt64Array ||
            object instanceof Uint8Array ||
            object instanceof Uint8ClampedArray ||
            object instanceof Uint16Array ||
            object instanceof Uint32Array ||
            object instanceof BigUint64Array ||
            object instanceof Float32Array ||
            object instanceof Float64Array ||
            // DOM or Node types
            isInstanceOf(object, 'Blob') ||
            isInstanceOf(object, 'File') ||
            // DOM exclusive types
            isInstanceOf(object, 'AudioData') ||
            isInstanceOf(object, 'CropTarget') ||
            isInstanceOf(object, 'CryptoKey') ||
            isInstanceOf(object, 'DOMException') ||
            isInstanceOf(object, 'DOMMatrix') ||
            isInstanceOf(object, 'DOMMatrixReadOnly') ||
            isInstanceOf(object, 'DOMPoint') ||
            isInstanceOf(object, 'DOMPointReadOnly') ||
            isInstanceOf(object, 'DOMQuad') ||
            isInstanceOf(object, 'DOMRect') ||
            isInstanceOf(object, 'DOMRectReadOnly') ||
            isInstanceOf(object, 'FileList') ||
            isInstanceOf(object, 'FileSystemDirectoryHandle') ||
            isInstanceOf(object, 'FileSystemFileHandle') ||
            isInstanceOf(object, 'FileSystemHandle') ||
            isInstanceOf(object, 'GPUCompilationInfo') ||
            isInstanceOf(object, 'GPUCompilationMessage') ||
            isInstanceOf(object, 'ImageBitmap') ||
            isInstanceOf(object, 'ImageData') ||
            isInstanceOf(object, 'RTCCertificate') ||
            isInstanceOf(object, 'VideoFrame')
        );
    }

    canSerialize(object: unknown): object is StructuredCloneableData {
        return this.validTarget(object);
    }

    serialize(object: StructuredCloneableData): RpcSerializedValue {
        return object;
    }

    deserialize(value: RpcSerializedValue): DeserializedValueResult<StructuredCloneableData> {
        if (this.validTarget(value)) {
            return { success: true, value };
        }
        return { success: false };
    }
}