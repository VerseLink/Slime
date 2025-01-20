-- 只有認識的網站才能有官方認證的 Coupon

CREATE TABLE IF NOT EXISTS VerifiedCoupon (
    
    -- 唯一標識符，就算是同個優惠碼也有可能會共享多個ID
    couponId TEXT PRIMARY KEY, 

    -- 類別：coupon 或 redeem
    type TEXT NOT NULL CHECK(type IN ('coupon', 'redeem')),

    -- 因為是官方認證的Coupon 所以一定有店 ID
    storeId TEXT NOT NULL,

    -- 只有符合這個 Regex 的網址才能用這個券
    --  urlRegex TEXT,

    -- 折扣碼
    code TEXT NOT NULL,

    -- 參考 @slime/api-v1/CouponCodeMetadata，只有Coupon 才有
    metadata TEXT,

    -- 優惠內容描述，可以是字串，但如果是 RedeemCodeInfo 也能是 { item: string, imageUrl?: string, count: string }[]
    description TEXT,

    -- 優惠使用條件
    conditions TEXT,

    -- 什麼時候發現的
    reportedAt NUMBER NOT NULL,
    
    -- 什麼時候過期
    expireAt NUMBER,

    FOREIGN KEY (StoreId) REFERENCES StoreTable(StoreId) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 過期的點數我們不會去使用
CREATE INDEX IF NOT EXISTS VerifiedCoupon_discoveredAt ON VerifiedCoupon(expireAt);

-- 面對認識的網站，我們經常需要WHERE StoreId = ?1
CREATE INDEX IF NOT EXISTS VerifiedCoupon_storeId ON VerifiedCoupon(storeId);