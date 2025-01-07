const targetSites = ["https://example.com", "https://game.maj-soul.com/1/"];

// 獲取當前網址,如果目標網站匹配則更換對應圖片
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    const isTargetSite = targetSites.some(site => tab.url?.includes(site));

    // 根据匹配结果更换图标
    chrome.action.setIcon({
        path: isTargetSite
            ? {
                "256": "icon.png"
            }
            : {
                "256": "iconGray.png"
            }
    });
    
});

// 檢查是否切換分頁,如果分頁網站匹配則更換對應圖片
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {

        if(tab.url){
            const isTargetSite = targetSites.some(site => tab.url?.includes(site));

            chrome.action.setIcon({
                path: isTargetSite
                    ? {
                        "256": "icon.png"
                    }
                    : {
                        "256": "iconGray.png"
                    }
            });
        }
    });
});