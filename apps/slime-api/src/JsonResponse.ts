export namespace JsonResponse {
    export function cache(item: unknown, options: { maxAge: number }) {
        return new globalThis.Response(JSON.stringify(item), {
            status: 200,
            headers: {
                'content-type': 'application/json',
                'cache-control': `max-age=${options.maxAge}`
            }
        });
    }
}