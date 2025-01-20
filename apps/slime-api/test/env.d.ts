import { MockSqlBackupDo } from "./mock-do.ts-template";

declare module "cloudflare:test" {
    export interface ProvidedEnv extends Env {
        MockSqlBackupDO: DurableObjectNamespace<MockSqlBackupDo>;
    }
}