
import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterAll, vi, beforeAll } from 'vitest';
import sql from "@/init.sql";
import { makeSqlOneLine } from '../util';
import { SlimeDatabase } from '@/database/types/SlimeDatabase';

describe("Database initialization", () => {

    beforeAll(async () => {
        const oneline = makeSqlOneLine(sql);
        await env.COUPON_DB.exec(oneline);
    })


    it("should include all required table", async () => {
        const tables =  await env.COUPON_DB.prepare("PRAGMA table_list").bind().run<{name: string; ncol: number, schema: string}>();
        const requiredNames: (keyof SlimeDatabase)[] = [
            "VerifiedCoupon",
            "CommunityReportedCoupon",
            "Store"
        ];
        const tableNames = tables.results.map(x => x.name);
        requiredNames.forEach(name => expect(tableNames).toContain(name));
    });

});