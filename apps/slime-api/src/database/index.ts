import { Compilable, CompiledQuery, DummyDriver, InferResult, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";
import { SlimeDatabase } from "./types/SlimeDatabase";

class NamedSqliteQueryCompiler extends SqliteQueryCompiler {
    getCurrentParameterPlaceholder() {
        return '?' + this.numParameters;
    }
}

export const sqlt = new Kysely<SlimeDatabase>({
    dialect: {
        createAdapter: () => new SqliteAdapter(),
        createDriver: () => new DummyDriver(),
        createIntrospector: (db) => new SqliteIntrospector(db),
        createQueryCompiler: () => new NamedSqliteQueryCompiler()
    }
});

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