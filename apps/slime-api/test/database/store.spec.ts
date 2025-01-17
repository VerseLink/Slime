
import { env, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeEach } from 'vitest';
import init from "@/init.sql";

describe("Store database", () => {
    beforeEach(() => {
        env.COUPON_DB.exec(init);
    });

    it("should create store", () => {

    });
});