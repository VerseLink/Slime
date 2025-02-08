import { Hook, zValidator } from '@hono/zod-validator';
import { ZodObject } from 'zod';
import type { ZodError, ZodSchema, z } from 'zod';
import type { Context, Env, Input, MiddlewareHandler, TypedResponse, ValidationTargets } from 'hono';
import { EnvBindings } from '../hono';

export const validator = <
	T extends ZodSchema,
	Target extends keyof ValidationTargets,
>(
	target: Target,
	schema: T,
    onError?: (error: ZodError) => unknown
) => zValidator(target, schema, (value, c: Context<EnvBindings>) => {
    if (!value.success) {
        if (c.env.ENVIRONMENT === "dev")
            console.error(value);
        return c.json(onError?.(value.error) ?? { success: false, error: 'Missing required arguments' }, 400);
    }
    return value.data;
});
