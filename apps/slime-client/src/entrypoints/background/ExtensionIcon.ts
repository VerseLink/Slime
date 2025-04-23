export class ExtensionIcon {
    static setActive(options?: { text?: string, backgroundColor?: string, color?: string }) {
        browser.action.setIcon({
            path: {
                "16": "icons/16.png",
                "32": "icons/32.png",
                "48": "icons/48.png",
                "128": "icons/128.png",
            }
        });
        if (options?.text)
            browser.action.setBadgeText({ text: options.text });
        browser.action.setBadgeBackgroundColor({ color: options?.backgroundColor ?? "#DC143C" });
        browser.action.setBadgeTextColor({ color: options?.color ?? "white" });
    }

    static setInactive(options?: { text?: string, backgroundColor?: string, color?: string }) {
        browser.action.setIcon({
            path: {
                "16": "icons/16.disabled.png",
                "32": "icons/32.disabled.png",
                "48": "icons/48.disabled.png",
                "128": "icons/128.disabled.png",
            }
        });
        if (options?.text)
            browser.action.setBadgeText({ text: options.text });
        browser.action.setBadgeBackgroundColor({ color: options?.backgroundColor ?? "#444444" });
        browser.action.setBadgeTextColor({ color: options?.color ?? "#DCDCDC" });
    }
}