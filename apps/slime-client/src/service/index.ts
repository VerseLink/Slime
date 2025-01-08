import { supportedSites } from "@/placeholder";

function setIconStatusByTab(tab: chrome.tabs.Tab) {
    if (tab.url == null)
        return;
    const url = new URL(tab.url);
    if (supportedSites.has(url.hostname)) {
        chrome.action.setIcon({
            path: {
                "32": "icon-32.png"
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
            "32": "icon-disabled-32.png"
        }
    });
    chrome.action.setBadgeText({ text: "X" });
    chrome.action.setBadgeBackgroundColor({ color: "#444444" });
    chrome.action.setBadgeTextColor({ color: "#DCDCDC" });
}

chrome.tabs.onUpdated.addListener((_, __, tab) => setIconStatusByTab(tab));

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, tab => setIconStatusByTab(tab));
})