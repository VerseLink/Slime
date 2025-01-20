import { DurableObjectSqliteQuery } from "@/database/query";
import { DurableObject } from "cloudflare:workers";
import { DurableObjectSqlMigration, SqlSchemaMigration } from "./util/DurableObjectSqlMigration";

export abstract class DurableObjectSqlite<TEnv = unknown> extends DurableObject<TEnv> {

    private _migrator?: DurableObjectSqlMigration;

    protected sql: DurableObjectSqliteQuery = new DurableObjectSqliteQuery(this.ctx.storage);
    protected get migrator() {
        if (this._migrator)
            return this._migrator;
        return this._migrator = new DurableObjectSqlMigration(this.ctx, { migrations: this.migrations });
    }

    constructor(ctx: DurableObjectState, env: TEnv) {
        super(ctx, env);
    }

    protected abstract get migrations(): SqlSchemaMigration[];

    private hasVersion() {
        // check if version table was ever created, it should be created if migrator was called
        return this.sql.raw(`SELECT name FROM sqlite_master WHERE type='table' AND name='${this.migrator.tableName.version}'`).singleOrNull() !== null;
    }

    /**
     * Officially creates a Durable Object.
     * Attempting to run other sql functions without creating or using existing DOs will likely result in error
     */
    async create() {
        await this.migrator.migrateToLatest();
    }

    async exists() {
        if (!this.hasVersion())
            return false;
        await this.migrator.migrateToLatest();
        return true;
    }

    async throwIfNotExist() {
        if (this.hasVersion()) {
            await this.migrator.migrateToLatest();
            return;
        }
        await this.destory();
    }

    /** Destory this DO instance, warning, all data WILL be lost! */
    async destory() {
        await this.ctx.storage.deleteAll();
        await this.ctx.storage.deleteAlarm();
        this.ctx.abort();
        throw new Error("Durable Object is not initialized");
    }

    async transaction<T extends DurableObjectStub<DurableObjectSqlite<unknown>>[], TReturn extends Rpc.Serializable<TReturn>>(sources: T, callback: () => Promise<TReturn>): Promise<TReturn> {
        // @ts-ignore
        return await this.ctx.storage.transaction(async (trx) => {
            if (sources != null && sources.length > 0) {
                const [next, ...remain] = [...sources];
                return await next.transaction(remain, callback);
            }
            try {
                return await callback();
            }
            catch (e) {
                trx.rollback();
                throw e;
            }
        });
    }

}