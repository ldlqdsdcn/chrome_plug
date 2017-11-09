with (require("filterClasses")) {
    this.Filter = Filter;
    this.RegExpFilter = RegExpFilter;
    this.BlockingFilter = BlockingFilter;
    this.WhitelistFilter = WhitelistFilter;
}
with (require("subscriptionClasses")) {
    this.Subscription = Subscription;
    this.DownloadableSubscription = DownloadableSubscription;
}
var FilterStorage = require("filterStorage").FilterStorage;
var ElemHide = require("elemHide").ElemHide;
var defaultMatcher = require("matcher").defaultMatcher;
var Prefs = require("prefs").Prefs;
var Synchronizer = require("synchronizer").Synchronizer;
var Utils = require("utils").Utils;
var Notification = require("notification").Notification;
var GetTabid = null;
RegExpFilter.typeMap.OBJECT_SUBREQUEST = RegExpFilter.typeMap.OBJECT;
RegExpFilter.typeMap.MEDIA = RegExpFilter.typeMap.FONT = RegExpFilter.typeMap.OTHER;
var isFirstRun = false;
var seenDataCorruption = false;
require("filterNotifier").FilterNotifier.addListener(function (action) {
    if (action == "load") {
        importOldData();
        var addonVersion = require("info").addonVersion;
        var prevVersion = localStorage["currentVersion"];
        if (prevVersion != addonVersion) {
            isFirstRun = !prevVersion;
            localStorage["currentVersion"] = addonVersion;
            addSubscription(prevVersion);
        }
    }
});
var noStyleRulesHosts = ["mail.google.com", "mail.yahoo.com", "www.google.com"];
function removeDeprecatedOptions() {
    var deprecatedOptions = ["specialCaseYouTube", "experimental", "disableInlineTextAds"];
    deprecatedOptions.forEach(function (option) {
        if (option in localStorage)
            delete localStorage[option];
    });
}
function setDefaultOptions() {
    function defaultOptionValue(opt, val) {
        if (!(opt in localStorage))
            localStorage[opt] = val;
    }

    defaultOptionValue("shouldShowIcon", "true");
    defaultOptionValue("shouldShowBlockElementMenu", "true");
    removeDeprecatedOptions();
}
setDefaultOptions();
function isWhitelisted(url, parentUrl, type) {
    var index = url.indexOf("#");
    if (index >= 0)
        url = url.substring(0, index);
    var result = defaultMatcher.matchesAny(url, type || "DOCUMENT", extractHostFromURL(parentUrl || url), false);
    return (result instanceof WhitelistFilter ? result : null);
}
var activeNotification = null;
function refreshIconAndContextMenu(tab) {
    if (!tab)
        return;
    var excluded = isWhitelisted(tab.url);
    var iconFilename = excluded ? "icon/icon64close.png" : "icon/icon64.png";
    if (activeNotification)
        startIconAnimation(tab, iconFilename); else
        chrome.pageAction.setIcon({tabId: tab.id, path: iconFilename});
    chrome.pageAction.setTitle({tabId: tab.id, title: "广告杀手"});
    if ("shouldShowIcon" in localStorage && localStorage["shouldShowIcon"] == "false")
        chrome.pageAction.hide(tab.id); else
        chrome.pageAction.show(tab.id);
    if (excluded)
        chrome.contextMenus.removeAll(); else
        showContextMenu();
}
function importOldData() {
    function addSubscription(url, title) {
        try {
            var subscription = Subscription.fromURL(url);
            if (subscription && !(subscription.url in FilterStorage.knownSubscriptions)) {
                if (title)
                    subscription.title = title;
                FilterStorage.addSubscription(subscription);
                Synchronizer.execute(subscription);
            }
        }
        catch (e) {
            reportError(e);
        }
    }

    if (typeof localStorage["userFilterURLs"] == "string") {
        try {
            var urls = JSON.parse(localStorage["userFilterURLs"]);
            for (var key in urls)
                addSubscription(urls[key]);
            delete localStorage["userFilterURLs"];
        }
        catch (e) {
            reportError(e);
        }
    }
    if (typeof localStorage["filterFilesEnabled"] == "string") {
        try {
            var subscriptions = JSON.parse(localStorage["filterFilesEnabled"]);
            delete localStorage["filterFilesEnabled"];
        }
        catch (e) {
            reportError(e);
        }
    }
    if (typeof localStorage["userFilters"] == "string") {
        try {
            var userFilters = JSON.parse(localStorage["userFilters"]);
            for (var i = 0; i < userFilters.length; i++) {
                var filterText = userFilters[i];
                if (filterText == "qux.us###annoying_AdDiv" || filterText == "qux.us##.ad_class")
                    continue;
                var filter = Filter.fromText(filterText);
                FilterStorage.addFilter(filter);
            }
            delete localStorage["userFilters"];
        }
        catch (e) {
            reportError(e);
        }
    }
    if (typeof localStorage["excludedDomains"] == "string") {
        try {
            var excludedDomains = JSON.parse(localStorage["excludedDomains"]);
            for (var domain in excludedDomains) {
                var filterText = "@@||" + domain + "^$document";
                var filter = Filter.fromText(filterText);
                FilterStorage.addFilter(filter);
            }
            delete localStorage["excludedDomains"];
        }
        catch (e) {
            reportError(e);
        }
    }
    try {
        for (var key in localStorage)
            if (/^https?:/.test(key))
                delete localStorage[key];
    }
    catch (e) {
        reportError(e);
    }
}
function addSubscription(prevVersion) {
    var toRemove = "http://www.17xiuwang.com/chrome_supplement.txt";
    if (toRemove in FilterStorage.knownSubscriptions)
        FilterStorage.removeSubscription(FilterStorage.knownSubscriptions[toRemove]);
    var addAcceptable = !prevVersion;
    if (addAcceptable) {
        addAcceptable = !FilterStorage.subscriptions.some(function (subscription) {
            return subscription.url == Prefs.subscriptions_exceptionsurl;
        });
    }
    var addSubscription = !FilterStorage.subscriptions.some(function (subscription) {
        return subscription instanceof DownloadableSubscription && subscription.url != Prefs.subscriptions_exceptionsurl;
    });
    if (addSubscription && prevVersion) {
        addSubscription = !FilterStorage.subscriptions.some(function (subscription) {
            return subscription.url != Prefs.subscriptions_exceptionsurl && subscription.filters.length;
        });
    }
    if (addAcceptable) {
        var subscription = Subscription.fromURL(Prefs.subscriptions_exceptionsurl);
        if (subscription) {
            subscription.title = "Allow non-intrusive advertising";
            FilterStorage.addSubscription(subscription);
            if (subscription instanceof DownloadableSubscription && !subscription.lastDownload)
                Synchronizer.execute(subscription);
        }
        else
            addAcceptable = false;
    }
    if (!addSubscription && !addAcceptable)
        return;
    function notifyUser() {
        chrome.tabs.create({url: chrome.extension.getURL("options.html")});
    }

    if (addSubscription) {
        var request = new XMLHttpRequest();
        request.open("GET", "subscriptions.xml");
        request.addEventListener("load", function () {
            var node = Utils.chooseFilterSubscription(request.responseXML.getElementsByTagName("subscription"));
            var subscription = (node ? Subscription.fromURL(node.getAttribute("url")) : null);
            if (subscription) {
                FilterStorage.addSubscription(subscription);
                subscription.disabled = false;
                subscription.title = node.getAttribute("title");
                subscription.homepage = node.getAttribute("homepage");
                if (subscription instanceof DownloadableSubscription && !subscription.lastDownload)
                    Synchronizer.execute(subscription);
                notifyUser();
            }
        }, false);
        request.send(null);
    }
    else
        notifyUser();
}
function showContextMenu() {
    chrome.contextMenus.removeAll(function () {
        if (typeof localStorage["shouldShowBlockElementMenu"] == "string" && localStorage["shouldShowBlockElementMenu"] == "true") {
            chrome.contextMenus.create({
                'title': chrome.i18n.getMessage('block_element'),
                'contexts': ['image', 'video', 'audio'],
                'onclick': function (info, tab) {
                    if (info.srcUrl)
                        chrome.tabs.sendRequest(tab.id, {reqtype: "clickhide-new-filter", filter: info.srcUrl});
                }
            });
        }
    });
}
function openOptions(callback) {
    function findOptions(selectTab) {
        var views = chrome.extension.getViews({type: "tab"});
        for (var i = 0; i < views.length; i++)
            if ("startSubscriptionSelection" in views[i])
                return views[i];
        return null;
    }

    function selectOptionsTab() {
        chrome.windows.getAll({populate: true}, function (windows) {
            var url = chrome.extension.getURL("options.html");
            for (var i = 0; i < windows.length; i++)
                for (var j = 0; j < windows[i].tabs.length; j++)
                    if (windows[i].tabs[j].url == url)
                        chrome.tabs.update(windows[i].tabs[j].id, {selected: true});
        });
    }

    var view = findOptions();
    if (view) {
        selectOptionsTab();
        callback(view);
    }
    else {
        var onLoad = function () {
            var view = findOptions();
            if (view)
                callback(view);
        };
        chrome.tabs.create({url: chrome.extension.getURL("options.html")}, function (tab) {
            if (tab.status == "complete")
                onLoad(); else {
                var id = tab.id;
                var listener = function (tabId, changeInfo, tab) {
                    if (tabId == id && changeInfo.status == "complete") {
                        chrome.tabs.onUpdated.removeListener(listener);
                        onLoad();
                    }
                };
                chrome.tabs.onUpdated.addListener(listener);
            }
        });
    }
}
var iconAnimationTimer = null;
var animatedIconTab = null;
function stopIconAnimation() {
    if (!iconAnimationTimer)
        return;
    clearTimeout(iconAnimationTimer);
    iconAnimationTimer = null;
    animatedIconTab = null;
}
function loadImages(imageFiles, callback) {
    var images = {};
    var imagesLoaded = 0;
    imageFiles.forEach(function (imageFile) {
        var image = new Image();
        image.src = imageFile;
        image.addEventListener("load", function () {
            images[imageFile] = image;
            if (++imagesLoaded === imageFiles.length)
                callback(images);
        });
    });
}
function startIconAnimation(tab, iconPath) {
    stopIconAnimation();
    animatedIconTab = tab;
    var severitySuffix = activeNotification.severity === "critical" ? "critical" : "information";
    var notificationIconPath = "icon/notification-" + severitySuffix + ".png";
    var iconFiles = [iconPath, notificationIconPath];
    loadImages(iconFiles, function (images) {
        var icon = images[iconPath];
        var notificationIcon = images[notificationIconPath];
        var canvas = document.createElement("canvas");
        canvas.width = icon.width;
        canvas.height = icon.height;
        var context = canvas.getContext("2d");
        var currentFrame = 0;
        var frameOpacities = [0, 0.2, 0.4, 0.6, 0.8, 1, 1, 1, 1, 1, 0.8, 0.6, 0.4, 0.2, 0];

        function animationStep() {
            var opacity = frameOpacities[currentFrame];
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.globalAlpha = 1;
            context.drawImage(icon, 0, 0);
            context.globalAlpha = opacity;
            context.drawImage(notificationIcon, 0, 0);
            var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            chrome.pageAction.setIcon({tabId: tab.id, imageData: imageData});
            var interval;
            currentFrame++;
            if (currentFrame < frameOpacities.length) {
                var duration = 3000;
                interval = duration / frameOpacities.length;
            }
            else {
                currentFrame = 0;
                interval = 10000;
            }
            iconAnimationTimer = setTimeout(animationStep, interval);
        }

        animationStep();
    });
}
function prepareNotificationIconAndPopup() {
    activeNotification.onClicked = function () {
        var tab = animatedIconTab;
        stopIconAnimation();
        activeNotification = null;
        refreshIconAndContextMenu(tab);
    };
    chrome.windows.getLastFocused({populate: true}, function (window) {
        chrome.tabs.query({active: true, windowId: window.id}, function (tabs) {
            tabs.forEach(refreshIconAndContextMenu);
        });
    });
}
function showNotification(notification) {
    activeNotification = notification;
    if (activeNotification.severity === "critical" && typeof webkitNotifications !== "undefined") {
        var notification = webkitNotifications.createHTMLNotification("notification.html");
        notification.show();
        notification.addEventListener("close", prepareNotificationIconAndPopup);
    }
    else
        prepareNotificationIconAndPopup();
}
function getFrameId(tabId, url) {
    if (tabId in frames) {
        for (var f in frames[tabId]) {
            if (getFrameUrl(tabId, f) == url)
                return f;
        }
    }
    return -1;
}
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    switch (request.reqtype) {
        case"get-settings":
            var hostDomain = null;
            var selectors = null;
            var tabId = -1;
            var frameId = -1;
            if (sender.tab) {
                tabId = sender.tab.id;
                frameId = getFrameId(tabId, request.frameUrl);
            }
            var enabled = !isFrameWhitelisted(tabId, frameId, "DOCUMENT") && !isFrameWhitelisted(tabId, frameId, "ELEMHIDE");
            if (enabled && request.selectors) {
                var noStyleRules = false;
                var host = extractHostFromURL(request.frameUrl);
                hostDomain = getBaseDomain(host);
                for (var i = 0; i < noStyleRulesHosts.length; i++) {
                    var noStyleHost = noStyleRulesHosts[i];
                    if (host == noStyleHost || (host.length > noStyleHost.length && host.substr(host.length - noStyleHost.length - 1) == "." + noStyleHost)) {
                        noStyleRules = true;
                    }
                }
                selectors = ElemHide.getSelectorsForDomain(host, false);
                if (noStyleRules) {
                    selectors = selectors.filter(function (s) {
                        return !/\[style[\^\$]?=/.test(s);
                    });
                }
            }
            sendResponse({enabled: enabled, hostDomain: hostDomain, selectors: selectors});
            break;
        case"should-collapse":
            var tabId = -1;
            var frameId = -1;
            if (sender.tab) {
                tabId = sender.tab.id;
                frameId = getFrameId(tabId, request.documentUrl);
            }
            if (isFrameWhitelisted(tabId, frameId, "DOCUMENT")) {
                sendResponse(false);
                break;
            }
            var requestHost = extractHostFromURL(request.url);
            var documentHost = extractHostFromURL(request.documentUrl);
            var thirdParty = isThirdParty(requestHost, documentHost);
            var filter = defaultMatcher.matchesAny(request.url, request.type, documentHost, thirdParty);
            if (filter instanceof BlockingFilter) {
                var collapse = filter.collapse;
                if (collapse == null)
                    collapse = (localStorage.hidePlaceholders != "false");
                sendResponse(collapse);
            }
            else
                sendResponse(false);
            break;
        case"get-domain-enabled-state":
            if (sender.tab) {
                sendResponse({enabled: !isWhitelisted(sender.tab.url)});
                return;
            }
            break;
        case"add-filters":
            if (request.filters && request.filters.length) {
                for (var i = 0; i < request.filters.length; i++)
                    FilterStorage.addFilter(Filter.fromText(request.filters[i]));
            }
            break;
        case"add-subscription":
            openOptions(function (view) {
                view.startSubscriptionSelection(request.title, request.url);
            });
            break;
        case"forward":
            chrome.tabs.sendRequest(sender.tab.id, request.request, sendResponse);
            break;
        default:
            sendResponse({});
            break;
    }
});
chrome.windows.getAll({populate: true}, function (windows) {
    for (var i = 0; i < windows.length; i++)
        for (var j = 0; j < windows[i].tabs.length; j++)
            refreshIconAndContextMenu(windows[i].tabs[j]);
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    GetTabid = tabId;
    chrome.tabs.sendRequest(tabId, {reqtype: "clickhide-deactivate"})
    if (changeInfo.status == "loading")
        refreshIconAndContextMenu(tab);
});
chrome.tabs.onActivated.addListener(function (activeInfo) {
    refreshIconAndContextMenu(animatedIconTab);
    chrome.tabs.get(activeInfo.tabId, refreshIconAndContextMenu);
});
chrome.windows.onFocusChanged.addListener(function (windowId) {
    refreshIconAndContextMenu(animatedIconTab);
    chrome.tabs.query({active: true, windowId: windowId}, function (tabs) {
        tabs.forEach(refreshIconAndContextMenu);
    });
});
setTimeout(function () {
    var notificationToShow = Notification.getNextToShow();
    if (notificationToShow)
        showNotification(notificationToShow);
}, 3 * 60 * 1000);