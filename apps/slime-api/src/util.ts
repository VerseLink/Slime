import { ApiQueryResponse } from "@slime/api-v1/response";

export namespace ArrayUtil {
    /**
     * Returns the last element of the array, or the string or undefined if the array is empty
     */
    export function lastOrSingle(str: string | string[] | undefined) {
        if (typeof str === "string")
            return str;
        if (str === undefined)
            return undefined;
        return str[str.length - 1];
    }

    export function singleOrDefault<T>(array: T[] | undefined | null, defaultValue: T) {
        if (array == null)
            return defaultValue;
        return array.length === 0 ? defaultValue : array[0];
    }
}


export namespace ApiResponse {
    export function success<T>(data: T) : ApiQueryResponse<T> {
        return {
            success: true,
            result: data
        };
    }
}