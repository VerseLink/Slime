
declare module "cloudflare:test" {
    export interface ProvidedEnv {
        JWT_KEY_KV_STORE: KVNamespace;
    }
}