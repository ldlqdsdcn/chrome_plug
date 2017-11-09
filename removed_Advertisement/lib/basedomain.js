const RE_V4=/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|0x[0-9a-f][0-9a-f]?|0[0-7]{3})\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|0x[0-9a-f][0-9a-f]?|0[0-7]{3})$/i;const RE_V4_HEX=/^0x([0-9a-f]{8})$/i;const RE_V4_NUMERIC=/^[0-9]+$/;const RE_V4inV6=/(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;const RE_BAD_CHARACTERS=/([^0-9a-f:])/i;const RE_BAD_ADDRESS=/([0-9a-f]{5,}|:{3,}|[^:]:$|^:[^:]$)/i;function isIPv4(address)
{if(RE_V4.test(address))
return true;if(RE_V4_HEX.test(address))
return true;if(RE_V4_NUMERIC.test(address))
return true;return false;}
function isIPv6(address)
{var a4addon=0;var address4=address.match(RE_V4inV6);if(address4)
{var temp4=address4[0].split('.');for(var i=0;i<4;i++)
{if(/^0[0-9]+/.test(temp4[i]))
return false;}
address=address.replace(RE_V4inV6,'');if(/[0-9]$/.test(address))
return false;address=address+temp4.join(':');a4addon=2;}
if(RE_BAD_CHARACTERS.test(address))
return false;if(RE_BAD_ADDRESS.test(address))
return false;function count(string,substring)
{return(string.length-string.replace(new RegExp(substring,"g"),'').length)/substring.length;}
var halves=count(address,'::');if(halves==1&&count(address,':')<=6+2+a4addon)
return true;if(halves==0&&count(address,':')==7+a4addon)
return true;return false;}
function getBaseDomain(hostname){hostname=hostname.replace(/\.+$/,''); if(isIPv6(hostname)||isIPv4(hostname))
return hostname; if(hostname.indexOf('xn--')>=0)
{hostname=punycode.toUnicode(hostname);} 
var prevDomains=[];var curDomain=hostname;var nextDot=curDomain.indexOf('.');var tld=0;while(true)
{var suffix=publicSuffixes[curDomain];if(typeof(suffix)!='undefined')
{tld=suffix;break;}
if(nextDot<0)
{tld=1;break;}
prevDomains.push(curDomain.substring(0,nextDot));curDomain=curDomain.substring(nextDot+1);nextDot=curDomain.indexOf('.');}
while(tld>0&&prevDomains.length>0)
{curDomain=prevDomains.pop()+'.'+curDomain;tld--;}
return curDomain;}
function isThirdParty(requestHost,documentHost)
{ requestHost=requestHost.replace(/\.+$/,"");documentHost=documentHost.replace(/\.+$/,""); var documentDomain=getBaseDomain(documentHost);if(requestHost.length>documentDomain.length)
return(requestHost.substr(requestHost.length-documentDomain.length-1)!="."+documentDomain);else
return(requestHost!=documentDomain);}
function extractHostFromURL(url)
{if(url&&extractHostFromURL._lastURL==url)
return extractHostFromURL._lastDomain;var host="";try
{host=new URI(url).host;}
catch(e)
{}
extractHostFromURL._lastURL=url;extractHostFromURL._lastDomain=host;return host;}
function URI(spec)
{this.spec=spec;this._schemeEnd=spec.indexOf(":");if(this._schemeEnd<0)
throw new Error("Invalid URI scheme");if(spec.substr(this._schemeEnd+1,2)!="//")
throw new Error("Unexpected URI structure");this._hostPortStart=this._schemeEnd+3;this._hostPortEnd=spec.indexOf("/",this._hostPortStart);if(this._hostPortEnd<0)
throw new Error("Invalid URI host");var authEnd=spec.indexOf("@",this._hostPortStart);if(authEnd>=0&&authEnd<this._hostPortEnd)
this._hostPortStart=authEnd+1;this._portStart=-1;this._hostEnd=spec.indexOf("]",this._hostPortStart+1);if(spec[this._hostPortStart]=="["&&this._hostEnd>=0&&this._hostEnd<this._hostPortEnd)
{ this._hostStart=this._hostPortStart+1;if(spec[this._hostEnd+1]==":")
this._portStart=this._hostEnd+2;}
else
{this._hostStart=this._hostPortStart;this._hostEnd=spec.indexOf(":",this._hostStart);if(this._hostEnd>=0&&this._hostEnd<this._hostPortEnd)
this._portStart=this._hostEnd+1;else
this._hostEnd=this._hostPortEnd;}}
URI.prototype={spec:null,get scheme()
{return this.spec.substring(0,this._schemeEnd).toLowerCase();},get host()
{return this.spec.substring(this._hostStart,this._hostEnd);},get asciiHost()
{var host=this.host;if(/^[\x00-\x7F]+$/.test(host))
return host;else
return punycode.toASCII(host);},get hostPort()
{return this.spec.substring(this._hostPortStart,this._hostPortEnd);},get port()
{if(this._portStart<0)
return-1;else
return parseInt(this.spec.substring(this._portStart,this._hostPortEnd),10);},get path()
{return this.spec.substring(this._hostPortEnd);},get prePath()
{return this.spec.substring(0,this._hostPortEnd);}};