export class PromiseSource<T> implements PromiseLike<T> {
    readonly promise: Promise<T>;
    
    #resolve?: (value: T) => void;
    #reject?: (value: unknown) => void;

    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): PromiseLike<TResult1 | TResult2> {
        return this.promise.then(onfulfilled, onrejected);
    }

    resolve(value: T) {
        this.#resolve?.(value);
    }

    reject(value: unknown) {
        this.#reject?.(value);
    }
}

export class PromiseObserver<T> {
    readonly promise: PromiseLike<T>;
    
    #isCompletedSuccessfully: boolean;
    #isRejected: boolean;
    #result?: T;

    constructor(promise: PromiseLike<T>) {
        this.promise = promise;
        this.#isCompletedSuccessfully = false;
        this.#isRejected = false;
        this.#result = undefined;
        promise.then((result) => {
            this.#isCompletedSuccessfully = true;
            this.#result = result;
        }, (reason) => {
            this.#isRejected = true;
            this.#result = reason;
        })
    }

    get isCompletedSuccessfully() {
        return this.#isCompletedSuccessfully;
    }

    get isCompleted() {
        return this.#isRejected || this.#isCompletedSuccessfully;
    }
    
    get isRejected() {
        return this.#isRejected;
    }

    get result() {
        return this.#result;
    }
}