
CREATE TABLE IF NOT EXISTS StoreTable (
    storeId TEXT PRIMARY KEY,
    
    -- 網站Url使用的片段，譬如 shop.google.com/nexus/phone-model-123 而這個商店只存在在 shop.google.com/nexus 下的話，那只有 shop.google.com/nexus 才會被這邊儲存
    baseUrlPart TEXT NOT NULL;
    
    -- 儲存網站域名 (例如如果是 shop.google.com/product/1234，那 google.com 會被儲存)
    domain TEXT NOT NULL;
);

CREATE TABLE IF NOT EXISTS CommunityReportedCoupon (
    
    -- 唯一標識符，就算是同個優惠碼也有可能會共享多個ID
    id TEXT PRIMARY KEY,

    -- 類別：coupon 或 redeem
    type TEXT NOT NULL CHECK(type IN ('coupon', 'redeem')),

    -- 如果我們知道店家的ID 的話就放在這裡
    storeId TEXT,

    -- 最初回報的網址 (例如如果是 shop.google.com/product?id=1234#h1，那 /product?id=1234 會被儲存，相當於 url.pathname + url.search)
    urlPath TEXT NOT NULL,

    -- 儲存網站域名 (例如如果是 shop.google.com/product/1234，那 shop.google.com 會被儲存)
    hostname TEXT NOT NULL,
    
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

    FOREIGN KEY (StoreId) REFERENCES StoreTable(StoreId) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 過期的點數我們不會去使用
CREATE INDEX IF NOT EXISTS CommunityReportedCoupon_discoveredAt ON CommunityReportedCoupon(expireAt);

-- 面對不認識的網站，我們經常需要WHERE Domain = ?1
CREATE INDEX IF NOT EXISTS CommunityReportedCoupon_domain ON CommunityReportedCoupon(domain);

-- 面對認識的網站，我們經常需要WHERE StoreId = ?1
CREATE INDEX IF NOT EXISTS CommunityReportedCoupon_storeId ON CommunityReportedCoupon(storeId);

-- 只有認識的網站才能有官方認證的 Coupon
CREATE TABLE IF NOT EXISTS VerifiedCoupon (
    -- 唯一標識符，就算是同個優惠碼也有可能會共享多個ID
    couponId TEXT PRIMARY KEY, 

    -- 因為是官方認證的Coupon 所以一定有店 ID
    storeId TEXT NOT NULL,

    -- 只有符合這個 Regex 的網址才能用這個券
    --  urlRegex TEXT,

    -- 折扣碼
    code TEXT NOT NULL,

    -- 參考 @slime/api-v1/CouponCodeMetadata，只有Coupon 才有
    metadata TEXT,

    -- 優惠使用條件
    conditions TEXT,

    -- 什麼時候發現的
    reportedAt NUMBER NOT NULL,
    
    -- 什麼時候過期
    expireAt NUMBER,
)

