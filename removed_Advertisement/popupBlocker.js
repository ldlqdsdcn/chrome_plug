if("webNavigation"in chrome)
{var tabsLoading={};chrome.webNavigation.onCreatedNavigationTarget.addListener(function(details)
{if(isFrameWhitelisted(details.sourceTabId,details.sourceFrameId))
return;var openerUrl=getFrameUrl(details.sourceTabId,details.sourceFrameId);if(!openerUrl)
{ return;}
tabsLoading[details.tabId]=openerUrl;checkPotentialPopup(details.tabId,details.url,openerUrl);});chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab)
{if(!(tabId in tabsLoading))
{ return;}
if("url"in changeInfo)
checkPotentialPopup(tabId,tab.url,tabsLoading[tabId]);if("status"in changeInfo&&changeInfo.status=="complete"&&tab.url!="about:blank")
delete tabsLoading[tabId];});}
function checkPotentialPopup(tabId,url,opener)
{var requestHost=extractHostFromURL(url);var documentHost=extractHostFromURL(opener);var thirdParty=isThirdParty(requestHost,documentHost);var filter=defaultMatcher.matchesAny(url||"about:blank","POPUP",documentHost,thirdParty);if(filter instanceof BlockingFilter)
chrome.tabs.remove(tabId);}