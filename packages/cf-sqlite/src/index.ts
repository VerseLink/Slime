import { DummyDriver, Kysely, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler } from 'kysely';

export * from './D1Query';
export * from './DurableSqliteQuery';
export * from './DurableObjectSqliteBase';
export * from './DurableObjectSqlExport';

class NamedSqliteQueryCompiler extends SqliteQueryCompiler {
	getCurrentParameterPlaceholder() {
		return '?' + this.numParameters;
	}
}

export function fromSqlite<T>() {
	return new Kysely<T>({
		dialect: {
			createAdapter: () => new SqliteAdapter(),
			createDriver: () => new DummyDriver(),
			createIntrospector: (db) => new SqliteIntrospector(db),
			createQueryCompiler: () => new NamedSqliteQueryCompiler(),
		},
	});
}
