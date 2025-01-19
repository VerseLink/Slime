
CREATE TABLE IF NOT EXISTS CommunityCoupon (
    
    -- 唯一標識符，就算是同個優惠碼也有可能會共享多個ID
    couponId TEXT PRIMARY KEY,

    -- 類別：coupon 或 redeem
    type TEXT NOT NULL CHECK(type IN ('coupon', 'redeem')),

    -- 使用者 ID
    -- userId TEXT,

    -- 匿名 ID
    sessionId TEXT,

    -- 最初回報的網址 (例如如果是 shop.google.com/product?id=1234#h1，那 /product?id=1234 會被儲存，相當於 url.pathname + url.search)
    urlPath TEXT NOT NULL,

    -- 儲存網站域名 (例如如果是 shop.google.com/product/1234，那 shop.google.com 會被儲存)
    hostname TEXT NOT NULL,
    
    -- 折扣碼
    code TEXT NOT NULL,

    -- 參考 @slime/api-v1/CouponCodeMetadata，只有Coupon 才有
    -- Metadata 一定是用 JSON 格式儲存
    metadata TEXT,

    -- 優惠內容描述，可以是字串，但如果是 RedeemCodeInfo 也能是 { item: string, imageUrl?: string, count: string }[]
    -- Description 一定是用 JSON 格式儲存
    description TEXT,

    -- 優惠使用條件
    conditions TEXT,

    -- 什麼時候發現的
    reportedAt NUMBER NOT NULL,
    
    -- 什麼時候過期
    expireAt NUMBER,

    FOREIGN KEY (StoreId) REFERENCES StoreTable(StoreId) ON UPDATE CASCADE ON DELETE SET NULL
);
