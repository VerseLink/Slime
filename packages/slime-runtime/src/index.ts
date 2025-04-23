import { Page as PageV1, SlimeScript as SlimeScriptV1 } from "./v1";
export * from "./currency";

export type SlimeRuntime<V extends number> = {
    version: V;
}

export type SlimeScriptMetadata = {
    runtime: SlimeRuntime<1>;
    getScript(page: PageV1): Promise<SlimeScriptV1> | SlimeScriptV1;
}
