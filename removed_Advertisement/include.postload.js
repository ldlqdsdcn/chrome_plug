var clickHide_activated=false;var clickHide_filters=null;var currentElement=null;var currentElement_boxShadow=null;var currentElement_backgroundColor;var clickHideFilters=null;var highlightedElementsSelector=null;var highlightedElementsBoxShadows=null;var highlightedElementsBGColors=null;var clickHideFiltersDialog=null;var lastRightClickEvent=null;
function highlightElements(selectorString){if(highlightedElementsSelector)
unhighlightElements();var highlightedElements=document.querySelectorAll(selectorString);highlightedElementsSelector=selectorString;highlightedElementsBoxShadows=new Array();highlightedElementsBGColors=new Array();for(var i=0;i<highlightedElements.length;i++){highlightedElementsBoxShadows[i]=highlightedElements[i].style.getPropertyValue("-webkit-box-shadow");highlightedElementsBGColors[i]=highlightedElements[i].style.backgroundColor;highlightedElements[i].style.setProperty("-webkit-box-shadow","inset 0px 0px 5px #fd6738");highlightedElements[i].style.backgroundColor="#f6e1e5";}}

function unhighlightElements(){if(highlightedElementsSelector==null)
return;var highlightedElements=document.querySelectorAll(highlightedElementsSelector);for(var i=0;i<highlightedElements.length;i++){highlightedElements[i].style.setProperty("-webkit-box-shadow",highlightedElementsBoxShadows[i]);highlightedElements[i].style.backgroundColor=highlightedElementsBGColors[i];}
highlightedElementsSelector=null;}


function getAbsolutePosition(elt){var l=0;var t=0;for(;elt;elt=elt.offsetParent){l+=elt.offsetLeft;t+=elt.offsetTop;}
return[l,t];}
function addElementOverlay(elt){ if(!elt)
return null;
 var url=getElementURL(elt);if(!elt.className&&!elt.id&&!url)
return;var thisStyle=getComputedStyle(elt,null);var overlay=document.createElement('div');overlay.prisoner=elt;overlay.prisonerURL=url;overlay.className="__adblockplus__overlay";overlay.setAttribute('style','opacity:0.4; background-color:#ffffff; display:inline-box; '+'width:'+thisStyle.width+'; height:'+thisStyle.height+'; position:absolute; overflow:hidden; -webkit-box-sizing:border-box; z-index: 99999');var pos=getAbsolutePosition(elt);overlay.style.left=pos[0]+"px";overlay.style.top=pos[1]+"px";document.body.appendChild(overlay);return overlay;}

function clickHide_showDialog(left,top,filters)
{ if(clickHide_activated||clickHideFiltersDialog)
{var savedElement=(currentElement.prisoner?currentElement.prisoner:currentElement);clickHide_deactivate();currentElement=savedElement;}
clickHide_filters=filters;clickHideFiltersDialog=document.createElement("iframe");clickHideFiltersDialog.src=chrome.extension.getURL("block.html");clickHideFiltersDialog.setAttribute("style","position: fixed !important; visibility: hidden; display: block !important; border: 0px !important;");clickHideFiltersDialog.style.WebkitBoxShadow="5px 5px 20px rgba(0,0,0,0.5)";clickHideFiltersDialog.style.zIndex=99999; clickHideFiltersDialog.style.left="50px";clickHideFiltersDialog.style.top="50px";
 clickHideFiltersDialog.onmouseout=function()
{if(clickHideFiltersDialog)
clickHideFiltersDialog.style.setProperty("opacity","0.7");}
clickHideFiltersDialog.onmouseover=function()
{if(clickHideFiltersDialog)
clickHideFiltersDialog.style.setProperty("opacity","1.0");}
document.body.appendChild(clickHideFiltersDialog);}
function clickHide_activate(){if(document==null)
return; if(clickHide_activated||clickHideFiltersDialog)
clickHide_deactivate(); var elts=document.querySelectorAll('object,embed,img,iframe');for(var i=0;i<elts.length;i++)
addElementOverlay(elts[i]);clickHide_activated=true;document.addEventListener("mouseover",clickHide_mouseOver,false);document.addEventListener("mouseout",clickHide_mouseOut,false);document.addEventListener("click",clickHide_mouseClick,false);document.addEventListener("keyup",clickHide_keyUp,false);}

function clickHide_rulesPending(){clickHide_activated=false;document.removeEventListener("mouseover",clickHide_mouseOver,false);document.removeEventListener("mouseout",clickHide_mouseOut,false);document.removeEventListener("click",clickHide_mouseClick,false);document.removeEventListener("keyup",clickHide_keyUp,false);}
function clickHide_deactivate()
{if(clickHideFiltersDialog)
{document.body.removeChild(clickHideFiltersDialog);clickHideFiltersDialog=null;}
if(currentElement){currentElement.removeEventListener("contextmenu",clickHide_elementClickHandler,false);unhighlightElements();currentElement.style.setProperty("-webkit-box-shadow",currentElement_boxShadow);currentElement.style.backgroundColor=currentElement_backgroundColor;currentElement=null;clickHideFilters=null;}
unhighlightElements();clickHide_activated=false;clickHide_filters=null;if(!document)
return; document.removeEventListener("mouseover",clickHide_mouseOver,false);document.removeEventListener("mouseout",clickHide_mouseOut,false);document.removeEventListener("click",clickHide_mouseClick,false);document.removeEventListener("keyup",clickHide_keyUp,false);
 var elt;while(elt=document.querySelector('.__adblockplus__overlay'))
elt.parentNode.removeChild(elt);}
function clickHide_elementClickHandler(ev){ev.preventDefault();ev.stopPropagation();clickHide_mouseClick(ev);}
function clickHide_mouseOver(e){if(clickHide_activated==false)
return;if(e.target.id||e.target.className||e.target.src){currentElement=e.target;currentElement_boxShadow=e.target.style.getPropertyValue("-webkit-box-shadow");currentElement_backgroundColor=e.target.style.backgroundColor;e.target.style.setProperty("-webkit-box-shadow","inset 0px 0px 5px #d6d84b");e.target.style.backgroundColor="#f8fa47"; e.target.addEventListener("contextmenu",clickHide_elementClickHandler,false);}}
function clickHide_mouseOut(e){if(!clickHide_activated||!currentElement)
return;currentElement.style.setProperty("-webkit-box-shadow",currentElement_boxShadow);currentElement.style.backgroundColor=currentElement_backgroundColor; currentElement.removeEventListener("contextmenu",clickHide_elementClickHandler,false);}
function clickHide_keyUp(e){ if(e.ctrlKey&&e.shiftKey&&e.keyCode==69)
clickHide_mouseClick(e);}

function clickHide_mouseClick(e){if(!currentElement||!clickHide_activated)
return;var elt=currentElement;var url=null;if(currentElement.className&&currentElement.className=="__adblockplus__overlay"){elt=currentElement.prisoner;url=currentElement.prisonerURL;}else if(elt.src){url=elt.src;} 
if(url)
url=normalizeURL(relativeToAbsoluteUrl(url)); var elementId=elt.id?elt.id.split(' ').join(''):null; var elementClasses=null;if(elt.className){elementClasses=elt.className.replace(/\s+/g,' ').replace(/^\s+|\s+$/g,'').split(' ');}
clickHideFilters=new Array();selectorList=new Array();if(elementId){clickHideFilters.push(document.domain+"###"+elementId);selectorList.push("#"+elementId);}
if(elementClasses){for(var i=0;i<elementClasses.length;i++){clickHideFilters.push(document.domain+"##."+elementClasses[i]);selectorList.push("."+elementClasses[i]);}}
if(url){clickHideFilters.push(relativeToAbsoluteUrl(url));selectorList.push(elt.localName+'[src="'+url+'"]');} 
clickHide_showDialog(e.clientX,e.clientY,clickHideFilters);
 currentElement.style.setProperty("-webkit-box-shadow",currentElement_boxShadow);currentElement.style.backgroundColor=currentElement_backgroundColor; highlightElements(selectorList.join(",")); currentElement.style.setProperty("-webkit-box-shadow","inset 0px 0px 5px #fd1708");currentElement.style.backgroundColor="#f6a1b5";}
function getElementURL(elt){
 var url;if(elt.localName.toUpperCase()=="OBJECT"&&!(url=elt.getAttribute("data"))){ var params=elt.querySelectorAll("param[name=\"movie\"]"); if(params[0])
url=params[0].getAttribute("value");else{params=elt.querySelectorAll("param[name=\"src\"]");if(params[0])
url=params[0].getAttribute("value");}}else if(!url){url=elt.getAttribute("src")||elt.getAttribute("href");}
return url;}


function relativeToAbsoluteUrl(url)
{ if(!url||/^[\w\-]+:/i.test(url))
return url;
 if(url[0]=='/')
{if(url[1]=='/')
return document.location.protocol+url;else
return document.location.protocol+"//"+document.location.host+url;} 
var base=document.baseURI.match(/.+\//);if(!base)
return document.baseURI+"/"+url;return base[0]+url;}

function removeDotSegments(u){var r='',m=[];if(/\./.test(u)){while(u!==undefined&&u!==''){if(u==='.'||u==='..'){u='';}else if(/^\.\.\//.test(u)){u=u.substring(3);}else if(/^\.\//.test(u)){u=u.substring(2);}else if(/^\/\.(\/|$)/.test(u)){u='/'+u.substring(3);}else if(/^\/\.\.(\/|$)/.test(u)){u='/'+u.substring(4);r=r.replace(/\/?[^\/]+$/,'');}else{m=u.match(/^(\/?[^\/]*)(\/.*)?$/);u=m[2];r=r+m[1];}}
return r;}else{return u;}}
function normalizeURL(url)
{var components=url.match(/(.+:\/\/.+?)\/(.*)/);if(!components)
return url;var newPath=removeDotSegments(components[2]);if(newPath.length==0)
return components[1];if(newPath[0]!='/')
newPath='/'+newPath;return components[1]+newPath;}



if(document.documentElement instanceof HTMLElement)
{
document.addEventListener('contextmenu',function(e){lastRightClickEvent=e;},false);document.addEventListener("click",function(event)
{ if(event.button==2)
return; var link=event.target;while(link&&!(link instanceof HTMLAnchorElement))
link=link.parentNode;if(!link||link.protocol!="abp:")
return; event.preventDefault();event.stopPropagation();var linkTarget=link.href;if(!/^abp:\/*subscribe\/*\?(.*)/i.test(linkTarget))return; var params=RegExp.$1.split("&");var title=null;var url=null;for(var i=0;i<params.length;i++)
{var parts=params[i].split("=",2);if(parts.length!=2||!/\S/.test(parts[1]))
continue;switch(parts[0])
{case"title":title=decodeURIComponent(parts[1]);break;case"location":url=decodeURIComponent(parts[1]);break;}}
if(!url)
return; if(!title)
title=url; title=title.replace(/^\s+/,"").replace(/\s+$/,"");url=url.replace(/^\s+/,"").replace(/\s+$/,"");if(!/^(https?|ftp):/.test(url))
return;chrome.extension.sendRequest({reqtype:"add-subscription",title:title,url:url});},true);chrome.extension.onRequest.addListener(function(request,sender,sendResponse)
{switch(request.reqtype)
{case"get-clickhide-state":sendResponse({active:clickHide_activated});break;case"clickhide-activate":clickHide_activate();break;case"clickhide-deactivate":clickHide_deactivate();break;case"clickhide-new-filter":
 if(!lastRightClickEvent)
return;
 var target=lastRightClickEvent.target;var url=target.src;
if(request.filter!==url){
var elts=document.querySelectorAll('[src]');for(var i=0;i<elts.length;i++){url=elts[i].src;if(request.filter===url){
target=elts[i];break;}}} 
if(request.filter===url)
{
clickHide_activated=true;clickHideFilters=[request.filter]; currentElement=addElementOverlay(target);clickHide_mouseClick(lastRightClickEvent);}
else
console.log("clickhide-new-filter: URLs don't match. Couldn't find that element.",request.filter,url,lastRightClickEvent.target.src);break;case"clickhide-init":if(clickHideFiltersDialog)
{sendResponse({filters:clickHide_filters});clickHideFiltersDialog.style.width=(request.width+5)+"px";clickHideFiltersDialog.style.height=(request.height+5)+"px";clickHideFiltersDialog.style.visibility="visible";}
break;case"clickhide-move":if(clickHideFiltersDialog)
{clickHideFiltersDialog.style.left=(parseInt(clickHideFiltersDialog.style.left,10)+request.x)+"px";clickHideFiltersDialog.style.top=(parseInt(clickHideFiltersDialog.style.top,10)+request.y)+"px";}
break;case"clickhide-close":if(clickHideFiltersDialog)
{ if(request.remove&&currentElement&&currentElement.parentNode)
currentElement.parentNode.removeChild(currentElement);clickHide_deactivate();}
break;default:sendResponse({});break;}});}