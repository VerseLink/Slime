import { Compilable, CompiledQuery, InferResult } from 'kysely';

export type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type InferResultElement<T extends Compilable<any> | CompiledQuery<any>> = ArrayElement<
	InferResult<T>
>;

export type CompilableQuery<T> = { compile: () => CompiledQuery<T> };
