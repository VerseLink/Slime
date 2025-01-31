import { z } from "zod";

export const errorMessage = z.object({
    error: z.object({
        code: z.number(),
        text: z.string(),
        message: z.string().optional()
    }).optional()
});