import { CompiledQuery, Kysely, Sql } from "kysely";

type HistoryTable = {
    version: number;
    bookmark: string;
    timestamp: number;
}

type VersionTable = {
    version: number;
}

type SqlMigrationScriptContent = string | string[] | CompiledQuery | CompiledQuery[];
export type SqlMigrationScript = SqlMigrationScriptContent | ((id: number) => PromiseLike<SqlMigrationScriptContent>);

export interface SqlSchemaMigration {
    /**
     * Each migration is identified by this number. You should always use monotonically
     * increasing numbers for any new migration added, and never change already applied
     * migrations.
     * If you modify the `sql` statement of an already applied migration it will not be applied.
     */
    version: number;

    /**
     * Just a description for you, the coder, to know what the migration is about.
     * This is not used in any way by the migrations runner.
     */
    description?: string;

    /**
     * The SQL statement to execute for a single schema migration.
     * Can be multiple statements separated by semicolon (`;`).
     * This statement is passed directly to the `storage.sql.exec()` function.
     * See https://developers.cloudflare.com/durable-objects/api/storage-api/#sqlexec
     *
     * You should always try and make your SQL statements to be safe to run multiple times.
     * Even though `SQLSchemaMigrations.runAll()` keeps track of the last migration ID and
     * never runs anything less than that ID, it's best practice for your statements to be defensive.
     * For example use `CREATE TABLE IF NOT EXISTS` instead of `CREATE TABLE`.
     *
     * Also, you should never change the `sql` code of an already ran migration. Add a new entry
     * in the `SQLSchemaMigrationsConfig.migrations` list altering the schema as you wish.
     *
     */
    sql: SqlMigrationScript;
}

export interface DurableObjectSqlMigrationConfig {

    migrations: SqlSchemaMigration[];

    tableNames?: {
        version?: string;
        /** The table to name to store migration data */
        history?: string;
    }
}

/**
 * @deprecated Use Drizzle Migration instead.
 */
export class DurableObjectSqlMigration {

    private migrations: SqlSchemaMigration[];
    private state: DurableObjectState;
    private _version?: number | null;

    constructor(state: DurableObjectState, config: DurableObjectSqlMigrationConfig) {
        this.state = state;
        this.migrations = config.migrations.sort((a, b) => a.version - b.version);
        this.tableName = { 
            version: config.tableNames?.version ?? "__sql_migration_version",
            history: config.tableNames?.history ?? "__sql_migration_history"
        };
        // check if migration has duplicate?
    }
    
    tableName: { version: string; history: string };

    private get sql() { return this.state.storage.sql; }

    get version(){ 
        if (this._version !== undefined)
            return this._version; 
        this.sql.exec(`CREATE TABLE IF NOT EXISTS "${this.tableName.version}" ("version" INTEGER) WITHOUT ROWID;`);
        const cursor = this.sql.exec<VersionTable>(`SELECT * FROM "${this.tableName.version}"`);
        const single = cursor.next();
        if (!single.done) {
            this._version = single.value.version;
            return this._version;
        }
        this._version = this.migrations.length !== 0 ? this.migrations[0].version : null; // first version of migration
        this.sql.exec(`INSERT INTO "${this.tableName.version}"("version") VALUES(${this._version})`);
        return this._version;
    }

    get isLatestVersion() {
        if (this.migrations.length === 0)
            return false;
        return this.version === this.migrations[this.migrations.length - 1].version;
    }

    private async runMigrationScript(script: SqlMigrationScript, scriptVersion: number) {
        // handl string
        if (typeof script === "string") {
            this.sql.exec(script);
            return;
        }
        if (typeof script === "function") {
            this.runMigrationScript(await script(scriptVersion), scriptVersion);
            return;
        }
        if (!Array.isArray(script)) {
            this.sql.exec(script.sql, script.parameters);
            return;
        }
        // handle string[] | CompiledQuery[]
        if (script.length === 0)
            return;
        if (script.every(child => typeof child === "string")) {
            for(let childScript of script) {
                this.sql.exec(childScript);
            }
            return;
        }
        for (let childScript of script) {
            this.sql.exec(childScript.sql, childScript.parameters);
        }
        return;
    }

    private nextMigrationScript() {
        if (this.version === null)
            return this.migrations[0];
        for(let migration of this.migrations) {
            if (migration.version > this.version) {
                return migration;
            }
        }
        return null;
    }
    
    private prevMigrationScript() {
        if (this.version === null)
            return null;
        for(let migration of this.migrations) {
            if (migration.version < this.version) {
                return migration;
            }
        }
        return null;
    }


    private nextMigrationScripts() {
        if (this.version === null)
            return this.migrations;
        for(let i = 0 ; i < this.migrations.length; ++i) {
            const migration = this.migrations[i];
            if (migration.version <= this.version) {
                continue;
            }
            return this.migrations.slice(i);
        }
        return null;
    }

    private async migrateTo(migrations: SqlSchemaMigration[]) {
        if (migrations.length === 0)
            return;
        const final = migrations[0];
        const bookmark = await this.state.storage.getCurrentBookmark();
        await this.state.storage.transaction(async () => {
            this.sql.exec(`CREATE TABLE IF NOT EXISTS "${this.tableName.version}" ("version" INTEGER PRIMARY KEY, "bookmark" TEXT, "timestamp" INTEGER) WITHOUT ROWID;`);
            for (let migration of migrations) {
                await this.runMigrationScript(migration.sql, migration.version);
            }
            this.sql.exec(`INSERT INTO "${this.tableName.version}"("version", "bookmark", "timestamp") VALUES(${final.version}, '${bookmark}', '${Date.now()}')`);
            this.sql.exec(`UPDATE "${this.tableName.version}" SET "version" = ${final.version}`);
        });
    }

    async migrateNext() {
        if (this.isLatestVersion)
            return false;
        const nextScript = this.nextMigrationScript();
        if (nextScript == null)
            return false;
        await this.migrateTo([nextScript]);
        return true;
    }

    async migrateToLatest() {
        if (this.isLatestVersion)
            return false;
        const nextScripts = this.nextMigrationScripts();
        if (nextScripts == null)
            return false;
        await this.migrateTo(nextScripts);
        return true;
    }

    /** 
     * Rollback to previous version of the database. WARNING: Any write occur after the migration WILL be lost. 
     * Once rollbacked, exception will be thrown and the Durable Object will restart.
     * */
    async rollbackOnce(): Promise<false | never> {
        if (this.version === null)
            return false;
        const prevScript = this.prevMigrationScript();
        if (prevScript == null)
            return false;
        const bookmark = this.state.storage.transactionSync(() => {
            // Check if history table even exists
            const tableCursor = this.sql.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${this.tableName.version}'`);
            if (tableCursor.next().done)
                return null;
            // Get the closest largest non-equal bookmark, if there's no match it means we can't rollback
            const cursor = this.sql.exec<HistoryTable>(`SELECT "bookmark" FROM "${this.tableName.version}" WHERE "version" < ${this.version} ORDER BY "version" DESC LIMIT 1`);
            const single = cursor.next();
            if (single.done)
                return null;
            return single.value.bookmark;
        });
        if (bookmark == null)
            return false;
        await this.state.storage.onNextSessionRestoreBookmark(bookmark);
        this.state.abort(`Rollback DO SQL storage to bookmark ${bookmark}`);
        // ensure this is never
        throw new Error("Durable Object restarting");
    }

}