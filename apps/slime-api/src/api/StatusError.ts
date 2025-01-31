import { StatusCode } from "hono/utils/http-status";

type StatusErrorObject = {
    error?: string;
    [key: string]: any;
};

export class StatusError extends Error {
    status: StatusCode;
    body?: StatusErrorObject | string;

    constructor(status: StatusCode, body?: StatusErrorObject | string, options?: ErrorOptions) {
        super(typeof body === "string" ? body : body?.error, options);
        this.status = status;
        this.body = body;
    }
}