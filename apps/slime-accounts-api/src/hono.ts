import { Hono } from 'hono';

export const hono = () => new Hono<HonoInterface>();

export type HonoInterface = {
	Bindings: Env;
	Variables: {};
};
