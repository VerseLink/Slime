/**
 * This route records user activity that allows people to report new code / remove invalidate code or flag it as inapporiate
 * 使用者回報新的優惠碼，或者是回報失效的優惠碼，或是檢舉優惠碼的用字有問題
 * 
 */

import { AutoRouter, IRequest, StatusError } from "itty-router";
import { withTurnstile } from "./middleware/withTurnstile";

export const router = AutoRouter<IRequest, [Env, ExecutionContext]>({ base: "/api/v1" });

// 使用者上傳新的使用碼
router.put("/code/submit", withTurnstile, (request, env) => {
    
});

// 使用者回報使用碼用字用冒犯的問題
router.put("/code/flag", (request, env) => {

});
