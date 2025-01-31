import { IteratorExt } from '@slime/util';
import { CompiledQuery } from 'kysely';
import { CompilableQuery, InferResultElement } from './types';

export class DurableSqliteQuery {
	private storage: DurableObjectStorage;

	constructor(storage: DurableObjectStorage) {
		this.storage = storage;
	}

	get tables() {
		return this.raw<{ name: string }>(
			"SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%';",
		).map((x) => x.name);
	}

	get transaction() {
		return this.storage.transaction.bind(this.storage);
	}

	get transactionSync() {
		return this.storage.transactionSync.bind(this.storage);
	}

	execute<T extends Record<string, SqlStorageValue>>(query: CompilableQuery<T> | CompiledQuery<T>) {
		const compiled = 'compile' in query ? query.compile() : query;
		const cursor = this.storage.sql.exec<InferResultElement<CompiledQuery<T>>>(
			compiled.sql,
			...compiled.parameters,
		);
		return new SqlStorageCursorExt(cursor);
	}

	raw<T extends Record<string, SqlStorageValue>>(raw: string, ...bindings: any[]) {
		const cursor = this.storage.sql.exec<T>(raw, ...bindings);
		return new SqlStorageCursorExt(cursor);
	}

}

class SqlStorageCursorExt<T extends Record<string, SqlStorageValue>> extends IteratorExt<
	T,
	never | undefined,
	T
> {
	readonly cursor: SqlStorageCursor<T>;

	get columnNames(): readonly string[] {
		return this.cursor.columnNames;
	}
	get rowsRead() {
		return this.cursor.rowsRead;
	}
	get rowsWritten() {
		return this.cursor.rowsWritten;
	}

	constructor(cursor: SqlStorageCursor<T>) {
		super();
		this.cursor = cursor;
	}

	next(): IteratorResult<T, never | undefined> {
		return this.cursor.next() as { done: true; value: never } | { done?: false; value: T };
	}

	override toArray(): T[] {
		return this.cursor.toArray();
	}

	override single() {
		return this.cursor.one();
	}

	[Symbol.iterator]() {
		return this;
	}
}
