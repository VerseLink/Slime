
import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeEach, afterAll, vi, beforeAll } from 'vitest';
import sql from "@/init.sql";
import { makeSqlOneLine } from '../util';

describe("Coupon database", () => {

    beforeAll(async () => {
        const oneline = makeSqlOneLine(sql);
        await env.COUPON_DB.exec(oneline);
    })


    it("should report coupon", async () => {
        expect(await env.COUPON_DB.prepare("SELECT 123").run().then(x => x.results[0])).toBe(123);
    });

});