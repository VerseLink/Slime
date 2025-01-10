import { supportedSites } from "@/utils/placeholder";

export default defineBackground(() => {
    chrome.tabs.onUpdated.addListener((_, __, tab) => setIconStatusByTab(tab));
    
    chrome.tabs.onActivated.addListener((activeInfo) => {
        chrome.tabs.get(activeInfo.tabId, tab => setIconStatusByTab(tab));
    })
});

function setIconStatusByTab(tab: chrome.tabs.Tab) {
    if (tab.url == null)
        return;
    const url = new URL(tab.url);
    if (supportedSites.has(url.hostname)) {
        chrome.action.setIcon({
            path: {
                "16": "icons/16.png",
                "32": "icons/32.png",
                "48": "icons/48.png",
                "128": "icons/128.png",
            }
        });
        // TODO: Add badge content
        chrome.action.setBadgeText({ text: "1" });
        chrome.action.setBadgeBackgroundColor({ color: "#DC143C" });
        chrome.action.setBadgeTextColor({ color: "white" });
        return;
    }
    chrome.action.setIcon({
        path: {
            "16": "icons/16.disabled.png",
            "32": "icons/32.disabled.png",
            "48": "icons/48.disabled.png",
            "128": "icons/128.disabled.png",
        }
    });
    chrome.action.setBadgeText({ text: "X" });
    chrome.action.setBadgeBackgroundColor({ color: "#444444" });
    chrome.action.setBadgeTextColor({ color: "#DCDCDC" });
}
