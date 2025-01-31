
declare module "cloudflare:test" {
    export interface ProvidedEnv {
        MockSqlBackupDO: DurableObjectNamespace<MockSqlBackupDo>;
    }
}