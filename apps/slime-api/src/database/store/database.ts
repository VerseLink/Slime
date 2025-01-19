import { CommunityCouponTable } from "@/database/store/CommunityCouponTable";
import { VerifiedCouponTable } from "./VerifiedCouponTable";
import { z } from "zod";

export function nameof<TShape extends z.ZodObject<z.ZodRawShape>, T extends z.infer<TShape>>(schema: TShape) {
    const keyof = schema.keyof() as z.ZodEnum<[string, ...string[]]>;
    return Object.fromEntries(keyof.options.map(x => [x, x])) as { [k in keyof T]: Readonly<string> };
}

export const StoreDatabaseSchema = z.object({
    CommunityCoupon: z.custom<CommunityCouponTable>(),
    VerifiedCoupon: z.custom<VerifiedCouponTable>()
});

export type StoreDatabase = z.infer<typeof StoreDatabaseSchema>;

export const StoreDatabase = nameof(StoreDatabaseSchema);