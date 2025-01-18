import { DurableObjectSqliteQuery } from "@/database/query";
import { DurableObject } from "cloudflare:workers";

export class DurableObjectSqlite<TEnv = unknown> extends DurableObject<TEnv> {

    protected sql: DurableObjectSqliteQuery = new DurableObjectSqliteQuery(this.ctx.storage);

    constructor(ctx: DurableObjectState, env: TEnv) {
        super(ctx, env);
        // check for migration
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