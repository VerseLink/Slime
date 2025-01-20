-- sqlite
-- Migration number: 0001 	 2025-01-19T16:37:18.629Z

CREATE TABLE IF NOT EXISTS StoreMetadata (
    entryId INTEGER PRIMARY KEY AUTOINCREMENT,

    storeId TEXT,
    
    -- 網站Url使用的片段，譬如 shop.google.com/nexus/phone-model-123 而這個商店只存在在 shop.google.com/nexus 下的話，那只有 shop.google.com/nexus 才會被這邊儲存
    -- 以正則表達式儲存 (Regex)
    urlRegex TEXT NOT NULL,
    
    -- 儲存網站域名 (例如如果是 shop.google.com/product/1234，那 google.com 會被儲存)
    domain TEXT NOT NULL
);
