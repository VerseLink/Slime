import { ApiQueryResponse } from '@slime/api-v1/response';

export abstract class IteratorExt<T, TReturn = any, TNext = any> extends Iterator<T, TReturn, TNext> {
	single() {
		let single = this.singleOrNull();
		if (single == null) throw new Error('Expected exactly one value, but got none');
		return single;
	}

	singleOrNull() {
		let result = this.next();
		if (result.done) return null;
		const value = result.value;
		result = this.next();
		if (result.done) return value;
		throw new Error('Expected exactly one value, but got more the one value');
	}

	[Symbol.iterator]() {
		return this;
	}
}

export namespace ArrayUtil {
	/**
	 * Returns the last element of the array, or the string or undefined if the array is empty
	 */
	export function lastOrSingle(str: string | string[] | undefined) {
		if (typeof str === 'string') return str;
		if (str === undefined) return undefined;
		return str[str.length - 1];
	}

	export function singleOrDefault<T>(array: T[] | undefined | null, defaultValue: T) {
		if (array == null) return defaultValue;
		return array.length === 0 ? defaultValue : array[0];
	}

	class Range extends IteratorExt<number, undefined, number> {
		current: number;
		end: number;

		constructor(start: number, end: number) {
			super();
			this.current = start;
			this.end = end;
		}

		next(): IteratorResult<number, undefined> {
			if (this.current > this.end) {
				return { done: true, value: undefined };
			}
			const ret: { done: false; value: number } = { done: false, value: this.current };
			this.current++;
			return ret;
		}
	}

	export function range(start: number, end: number) {
		return new Range(start, end);
	}
}

export namespace ApiResponse {
	export function success<T>(data: T): ApiQueryResponse<T> {
		return {
			success: true,
			result: data,
		};
	}
}
