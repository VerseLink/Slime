import "./polyfill/dispose";

export class DisposableCollection extends Array<Disposable> implements Disposable {
    [Symbol.dispose]() {
        for(let item of this) {
            item[Symbol.dispose]();
        }
    }
}