/**
 * This route records user activity that allows people to report new code / remove invalidate code or flag it as inapporiate
 */

import { AutoRouter, IRequest, StatusError } from "itty-router";

export const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: "/api/v1" });
