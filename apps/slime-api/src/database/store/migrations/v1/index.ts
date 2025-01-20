import { SqlSchemaMigration } from "@/database/util/DurableObjectSqlMigration";
import community_coupon from "./community-coupon.sql";
import verified_coupon from "./verified-coupon.sql";

export default {
    version: 1,
    description: "initialization",
    sql: [
        community_coupon,
        verified_coupon
    ]
} satisfies SqlSchemaMigration;