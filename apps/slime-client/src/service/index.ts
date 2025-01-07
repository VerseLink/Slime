// background.js
const targetSites = ["https://example.com", "https://game.maj-soul.com/1/"];
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {

      // 獲取當前時間和網址
      const record = {
        url: changeInfo.url,
        timestamp: new Date().toLocaleString()
      };

      if(targetSites.some(site => record.url.includes(site))){
        console.log("BUGubird");
      }
  
      // 從存儲中獲取現有的記錄
      chrome.storage.local.get(["urlLog"], (result) => {
        const urlLog = result.urlLog || [];
        urlLog.push(record);
  
        // 儲存更新的記錄
        chrome.storage.local.set({ urlLog });
      });
    }
  });
