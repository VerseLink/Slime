export class WindowUtil {
    static get InPopup() {
        return window.opener && window.opener !== window;
    }

    static get InIframe() {
        return window.self !== window.top;
    }

    static get currentOrigin() {
        return window.location.protocol + "//" + window.location.host;
    }
}