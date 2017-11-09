(function(globalObj)
{ function seq()
{return{type:0x30,children:Array.prototype.slice.call(arguments)};}
function obj(id)
{return{type:0x06,content:id};}
function bitStr(contents)
{return{type:0x03,encapsulates:contents};}
function intResult(id)
{return{type:0x02,out:id};}
function octetResult(id)
{return{type:0x04,out:id};}
 
var publicKeyTemplate=seq(seq(obj("\x2A\x86\x48\x86\xF7\x0D\x01\x01\x01"),{}),bitStr(seq(intResult("n"),intResult("e"))));
 var signatureTemplate=seq(seq(obj("\x2B\x0E\x03\x02\x1A"),{}),octetResult("sha1"));function readASN1(data,templ)
{var pos=0;function next()
{return data.charCodeAt(pos++);}
function readLength()
{var len=next();if(len&0x80)
{var cnt=len&0x7F;if(cnt>2||cnt==0)
throw"Unsupported length";len=0;for(var i=0;i<cnt;i++)
len+=next()<<(cnt-1-i)*8;return len;}
else
return len;}
function readNode(curTempl)
{var type=next();var len=readLength();if("type"in curTempl&&curTempl.type!=type)
throw"Unexpected type";if("content"in curTempl&&curTempl.content!=data.substr(pos,len))
throw"Unexpected content";if("out"in curTempl)
out[curTempl.out]=new BigInteger(data.substr(pos,len),256);if("children"in curTempl)
{var i,end;for(i=0,end=pos+len;pos<end;i++)
{if(i>=curTempl.children.length)
throw"Too many children";readNode(curTempl.children[i]);}
if(i<curTempl.children.length)
throw"Too few children";if(pos>end)
throw"Children too large";}
else if("encapsulates"in curTempl)
{if(next()!=0)
throw"Encapsulation expected";readNode(curTempl.encapsulates);}
else
pos+=len;}
var out={};readNode(templ);if(pos!=data.length)
throw"Too much data";return out;}
function readPublicKey(key)
{try
{return readASN1(atob(key),publicKeyTemplate);}
catch(e)
{console.log("Invalid RSA public key: "+e);return null;}}
function verifySignature(key,signature,data)
{var keyData=readPublicKey(key);if(!keyData)
return false; keyData.e=parseInt(keyData.e.toString(16),16); var sigInt=new BigInteger(atob(signature),256);var digest=sigInt.modPowInt(keyData.e,keyData.n).toString(256);try
{var pos=0;function next()
{return digest.charCodeAt(pos++);} 
if(next()!=1)
throw"Wrong padding in signature digest";while(next()==255){}
if(digest.charCodeAt(pos-1)!=0)
throw"Wrong padding in signature digest";
 var sha1=readASN1(digest.substr(pos),signatureTemplate).sha1;var expected=new BigInteger(SHA1(data),16);return(sha1.compareTo(expected)==0);}
catch(e)
{console.log("Invalid encrypted signature: "+e);return false;}}
globalObj.verifySignature=verifySignature;})(this);