/**
 * This route records user activity that allows people to use or like / dislike a code
 */

import { AutoRouter, IRequest, StatusError } from "itty-router";
import { withRole } from "./middleware";

export const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: "/api/v1" });

// 使用者已使用這個兌換碼
router.put("/activity/code/applied", withRole(["anonymous"]), (request, env) => {

});

// 使用者對這個兌換碼按讚或倒讚
router.put("/activity/code/rate", (request, env) => {

});