import { IteratorExt } from '@slime/util';
import { CompiledQuery } from 'kysely';
import { CompilableQuery, InferResultElement } from './types';
import { DurableSqliteQuery } from './DurableSqliteQuery';

// Heavily inspired by: https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/durable-sqlite/migrator.ts

type JournalEntry = { idx: number; when: number; tag: string; breakpoints: boolean };
type MigrationString =
	`m${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

export interface DurableSqliteDrizzleJournal {
	migrationsTableName?: string;
	journal: {
		entries: JournalEntry[];
	};
	migrations: Partial<Record<MigrationString, string>>;
}

export class DurableSqliteDrizzleMigration {
	private config: DurableSqliteDrizzleJournal;
	private lastVersion: number;
	private currentVersion?: number | null;
	private sql: DurableSqliteQuery;

	private get migrationsTable() {
		return this.config.migrationsTableName ?? '__drizzle_migrations';
	}

	constructor(config: DurableSqliteDrizzleJournal, sql: DurableSqliteQuery) {
		this.sql = sql;
		this.config = config;
		this.lastVersion = Math.max(...config.journal.entries.map((x) => x.idx));
	}

	hasMigrationTable() {
		return (
			this.sql
				.raw(`SELECT 1 FROM sqlite_master WHERE type='table' AND name="${this.migrationsTable}"`)
				.singleOrNull() !== null
		);
	}

	private readMigrationFiles() {
		const migrationQueries = [];

		for (const journalEntry of this.config.journal.entries) {
			const query = this.config.migrations[`m${journalEntry.idx.toString().padStart(4, '0')}` as MigrationString];

			if (!query) {
				throw new Error(`Missing migration: ${journalEntry.tag}`);
			}

			try {
				const result = query.split('--> statement-breakpoint').map((it) => {
					return it;
				});

				migrationQueries.push({
					sql: result,
					bps: journalEntry.breakpoints,
					folderMillis: journalEntry.when,
					version: journalEntry.idx,
				});
			} catch {
				throw new Error(`Failed to parse migration: ${journalEntry.tag}`);
			}
		}

		return migrationQueries;
	}

	migrateToLatest() {
		if (this.currentVersion != null && this.currentVersion >= this.lastVersion) {
			return;
		}

		const migrations = this.readMigrationFiles();
		const migrationsTable = this.migrationsTable;

		this.sql.transactionSync(() => {
			this.sql.raw(`CREATE TABLE IF NOT EXISTS "${migrationsTable}"(version INTEGER PRIMARY KEY, created_at INTEGER)`);

			const lastMigration = this.sql
				.raw<{
					version: number;
					created_at: number;
				}>(`SELECT version, created_at FROM "${migrationsTable}" ORDER BY version DESC LIMIT 1`)
				.firstOrDefault();

			this.currentVersion = lastMigration?.version ?? null;
			if (this.currentVersion != null && this.currentVersion >= this.lastVersion) {
				return;
			}

			for (const migration of migrations) {
				if (!lastMigration || lastMigration.created_at < migration.folderMillis) {
					for (let stmt of migration.sql) {
						this.sql.raw(stmt);
					}
					this.sql.raw(
						`INSERT INTO ${migrationsTable} ("version", "created_at") VALUES('${migration.version}', ${migration.folderMillis})`,
					);
				}
			}
		});
	}
}
