/**
 * This route records user activity that allows people to use or like / dislike a code
 */
import { withPermission } from "./middleware/withPermission";
import { communityCouponPermission } from "@/auth/permissions";

import { hono } from "@/api/hono";

export const router = hono();

// 使用者已使用這個兌換碼
router.put("/activity/code/applied", async (context) => {

});

// 使用者對這個兌換碼按讚或倒讚
router.put("/activity/code/rate", async (context) => {

});