CREATE TABLE IF NOT EXISTS CouponTable (
    Id TEXT PRIMARY KEY,       -- 唯一標識符
    Domain TEXT NOT NULL,      -- 儲存網站域名
    PathRegex TEXT,             -- 儲存爬取折扣碼的正則表達式
    Coupon TEXT NOT NULL,      -- 折扣碼
    CouponContent TEXT,        -- 優惠內容描述
    Conditions TEXT,           -- 優惠使用條件
    DiscoveredAt NUMBER NOT NULL, -- 什麼時候發現的
    ExpireAt NUMBER           -- 什麼時候過期
);

CREATE INDEX IF NOT EXISTS CouponTable_Domain ON CouponTable(Domain)

-- TODO: 之後加一個Table 可以讓人按讚或倒讚
