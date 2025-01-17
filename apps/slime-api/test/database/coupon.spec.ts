
import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterAll, vi, beforeAll } from 'vitest';
import fs from "node:fs";

describe("Coupon database", () => {

    beforeAll(async () => {
        const file = fs.readFileSync("../../src/init.sql").toString('utf-8');
        await env.COUPON_DB.exec(file);
    })

    it("should report coupon", async () => {
        expect(await env.COUPON_DB.prepare("SELECT 123").run().then(x => x.results[0])).toBe(123);
    });
    
    afterAll(() => {
        vi.clearAllMocks()
        vi.resetModules()
    })
});