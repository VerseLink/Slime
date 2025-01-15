import { supportedSites } from "@/utils/placeholder";
import { ExtensionIcon } from "./ExtensionIcon";

export default defineBackground(() => {
    chrome.tabs.onCreated.addListener((tab) => setIconStatusByTab(tab));
    chrome.tabs.onUpdated.addListener((_, __, tab) => setIconStatusByTab(tab));

    chrome.tabs.onActivated.addListener((activeInfo) => {
        chrome.tabs.get(activeInfo.tabId, tab => setIconStatusByTab(tab));
    });
});

async function isSiteSupported(tabUrl: string) {
    const url = new URL(tabUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:")
        return false;
    
    // import.meta.env.MODE === "development"
    const baseUrl = import.meta.env.VITE_ENDPOINT;
    const apiUrl = new URL(`/api/v1/code?domain=${encodeURIComponent(url.hostname)}`, baseUrl);
    try {
        const response = await fetch(apiUrl);
        if (!response.ok)
            return false;
        const data = await response.json();
        console.info(data, response.headers.get('cache-control'));
        return data.length !== 0;
    }
    catch (error: unknown) {
        console.log(error, apiUrl);
        throw error;
    }
}

async function setIconStatusByTab(tab: chrome.tabs.Tab) {
    if (tab.url == null || tab.url === "")
        return;
    if (!await isSiteSupported(tab.url)) {
        ExtensionIcon.setInactive({ text: "X" });
        return;
    }
    ExtensionIcon.setActive({ text: "1" });
}
