export type ApiQueryResponse<T> = {
    success: true;
    result: T;
} | ApiQueryFailedResponse;

export type ApiQueryFailedResponse = {
    success: false;
    error: string;
};