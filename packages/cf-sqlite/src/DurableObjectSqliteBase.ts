import { DurableObject, RpcTarget } from 'cloudflare:workers';
import { DurableSqliteQuery } from './DurableSqliteQuery';
import { DurableSqliteDrizzleJournal, DurableSqliteDrizzleMigration } from './DurableSqliteDrizzleMigration';

export abstract class DurableObjectSqliteBase<TEnv = unknown> extends DurableObject<TEnv> {
	private _migration?: DurableSqliteDrizzleMigration;

	protected readonly sql = new DurableSqliteQuery(this.ctx.storage);
	protected get migration() {
		return this._migration ?? new DurableSqliteDrizzleMigration(this.migrations, this.sql);
	}

	protected abstract get migrations(): DurableSqliteDrizzleJournal;

	createIfNotExists() {
		this.migration.migrateToLatest();
	}

	create() {
		if (this.exists()) throw new Error('Durable Object is already created previously');
		return this.createIfNotExists();
	}

	exists() {
		return this.migration.hasMigrationTable();
	}
}
