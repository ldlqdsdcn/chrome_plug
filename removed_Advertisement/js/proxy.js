(function(){function e(e,t,r){var n=t&&r||0,o=0;for(t=t||[],e.toLowerCase().replace(/[0-9a-f]{2}/g,function(e){16>o&&(t[n+o++]=f[e])});16>o;)t[n+o++]=0;return t}function t(e,t){var r=t||0,n=l;return n[e[r++]]+n[e[r++]]+n[e[r++]]+n[e[r++]]+"-"+n[e[r++]]+n[e[r++]]+"-"+n[e[r++]]+n[e[r++]]+"-"+n[e[r++]]+n[e[r++]]+"-"+n[e[r++]]+n[e[r++]]+n[e[r++]]+n[e[r++]]+n[e[r++]]+n[e[r++]]}function r(e,r,n){var o=r&&n||0,i=r||[];e=e||{};var u=null!=e.clockseq?e.clockseq:v,a=null!=e.msecs?e.msecs:(new Date).getTime(),c=null!=e.nsecs?e.nsecs:w+1,s=a-g+(c-w)/1e4;if(0>s&&null==e.clockseq&&(u=16383&u+1),(0>s||a>g)&&null==e.nsecs&&(c=0),c>=1e4)throw Error("uuid.v1(): Can't create more than 10M uuids/sec");g=a,w=c,v=u,a+=122192928e5;var d=(1e4*(268435455&a)+c)%4294967296;i[o++]=255&d>>>24,i[o++]=255&d>>>16,i[o++]=255&d>>>8,i[o++]=255&d;var l=268435455&1e4*(a/4294967296);i[o++]=255&l>>>8,i[o++]=255&l,i[o++]=16|15&l>>>24,i[o++]=255&l>>>16,i[o++]=128|u>>>8,i[o++]=255&u;for(var f=e.node||h,m=0;6>m;m++)i[o+m]=f[m];return r?r:t(i)}function n(e,r,n){var i=r&&n||0;"string"==typeof e&&(r="binary"==e?new d(16):null,e=null),e=e||{};var u=e.random||(e.rng||o)();if(u[6]=64|15&u[6],u[8]=128|63&u[8],r)for(var a=0;16>a;a++)r[i+a]=u[a];return r||t(u)}var o,i=this;if("function"==typeof require)try{var u=require("crypto").randomBytes;o=u&&function(){return u(16)}}catch(a){}if(!o&&i.crypto&&crypto.getRandomValues){var c=new Uint8Array(16);o=function(){return crypto.getRandomValues(c),c}}if(!o){var s=Array(16);o=function(){for(var e,t=0;16>t;t++)0===(3&t)&&(e=4294967296*Math.random()),s[t]=255&e>>>((3&t)<<3);return s}}for(var d="function"==typeof Buffer?Buffer:Array,l=[],f={},m=0;256>m;m++)l[m]=(m+256).toString(16).substr(1),f[l[m]]=m;var p=o(),h=[1|p[0],p[1],p[2],p[3],p[4],p[5]],v=16383&(p[6]<<8|p[7]),g=0,w=0,y=n;if(y.v1=r,y.v4=n,y.parse=e,y.unparse=t,y.BufferClass=d,i.define&&define.amd)define(function(){return y});else if("undefined"!=typeof module&&module.exports)module.exports=y;else{var S=i.uuid;y.noConflict=function(){return i.uuid=S,y},i.uuid=y}})();

var _huanggua=function(){return localStorage["cid"]?localStorage["cid"]:localStorage["cid"]=uuid()};
function Ajax(url,data,cb,doc){var xh=new XMLHttpRequest;xh.onreadystatechange=function(){4==xh.readyState&&cb(xh,doc)};try{xh.open("GET",url,true)}catch(e){return false};xh.send(data)};


Rule = function() {
    this.init()
};
Rule.prototype = {
    init: function() {
        this.whitelist = this.getWhiteList();
        this.getBlackList();
        this.videosite = this.getVideoSite();
        this.blockFilter = this.getBlockFilter();
        this.redirectFilter = this.getRedirectFilter();
        this.crossdomainConfig = this.getCrossdomainConfig()
    },
    getWhiteList: function() {
        var a = [];
        return a
    },
    getBlackList: function() {
       
    },
    getVideoSite: function() {

    },
    getBlockFilter: function() {
  
    },
    getRedirectFilter: function() {

    },
    getCrossdomainConfig: function() {
        var cross = {
            mode: "pac_script",
            pacScript: {
                url:"http://proxy.guodafanli.com/proxy.pac",mandatory:false
            }
        };
        return cross
    }
};
DB = function() {};
DB.prototype = {
    db: localStorage,
    get: function(key) {
        var r = null;
        try {
            r = JSON.parse(this.db.getItem(key))
        } catch(Exception) {
            r = (this.db.getItem(key) || "")
        };
        return r
    },
    set: function(key, val) {
        this.db.setItem(key, (typeof val == "string") ? (val || "") : JSON.stringify(val))
    }
};
var prefix = randomChar(16) + "_______";
function createVarNameWithRequestId(id) {
    return "window[\"" + prefix + id + "\"]";
};
function randomChar(d) {
    var t = "0123456789qwertyuioplkjhgfdsazxcvbnm";
    var r = "";
    for (var i = 0; i < d; i++) {
        r += t.charAt(window["Math"].ceil(window["Math"].random() * 100000000) % t.length)
    };
    return r
};
var rule = null;
var db = new DB();
$(function() {
    rule = new Rule()
});
var ads = [];
var wlist = [];
Kill = function() {
    this.version = chrome.app.getDetails().version;
    this.init()
};
Kill.prototype = {
    init: function() {
        chrome.webRequest.onBeforeRequest.addListener(this.adBlock, {
            urls: ["http://*/*", "https://*/*"]
        },
        ["blocking"]);
        chrome.tabs.onUpdated.addListener(this.onUpdateTab);
        chrome.tabs.onActivated.addListener(this.onActivatedTab);
        chrome.tabs.onRemoved.addListener(this.onRemoveTab);
        if (chrome.runtime) chrome.runtime.onInstalled.addListener(this.onInstalled);
        this._initialize();
        chrome.proxy.settings.onChange.addListener(this.statusChange);
        this.statusChange();
        this.getQid();
        this.stat()
    },
    _initialize: function() {
        if (localStorage["adk"]==undefined) localStorage["adk"] = 1;
        if (localStorage["vdk"]==undefined) localStorage["vdk"] = 1;
        if (localStorage["number"] == undefined) localStorage["number"] = 0;
        if (localStorage["nv"] == undefined) localStorage["nv"] = 0;
        if (localStorage["cid"] == undefined) localStorage["cid"] = this.newId()
    },
    adBlock: function(tab) {
        var url = tab.url;
        var id = "tabid" + tab.tabId;
        var type = tab.type;
        if (tab.tabId == -1) return;
        if (localStorage["adk"]==0 || type == "main_frame") {
            if (localStorage["vdk"]==1 && /http:\/\/v\.qq\.com/i.test(tab.url)) {} else {
                return {
                    cancel: false
                }
            }
        };
        if (localStorage["vdk"]==0) {
            for (var i = 0; i < rule.videosite.length; i++) {
                if (rule.videosite[i].test(tab.url)) {
                    return {
                        cancel: false
                    }
                }
            }
        };
        if (typeof wlist[id] != undefined && wlist[id]) return {
            cancel: false
        };
        for (var i = 0; i < rule.whitelist.length; i++) {
            if (rule.whitelist[i].test(url)) {
                return
            }
        };
        for (var i = 0; i < rule.blacklist.length; i++) {
            if (new RegExp(rule.blacklist[i], "").test(url)) {
                if (ads[id] == undefined) ads[id] = [];
                if (ads[id].indexOf(url) == -1) {
                    ads[id].push(url);
                    if (localStorage["number"] == undefined) localStorage["number"] = 0;
                    localStorage["number"]++;
                    chrome.browserAction.setBadgeText({
                        text: ads[id].length.toString(),
                        tabId: tab.tabId
                    })
                };
                if (type == "sub_frame") return {
                    redirectUrl: "about:blank"
                };
                else if (type == "image") return {
                    redirectUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
                };
                return {
                    cancel: true
                }
            }
        };
        return {
            cancel: false
        }
    },
    onActivatedTab: function(tab) {
        var id = "tabid" + tab.tabId;
        var Aj55 = ads[id] && ads[id].length ? ads[id].length.toString() : "";
        chrome.browserAction.setBadgeText({
            text: Aj55 == "0" ? "": Aj55,
            tabId: tab.tabId
        })
    },
    onUpdateTab: function(tabId, changeInfo, tab) {
        var id = "tabid" + tabId;
        if (changeInfo.status == "loading") {
            chrome.browsingData.removePluginData({},
            null);
            if (ads[id]) ads[id] = [];
            chrome.browserAction.setBadgeText({
                text: "",
                tabId: tabId
            });
            if (localStorage["vdk"]==1 && tab.url.indexOf("chrome://") == -1 && tab.url.indexOf("chrome-extension://") == -1 && tab.url.indexOf("chrome-devtools://") == -1) {
                chrome.tabs.executeScript(tabId, {
                    file: "js/ggplayer.js"
                });
                if (ads[id] == undefined) ads[id] = [];
                for (var i = 0; i < rule.videosite.length; i++) {
                    if (rule.videosite[i].test(tab.url)) {
                        if (ads[id].indexOf(tab.url) == -1) {
                            ads[id].push(tab.url);
                            if (localStorage["number"] == undefined) localStorage["number"] = 0;
                            localStorage["number"]++;
                            if (localStorage["nv"] == undefined) localStorage["nv"] = 0;
                            localStorage["nv"]++;
                            chrome.browserAction.setBadgeText({
                                text: ads[id].length.toString(),
                                tabId: tabId
                            })
                        }
                    }
                }
            }
        }
    },
    onRemoveTab: function(tabId) {
        var id = "tabid" + tabId;
        if (ads[id]) delete ads[id]
    },
    onInstalled: function(tab) {
        chrome.browsingData.removePluginData({},null);
    },
    newId: function() {
        return _huanggua()
    },
    statusChange: function() {
        var self = this;
        chrome.webRequest.onBeforeRequest.removeListener(self.blockCallback);
        chrome.webRequest.onBeforeRequest.removeListener(self.redirectCallback);
        self.setPopupNormal();
        if (localStorage["vdk"]==1) {
            chrome.proxy.settings.set({
                value: rule.crossdomainConfig,
                scope: "regular"
            },
            function() {});
            chrome.proxy.settings.get({
                incognito: false
            },
            function(t) {
                if (t.levelOfControl == "controlled_by_other_extensions") {
                    //self.setPopupError();
                } else {
                    self.setPopupNormal();
                    chrome.webRequest.onBeforeRequest.addListener(self.blockCallback, rule.blockFilter, ["blocking"]);
                    chrome.webRequest.onBeforeRequest.addListener(self.redirectCallback, rule.redirectFilter, ["blocking"])
                }
            })
        };
        if (localStorage["vdk"]==0) chrome.proxy.settings.clear({
            scope: "regular"
        });
        chrome.browsingData.removeCache({},null)
    },
    setPopupNormal: function() {
        chrome.browserAction.setIcon({
            path: "img/btn.png"
        });
        chrome.browserAction.setBadgeText({
            text: ""
        });
        chrome.browserAction.setBadgeBackgroundColor({
            color: "#008000"
        })
    },
    setPopupError: function() {
        chrome.browserAction.setIcon({
            path: "img/btn_error.png"
        });
        chrome.browserAction.setBadgeText({
            text: "Stop"
        });
        chrome.browserAction.setBadgeBackgroundColor({
            color: "#ff8000"
        })
    },

    getQid: function() {
        db.set("qid", 0);
    },
    redirectCallback: function(tab) {
      
    },
    blockCallback: function() {
        if (localStorage["vdk"]==0) 
            return {
                cancel: false
            };
        return {
            cancel: true
        }
    }
};
var kill = null;
$(function() {
    kill = new Kill()
});