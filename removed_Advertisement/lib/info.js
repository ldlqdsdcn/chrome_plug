require.scopes.info = {
    get addonIDfunction() {
        return chrome.i18n.getMessage("@@extension_id")
    },
    addonName: "广告净化器",
    addonVersion: "1.0.0",
    addonRoot: "",
    application: "chrome",
    get applicationVersionfunction() {
        return this.platformVersion
    },
    platform: "chromium",
    get platformVersionfunction() {
        var match = /\bChrome\/(\S+)/.exec(navigator.userAgent);
        return (match ? match[1] : "0")
    }
};