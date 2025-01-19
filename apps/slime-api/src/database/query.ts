import { Compilable, CompiledQuery, InferResult } from "kysely";

type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

type InferResultElement<T extends Compilable<any> | CompiledQuery<any>> = ArrayElement<InferResult<T>>;
type CompilableQuery<T> = { compile: () => CompiledQuery<T> };

export class D1Query {
    private d1: D1Database;

    constructor(d1: D1Database) {
        this.d1 = d1;
    }

    async execute<T>(query: CompilableQuery<T> | CompiledQuery<T>): Promise<D1Result<InferResultElement<CompiledQuery<T>>>> {
        const compiled = "compile" in query ? query.compile() : query;
        const result = await this.d1.prepare(compiled.sql).bind(compiled.parameters).run<InferResultElement<CompiledQuery<T>>>();
        if (!result.success)
            throw new Error("Database query error");
        return result;
    }

    async batch<T extends (CompilableQuery<any> | CompiledQuery<any>)[]>(queries: T) {

        const compiledQueries = queries.map(query => {
            const compiled = "compile" in query ? query.compile() : query;
            return this.d1.prepare(compiled.sql).bind(compiled.parameters);
        });

        const results = await this.d1.batch<InferResultElement<ArrayElement<T>>>(compiledQueries);

        const failedQuery = results.filter(x => !x.success).map(x => x.meta);
        if (failedQuery.length > 0) {
            throw new Error("Database query error", { cause: failedQuery });
        }

        return results;
    }
}

export class DurableObjectSqliteQuery {
    private storage: DurableObjectStorage;

    constructor(storage: DurableObjectStorage) {
        this.storage = storage;
    }

    execute<T extends Record<string, SqlStorageValue>>(query: CompilableQuery<T> | CompiledQuery<T>) {
        const compiled = "compile" in query ? query.compile() : query;
        const cursor = this.storage.sql.exec<InferResultElement<CompiledQuery<T>>>(compiled.sql, compiled.parameters);
        return new SqlStorageCursorExt(cursor);
    }

    raw<T extends Record<string, SqlStorageValue>>(raw: string) {
        const cursor = this.storage.sql.exec<T>(raw);
        return new SqlStorageCursorExt(cursor);
    }
}

class SqlStorageCursorExt<T extends Record<string, SqlStorageValue>> extends Iterator<T, never | undefined, T> {

    readonly cursor: SqlStorageCursor<T>;

    get columnNames(): readonly string[] { return this.cursor.columnNames };
    get rowsRead() { return this.cursor.rowsRead; }
    get rowsWritten() { return this.cursor.rowsWritten; }

    constructor(cursor: SqlStorageCursor<T>) {
        super();
        this.cursor = cursor;
    }

    next(): IteratorResult<T, never | undefined> {
        return (this.cursor.next() as { done: true; value: never; } | { done?: false; value: T; });
    }

    override toArray(): T[] {
        return this.cursor.toArray();
    }

    single() {
        return this.cursor.one();
    }

    singleOrNull() {
        const next = this.cursor.next();
        if (next.done)
            return null;
        return next.value;
    }
}