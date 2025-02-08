import { IteratorExt } from "./IteratorExt";

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

	export function includes<T>(item: T | T[] | undefined, value: T) {
		if (item == null)
			return false;
		if (item === value)
			return true;
		if (!Array.isArray(item))
			return false;
		return item.some(x => x === value);
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

export type ArrayValue<TArray> = TArray extends Array<infer A> ? A : never;