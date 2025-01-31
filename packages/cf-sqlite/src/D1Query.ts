import { Compilable, CompiledQuery, InferResult } from 'kysely';
import { CompilableQuery, InferResultElement, ArrayElement } from './types';

export class D1Query {
	private d1: D1Database;

	constructor(d1: D1Database) {
		this.d1 = d1;
	}

	async execute<T>(
		query: CompilableQuery<T> | CompiledQuery<T>,
	): Promise<D1Result<InferResultElement<CompiledQuery<T>>>> {
		const compiled = 'compile' in query ? query.compile() : query;
		try {
			const result = await this.d1
				.prepare(compiled.sql)
				.bind(...compiled.parameters)
				.run<InferResultElement<CompiledQuery<T>>>();
			if (!result.success) throw new Error('Database query error');
			return result;
		} catch (e) {
			console.error(e, compiled);
			throw e;
		}
	}

	async batch<T extends (CompilableQuery<any> | CompiledQuery<any>)[]>(queries: T) {
		const compiledQueries = queries.map((query) => {
			const compiled = 'compile' in query ? query.compile() : query;
			return this.d1.prepare(compiled.sql).bind(...compiled.parameters);
		});

		const results = await this.d1.batch<InferResultElement<ArrayElement<T>>>(compiledQueries);

		const failedQuery = results.filter((x) => !x.success).map((x) => x.meta);
		if (failedQuery.length > 0) {
			throw new Error('Database query error', { cause: failedQuery });
		}

		return results;
	}
}
