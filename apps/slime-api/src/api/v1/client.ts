import { hc, InferResponseType } from "hono/client";
import v1 from ".";

const client = hc<typeof v1>('');
export type SlimeApi = typeof client;
export const slimeApiClient = (...args: Parameters<typeof hc>): SlimeApi => hc<typeof v1>(...args);

export type Stores = InferResponseType<SlimeApi["api"]["v1"]["stores"]["$get"]>;

export type { StoreInformation } from "./stores";