const symbol = Symbol;

if (!("dispose" in symbol)) {
    Object.defineProperty(Symbol, 'dispose', { value: Symbol.for('dispose') });
}

if (!("asyncDispose" in symbol)) {
	Object.defineProperty(Symbol, 'asyncDispose', { value: Symbol.for('asyncDispose') });
}
