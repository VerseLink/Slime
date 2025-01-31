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

    firstOrDefault() {
		let result = this.next();
		if (result.done) return null;
		return result.value;
    }

	[Symbol.iterator]() {
		return this;
	}
}