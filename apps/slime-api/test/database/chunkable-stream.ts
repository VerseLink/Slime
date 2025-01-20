
// slices a string to random chunks of data
export function stringToReadableStreamChunks(input: string, chunkSize: number | (() => number)) {
    let position = 0;

    return new ReadableStream({
        async pull(controller) {
            if (position >= input.length) {
                controller.close();
                return;
            }
            const currentChunkSize = typeof chunkSize === "number" ? chunkSize : chunkSize();
            const chunk = input.slice(position, position + currentChunkSize);
            controller.enqueue(chunk);
            position += currentChunkSize;
        }
    })
}