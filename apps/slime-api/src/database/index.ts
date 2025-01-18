import { DummyDriver, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from "kysely";

class NamedSqliteQueryCompiler extends SqliteQueryCompiler {
    getCurrentParameterPlaceholder() {
        return '?' + this.numParameters;
    }
}

export function fromDb<T>() {
    return new Kysely<T>({
        dialect: {
            createAdapter: () => new SqliteAdapter(),
            createDriver: () => new DummyDriver(),
            createIntrospector: (db) => new SqliteIntrospector(db),
            createQueryCompiler: () => new NamedSqliteQueryCompiler()
        }
    });
}

