import { User } from "#user";
import { ContextVariableMap, Hono } from "hono";

export const hono = <T extends object | undefined = ContextVariableMap>() => new Hono<EnvBindings<T>>();

export type EnvBindings<T extends object | undefined = ContextVariableMap> = {
	Bindings: Env,
	Variables: T,
};

declare module 'hono' {
	interface ContextVariableMap {
		user?: User;
	}
}
