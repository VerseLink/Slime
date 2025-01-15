import { ApiQueryResponse } from "@slime/api-v1";

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
}

export namespace ApiResponse {
    export function success<T>(data: T) : ApiQueryResponse<T> {
        return {
            success: true,
            result: data
        };
    }
}