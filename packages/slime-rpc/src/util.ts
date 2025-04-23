export function isPrimitiveOrBoxedPrimitive(
	value: unknown,
): value is string | number | bigint | boolean | null | undefined | Boolean | Number | String {
	return typeof value !== "object" || value == null || value instanceof String || value instanceof Number || value instanceof Boolean;
}
