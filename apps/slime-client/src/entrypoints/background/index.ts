import { supportedSites } from '@/utils/placeholder';
import { ExtensionIcon } from './ExtensionIcon';
import { client } from '@/lib/client';

export default defineBackground(() => {
	browser.tabs.onCreated.addListener((tab) => setIconStatusByTab(tab));
	browser.tabs.onUpdated.addListener((_, __, tab) => setIconStatusByTab(tab));
	browser.tabs.onActivated.addListener((activeInfo) => {
		browser.tabs.get(activeInfo.tabId, (tab) => setIconStatusByTab(tab));
	});
	browser.windows.onFocusChanged.addListener(windowId => {
		// no focused window
		if (windowId === browser.windows.WINDOW_ID_NONE) {
			return;
		}
		browser.tabs.query({ active: true, currentWindow: true }, tabs => {
			if (tabs.length <= 0)
				return;
			setIconStatusByTab(tabs[0]);
		});
	})
});

async function isSiteSupported(tabUrl: string) {
	const url = new URL(tabUrl);
	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        return false;
    }
	const res = await client.stores.$get({ query: { domain: url.hostname } });
    return res.ok && (await res.json()).length !== 0;
}

async function setIconStatusByTab(tab: chrome.tabs.Tab) {
	if (tab.url == null || tab.url === '') {
		return;
	}
	if (await isSiteSupported(tab.url)) {
		ExtensionIcon.setActive({ text: '1' });
		return;
	}
	ExtensionIcon.setInactive({ text: 'X' });
}
