var Zepto=(function(){var undefined,key,$,classList,emptyArray=[],slice=emptyArray.slice,filter=emptyArray.filter,document=window.document,elementDisplay={},classCache={},cssNumber={'column-count':1,'columns':1,'font-weight':1,'line-height':1,'opacity':1,'z-index':1,'zoom':1},fragmentRE=/^\s*<(\w+|!)[^>]*>/,singleTagRE=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,tagExpanderRE=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,rootNodeRE=/^(?:body|html)$/i,capitalRE=/([A-Z])/g,methodAttributes=['val','css','html','text','data','width','height','offset'],adjacencyOperators=['after','prepend','before','append'],table=document.createElement('table'),tableRow=document.createElement('tr'),containers={'tr':document.createElement('tbody'),'tbody':table,'thead':table,'tfoot':table,'td':tableRow,'th':tableRow,'*':document.createElement('div')},readyRE=/complete|loaded|interactive/,simpleSelectorRE=/^[\w-]*$/,class2type={},toString=class2type.toString,zepto={},camelize,uniq,tempParent=document.createElement('div'),propMap={'tabindex':'tabIndex','readonly':'readOnly','for':'htmlFor','class':'className','maxlength':'maxLength','cellspacing':'cellSpacing','cellpadding':'cellPadding','rowspan':'rowSpan','colspan':'colSpan','usemap':'useMap','frameborder':'frameBorder','contenteditable':'contentEditable'},isArray=Array.isArray||function(object){return object instanceof Array}
zepto.matches=function(element,selector){if(!selector||!element||element.nodeType!==1)return false
var matchesSelector=element.webkitMatchesSelector||element.mozMatchesSelector||element.oMatchesSelector||element.matchesSelector
if(matchesSelector)return matchesSelector.call(element,selector)
var match,parent=element.parentNode,temp=!parent
if(temp)(parent=tempParent).appendChild(element)
match=~zepto.qsa(parent,selector).indexOf(element)
temp&&tempParent.removeChild(element)
return match}
function type(obj){return obj==null?String(obj):class2type[toString.call(obj)]||"object"}
function isFunction(value){return type(value)=="function"}
function isWindow(obj){return obj!=null&&obj==obj.window}
function isDocument(obj){return obj!=null&&obj.nodeType==obj.DOCUMENT_NODE}
function isObject(obj){return type(obj)=="object"}
function isPlainObject(obj){return isObject(obj)&&!isWindow(obj)&&Object.getPrototypeOf(obj)==Object.prototype}
function likeArray(obj){return typeof obj.length=='number'}
function compact(array){return filter.call(array,function(item){return item!=null})}
function flatten(array){return array.length>0?$.fn.concat.apply([],array):array}
camelize=function(str){return str.replace(/-+(.)?/g,function(match,chr){return chr?chr.toUpperCase():''})}
function dasherize(str){return str.replace(/::/g,'/').replace(/([A-Z]+)([A-Z][a-z])/g,'$1_$2').replace(/([a-z\d])([A-Z])/g,'$1_$2').replace(/_/g,'-').toLowerCase()}
uniq=function(array){return filter.call(array,function(item,idx){return array.indexOf(item)==idx})}
function classRE(name){return name in classCache?classCache[name]:(classCache[name]=new RegExp('(^|\\s)'+name+'(\\s|$)'))}
function maybeAddPx(name,value){return(typeof value=="number"&&!cssNumber[dasherize(name)])?value+"px":value}
function defaultDisplay(nodeName){var element,display
if(!elementDisplay[nodeName]){element=document.createElement(nodeName)
document.body.appendChild(element)
display=getComputedStyle(element,'').getPropertyValue("display")
element.parentNode.removeChild(element)
display=="none"&&(display="block")
elementDisplay[nodeName]=display}
return elementDisplay[nodeName]}
function children(element){return'children'in element?slice.call(element.children):$.map(element.childNodes,function(node){if(node.nodeType==1)return node})}
zepto.fragment=function(html,name,properties){var dom,nodes,container
if(singleTagRE.test(html))dom=$(document.createElement(RegExp.$1))
if(!dom){if(html.replace)html=html.replace(tagExpanderRE,"<$1></$2>")
if(name===undefined)name=fragmentRE.test(html)&&RegExp.$1
if(!(name in containers))name='*'
container=containers[name]
container.innerHTML=''+html
dom=$.each(slice.call(container.childNodes),function(){container.removeChild(this)})}
if(isPlainObject(properties)){nodes=$(dom)
$.each(properties,function(key,value){if(methodAttributes.indexOf(key)>-1)nodes[key](value)
else nodes.attr(key,value)})}
return dom}
zepto.Z=function(dom,selector){dom=dom||[]
dom.__proto__=$.fn
dom.selector=selector||''
return dom}
zepto.isZ=function(object){return object instanceof zepto.Z}
zepto.init=function(selector,context){var dom
if(!selector)return zepto.Z()
else if(typeof selector=='string'){selector=selector.trim()
if(selector[0]=='<'&&fragmentRE.test(selector))
dom=zepto.fragment(selector,RegExp.$1,context),selector=null
else if(context!==undefined)return $(context).find(selector)
else dom=zepto.qsa(document,selector)}
else if(isFunction(selector))return $(document).ready(selector)
else if(zepto.isZ(selector))return selector
else{if(isArray(selector))dom=compact(selector)
else if(isObject(selector))
dom=[selector],selector=null
else if(fragmentRE.test(selector))
dom=zepto.fragment(selector.trim(),RegExp.$1,context),selector=null
else if(context!==undefined)return $(context).find(selector)
else dom=zepto.qsa(document,selector)}
return zepto.Z(dom,selector)}
$=function(selector,context){return zepto.init(selector,context)}
function extend(target,source,deep){for(key in source)
if(deep&&(isPlainObject(source[key])||isArray(source[key]))){if(isPlainObject(source[key])&&!isPlainObject(target[key]))
target[key]={}
if(isArray(source[key])&&!isArray(target[key]))
target[key]=[]
extend(target[key],source[key],deep)}
else if(source[key]!==undefined)target[key]=source[key]}
$.extend=function(target){var deep,args=slice.call(arguments,1)
if(typeof target=='boolean'){deep=target
target=args.shift()}
args.forEach(function(arg){extend(target,arg,deep)})
return target}
zepto.qsa=function(element,selector){var found,maybeID=selector[0]=='#',maybeClass=!maybeID&&selector[0]=='.',nameOnly=maybeID||maybeClass?selector.slice(1):selector,isSimple=simpleSelectorRE.test(nameOnly)
return(isDocument(element)&&isSimple&&maybeID)?((found=element.getElementById(nameOnly))?[found]:[]):(element.nodeType!==1&&element.nodeType!==9)?[]:slice.call(isSimple&&!maybeID?maybeClass?element.getElementsByClassName(nameOnly):element.getElementsByTagName(selector):element.querySelectorAll(selector))}
function filtered(nodes,selector){return selector==null?$(nodes):$(nodes).filter(selector)}
$.contains=document.documentElement.contains?function(parent,node){return parent!==node&&parent.contains(node)}:function(parent,node){while(node&&(node=node.parentNode))
if(node===parent)return true
return false}
function funcArg(context,arg,idx,payload){return isFunction(arg)?arg.call(context,idx,payload):arg}
function setAttribute(node,name,value){value==null?node.removeAttribute(name):node.setAttribute(name,value)}
function className(node,value){var klass=node.className||'',svg=klass&&klass.baseVal!==undefined
if(value===undefined)return svg?klass.baseVal:klass
svg?(klass.baseVal=value):(node.className=value)}
function deserializeValue(value){try{return value?value=="true"||(value=="false"?false:value=="null"?null:+value+""==value?+value:/^[\[\{]/.test(value)?$.parseJSON(value):value):value}catch(e){return value}}
$.type=type
$.isFunction=isFunction
$.isWindow=isWindow
$.isArray=isArray
$.isPlainObject=isPlainObject
$.isEmptyObject=function(obj){var name
for(name in obj)return false
return true}
$.inArray=function(elem,array,i){return emptyArray.indexOf.call(array,elem,i)}
$.camelCase=camelize
$.trim=function(str){return str==null?"":String.prototype.trim.call(str)}
$.uuid=0
$.support={}
$.expr={}
$.map=function(elements,callback){var value,values=[],i,key
if(likeArray(elements))
for(i=0;i<elements.length;i++){value=callback(elements[i],i)
if(value!=null)values.push(value)}
else
for(key in elements){value=callback(elements[key],key)
if(value!=null)values.push(value)}
return flatten(values)}
$.each=function(elements,callback){var i,key
if(likeArray(elements)){for(i=0;i<elements.length;i++)
if(callback.call(elements[i],i,elements[i])===false)return elements}else{for(key in elements)
if(callback.call(elements[key],key,elements[key])===false)return elements}
return elements}
$.grep=function(elements,callback){return filter.call(elements,callback)}
if(window.JSON)$.parseJSON=JSON.parse
$.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(i,name){class2type["[object "+name+"]"]=name.toLowerCase()})
$.fn={forEach:emptyArray.forEach,reduce:emptyArray.reduce,push:emptyArray.push,sort:emptyArray.sort,indexOf:emptyArray.indexOf,concat:emptyArray.concat,map:function(fn){return $($.map(this,function(el,i){return fn.call(el,i,el)}))},slice:function(){return $(slice.apply(this,arguments))},ready:function(callback){if(readyRE.test(document.readyState)&&document.body)callback($)
else document.addEventListener('DOMContentLoaded',function(){callback($)},false)
return this},get:function(idx){return idx===undefined?slice.call(this):this[idx>=0?idx:idx+this.length]},toArray:function(){return this.get()},size:function(){return this.length},remove:function(){return this.each(function(){if(this.parentNode!=null)
this.parentNode.removeChild(this)})},each:function(callback){emptyArray.every.call(this,function(el,idx){return callback.call(el,idx,el)!==false})
return this},filter:function(selector){if(isFunction(selector))return this.not(this.not(selector))
return $(filter.call(this,function(element){return zepto.matches(element,selector)}))},add:function(selector,context){return $(uniq(this.concat($(selector,context))))},is:function(selector){return this.length>0&&zepto.matches(this[0],selector)},not:function(selector){var nodes=[]
if(isFunction(selector)&&selector.call!==undefined)
this.each(function(idx){if(!selector.call(this,idx))nodes.push(this)})
else{var excludes=typeof selector=='string'?this.filter(selector):(likeArray(selector)&&isFunction(selector.item))?slice.call(selector):$(selector)
this.forEach(function(el){if(excludes.indexOf(el)<0)nodes.push(el)})}
return $(nodes)},has:function(selector){return this.filter(function(){return isObject(selector)?$.contains(this,selector):$(this).find(selector).size()})},eq:function(idx){return idx===-1?this.slice(idx):this.slice(idx,+idx+1)},first:function(){var el=this[0]
return el&&!isObject(el)?el:$(el)},last:function(){var el=this[this.length-1]
return el&&!isObject(el)?el:$(el)},find:function(selector){var result,$this=this
if(!selector)result=$()
else if(typeof selector=='object')
result=$(selector).filter(function(){var node=this
return emptyArray.some.call($this,function(parent){return $.contains(parent,node)})})
else if(this.length==1)result=$(zepto.qsa(this[0],selector))
else result=this.map(function(){return zepto.qsa(this,selector)})
return result},closest:function(selector,context){var node=this[0],collection=false
if(typeof selector=='object')collection=$(selector)
while(node&&!(collection?collection.indexOf(node)>=0:zepto.matches(node,selector)))
node=node!==context&&!isDocument(node)&&node.parentNode
return $(node)},parents:function(selector){var ancestors=[],nodes=this
while(nodes.length>0)
nodes=$.map(nodes,function(node){if((node=node.parentNode)&&!isDocument(node)&&ancestors.indexOf(node)<0){ancestors.push(node)
return node}})
return filtered(ancestors,selector)},parent:function(selector){return filtered(uniq(this.pluck('parentNode')),selector)},children:function(selector){return filtered(this.map(function(){return children(this)}),selector)},contents:function(){return this.map(function(){return slice.call(this.childNodes)})},siblings:function(selector){return filtered(this.map(function(i,el){return filter.call(children(el.parentNode),function(child){return child!==el})}),selector)},empty:function(){return this.each(function(){this.innerHTML=''})},pluck:function(property){return $.map(this,function(el){return el[property]})},show:function(){return this.each(function(){this.style.display=="none"&&(this.style.display='')
if(getComputedStyle(this,'').getPropertyValue("display")=="none")
this.style.display=defaultDisplay(this.nodeName)})},replaceWith:function(newContent){return this.before(newContent).remove()},wrap:function(structure){var func=isFunction(structure)
if(this[0]&&!func)
var dom=$(structure).get(0),clone=dom.parentNode||this.length>1
return this.each(function(index){$(this).wrapAll(func?structure.call(this,index):clone?dom.cloneNode(true):dom)})},wrapAll:function(structure){if(this[0]){$(this[0]).before(structure=$(structure))
var children
while((children=structure.children()).length)structure=children.first()
$(structure).append(this)}
return this},wrapInner:function(structure){var func=isFunction(structure)
return this.each(function(index){var self=$(this),contents=self.contents(),dom=func?structure.call(this,index):structure
contents.length?contents.wrapAll(dom):self.append(dom)})},unwrap:function(){this.parent().each(function(){$(this).replaceWith($(this).children())})
return this},clone:function(){return this.map(function(){return this.cloneNode(true)})},hide:function(){return this.css("display","none")},toggle:function(setting){return this.each(function(){var el=$(this);(setting===undefined?el.css("display")=="none":setting)?el.show():el.hide()})},prev:function(selector){return $(this.pluck('previousElementSibling')).filter(selector||'*')},next:function(selector){return $(this.pluck('nextElementSibling')).filter(selector||'*')},html:function(html){return 0 in arguments?this.each(function(idx){var originHtml=this.innerHTML
$(this).empty().append(funcArg(this,html,idx,originHtml))}):(0 in this?this[0].innerHTML:null)},text:function(text){return 0 in arguments?this.each(function(idx){var newText=funcArg(this,text,idx,this.textContent)
this.textContent=newText==null?'':''+newText}):(0 in this?this[0].textContent:null)},attr:function(name,value){var result
return(typeof name=='string'&&!(1 in arguments))?(!this.length||this[0].nodeType!==1?undefined:(!(result=this[0].getAttribute(name))&&name in this[0])?this[0][name]:result):this.each(function(idx){if(this.nodeType!==1)return
if(isObject(name))for(key in name)setAttribute(this,key,name[key])
else setAttribute(this,name,funcArg(this,value,idx,this.getAttribute(name)))})},removeAttr:function(name){return this.each(function(){this.nodeType===1&&name.split(' ').forEach(function(attribute){setAttribute(this,attribute)},this)})},prop:function(name,value){name=propMap[name]||name
return(1 in arguments)?this.each(function(idx){this[name]=funcArg(this,value,idx,this[name])}):(this[0]&&this[0][name])},data:function(name,value){var attrName='data-'+name.replace(capitalRE,'-$1').toLowerCase()
var data=(1 in arguments)?this.attr(attrName,value):this.attr(attrName)
return data!==null?deserializeValue(data):undefined},val:function(value){return 0 in arguments?this.each(function(idx){this.value=funcArg(this,value,idx,this.value)}):(this[0]&&(this[0].multiple?$(this[0]).find('option').filter(function(){return this.selected}).pluck('value'):this[0].value))},offset:function(coordinates){if(coordinates)return this.each(function(index){var $this=$(this),coords=funcArg(this,coordinates,index,$this.offset()),parentOffset=$this.offsetParent().offset(),props={top:coords.top-parentOffset.top,left:coords.left-parentOffset.left}
if($this.css('position')=='static')props['position']='relative'
$this.css(props)})
if(!this.length)return null
var obj=this[0].getBoundingClientRect()
return{left:obj.left+window.pageXOffset,top:obj.top+window.pageYOffset,width:Math.round(obj.width),height:Math.round(obj.height)}},css:function(property,value){if(arguments.length<2){var computedStyle,element=this[0]
if(!element)return
computedStyle=getComputedStyle(element,'')
if(typeof property=='string')
return element.style[camelize(property)]||computedStyle.getPropertyValue(property)
else if(isArray(property)){var props={}
$.each(property,function(_,prop){props[prop]=(element.style[camelize(prop)]||computedStyle.getPropertyValue(prop))})
return props}}
var css=''
if(type(property)=='string'){if(!value&&value!==0)
this.each(function(){this.style.removeProperty(dasherize(property))})
else
css=dasherize(property)+":"+maybeAddPx(property,value)}else{for(key in property)
if(!property[key]&&property[key]!==0)
this.each(function(){this.style.removeProperty(dasherize(key))})
else
css+=dasherize(key)+':'+maybeAddPx(key,property[key])+';'}
return this.each(function(){this.style.cssText+=';'+css})},index:function(element){return element?this.indexOf($(element)[0]):this.parent().children().indexOf(this[0])},hasClass:function(name){if(!name)return false
return emptyArray.some.call(this,function(el){return this.test(className(el))},classRE(name))},addClass:function(name){if(!name)return this
return this.each(function(idx){if(!('className'in this))return
classList=[]
var cls=className(this),newName=funcArg(this,name,idx,cls)
newName.split(/\s+/g).forEach(function(klass){if(!$(this).hasClass(klass))classList.push(klass)},this)
classList.length&&className(this,cls+(cls?" ":"")+classList.join(" "))})},removeClass:function(name){return this.each(function(idx){if(!('className'in this))return
if(name===undefined)return className(this,'')
classList=className(this)
funcArg(this,name,idx,classList).split(/\s+/g).forEach(function(klass){classList=classList.replace(classRE(klass)," ")})
className(this,classList.trim())})},toggleClass:function(name,when){if(!name)return this
return this.each(function(idx){var $this=$(this),names=funcArg(this,name,idx,className(this))
names.split(/\s+/g).forEach(function(klass){(when===undefined?!$this.hasClass(klass):when)?$this.addClass(klass):$this.removeClass(klass)})})},scrollTop:function(value){if(!this.length)return
var hasScrollTop='scrollTop'in this[0]
if(value===undefined)return hasScrollTop?this[0].scrollTop:this[0].pageYOffset
return this.each(hasScrollTop?function(){this.scrollTop=value}:function(){this.scrollTo(this.scrollX,value)})},scrollLeft:function(value){if(!this.length)return
var hasScrollLeft='scrollLeft'in this[0]
if(value===undefined)return hasScrollLeft?this[0].scrollLeft:this[0].pageXOffset
return this.each(hasScrollLeft?function(){this.scrollLeft=value}:function(){this.scrollTo(value,this.scrollY)})},position:function(){if(!this.length)return
var elem=this[0],offsetParent=this.offsetParent(),offset=this.offset(),parentOffset=rootNodeRE.test(offsetParent[0].nodeName)?{top:0,left:0}:offsetParent.offset()
offset.top-=parseFloat($(elem).css('margin-top'))||0
offset.left-=parseFloat($(elem).css('margin-left'))||0
parentOffset.top+=parseFloat($(offsetParent[0]).css('border-top-width'))||0
parentOffset.left+=parseFloat($(offsetParent[0]).css('border-left-width'))||0
return{top:offset.top-parentOffset.top,left:offset.left-parentOffset.left}},offsetParent:function(){return this.map(function(){var parent=this.offsetParent||document.body
while(parent&&!rootNodeRE.test(parent.nodeName)&&$(parent).css("position")=="static")
parent=parent.offsetParent
return parent})}}
$.fn.detach=$.fn.remove
;['width','height'].forEach(function(dimension){var dimensionProperty=dimension.replace(/./,function(m){return m[0].toUpperCase()})
$.fn[dimension]=function(value){var offset,el=this[0]
if(value===undefined)return isWindow(el)?el['inner'+dimensionProperty]:isDocument(el)?el.documentElement['scroll'+dimensionProperty]:(offset=this.offset())&&offset[dimension]
else return this.each(function(idx){el=$(this)
el.css(dimension,funcArg(this,value,idx,el[dimension]()))})}})
function traverseNode(node,fun){fun(node)
for(var i=0,len=node.childNodes.length;i<len;i++)
traverseNode(node.childNodes[i],fun)}
adjacencyOperators.forEach(function(operator,operatorIndex){var inside=operatorIndex%2
$.fn[operator]=function(){var argType,nodes=$.map(arguments,function(arg){argType=type(arg)
return argType=="object"||argType=="array"||arg==null?arg:zepto.fragment(arg)}),parent,copyByClone=this.length>1
if(nodes.length<1)return this
return this.each(function(_,target){parent=inside?target:target.parentNode
target=operatorIndex==0?target.nextSibling:operatorIndex==1?target.firstChild:operatorIndex==2?target:null
var parentInDocument=$.contains(document.documentElement,parent)
nodes.forEach(function(node){if(copyByClone)node=node.cloneNode(true)
else if(!parent)return $(node).remove()
parent.insertBefore(node,target)
if(parentInDocument)traverseNode(node,function(el){if(el.nodeName!=null&&el.nodeName.toUpperCase()==='SCRIPT'&&(!el.type||el.type==='text/javascript')&&!el.src)
window['eval'].call(window,el.innerHTML)})})})}
$.fn[inside?operator+'To':'insert'+(operatorIndex?'Before':'After')]=function(html){$(html)[operator](this)
return this}})
zepto.Z.prototype=$.fn
zepto.uniq=uniq
zepto.deserializeValue=deserializeValue
$.zepto=zepto
return $})()
window.Zepto=Zepto
window.$===undefined&&(window.$=Zepto);(function($){var jsonpID=0,document=window.document,key,name,rscript=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,scriptTypeRE=/^(?:text|application)\/javascript/i,xmlTypeRE=/^(?:text|application)\/xml/i,jsonType='application/json',htmlType='text/html',blankRE=/^\s*$/,originAnchor=document.createElement('a')
originAnchor.href=window.location.href
function triggerAndReturn(context,eventName,data){var event=$.Event(eventName)
$(context).trigger(event,data)
return!event.isDefaultPrevented()}
function triggerGlobal(settings,context,eventName,data){if(settings.global)return triggerAndReturn(context||document,eventName,data)}
$.active=0
function ajaxStart(settings){if(settings.global&&$.active++===0)triggerGlobal(settings,null,'ajaxStart')}
function ajaxStop(settings){if(settings.global&&!(--$.active))triggerGlobal(settings,null,'ajaxStop')}
function ajaxBeforeSend(xhr,settings){var context=settings.context
if(settings.beforeSend.call(context,xhr,settings)===false||triggerGlobal(settings,context,'ajaxBeforeSend',[xhr,settings])===false)
return false
triggerGlobal(settings,context,'ajaxSend',[xhr,settings])}
function ajaxSuccess(data,xhr,settings,deferred){var context=settings.context,status='success'
settings.success.call(context,data,status,xhr)
if(deferred)deferred.resolveWith(context,[data,status,xhr])
triggerGlobal(settings,context,'ajaxSuccess',[xhr,settings,data])
ajaxComplete(status,xhr,settings)}
function ajaxError(error,type,xhr,settings,deferred){var context=settings.context
settings.error.call(context,xhr,type,error)
if(deferred)deferred.rejectWith(context,[xhr,type,error])
triggerGlobal(settings,context,'ajaxError',[xhr,settings,error||type])
ajaxComplete(type,xhr,settings)}
function ajaxComplete(status,xhr,settings){var context=settings.context
settings.complete.call(context,xhr,status)
triggerGlobal(settings,context,'ajaxComplete',[xhr,settings])
ajaxStop(settings)}
function empty(){}
$.ajaxJSONP=function(options,deferred){if(!('type'in options))return $.ajax(options)
var _callbackName=options.jsonpCallback,callbackName=($.isFunction(_callbackName)?_callbackName():_callbackName)||('jsonp'+(++jsonpID)),script=document.createElement('script'),originalCallback=window[callbackName],responseData,abort=function(errorType){$(script).triggerHandler('error',errorType||'abort')},xhr={abort:abort},abortTimeout
if(deferred)deferred.promise(xhr)
$(script).on('load error',function(e,errorType){clearTimeout(abortTimeout)
$(script).off().remove()
if(e.type=='error'||!responseData){ajaxError(null,errorType||'error',xhr,options,deferred)}else{ajaxSuccess(responseData[0],xhr,options,deferred)}
window[callbackName]=originalCallback
if(responseData&&$.isFunction(originalCallback))
originalCallback(responseData[0])
originalCallback=responseData=undefined})
if(ajaxBeforeSend(xhr,options)===false){abort('abort')
return xhr}
window[callbackName]=function(){responseData=arguments}
script.src=options.url.replace(/\?(.+)=\?/,'?$1='+callbackName)
document.head.appendChild(script)
if(options.timeout>0)abortTimeout=setTimeout(function(){abort('timeout')},options.timeout)
return xhr}
$.ajaxSettings={type:'GET',beforeSend:empty,success:empty,error:empty,complete:empty,context:null,global:true,xhr:function(){return new window.XMLHttpRequest()},accepts:{script:'text/javascript, application/javascript, application/x-javascript',json:jsonType,xml:'application/xml, text/xml',html:htmlType,text:'text/plain'},crossDomain:false,timeout:0,processData:true,cache:true}
function mimeToDataType(mime){if(mime)mime=mime.split(';',2)[0]
return mime&&(mime==htmlType?'html':mime==jsonType?'json':scriptTypeRE.test(mime)?'script':xmlTypeRE.test(mime)&&'xml')||'text'}
function appendQuery(url,query){if(query=='')return url
return(url+'&'+query).replace(/[&?]{1,2}/,'?')}
function serializeData(options){if(options.processData&&options.data&&$.type(options.data)!="string")
options.data=$.param(options.data,options.traditional)
if(options.data&&(!options.type||options.type.toUpperCase()=='GET'))
options.url=appendQuery(options.url,options.data),options.data=undefined}
$.ajax=function(options){var settings=$.extend({},options||{}),deferred=$.Deferred&&$.Deferred(),urlAnchor
for(key in $.ajaxSettings)if(settings[key]===undefined)settings[key]=$.ajaxSettings[key]
ajaxStart(settings)
if(!settings.crossDomain){urlAnchor=document.createElement('a')
urlAnchor.href=settings.url
urlAnchor.href=urlAnchor.href
settings.crossDomain=(originAnchor.protocol+'//'+originAnchor.host)!==(urlAnchor.protocol+'//'+urlAnchor.host)}
if(!settings.url)settings.url=window.location.toString()
serializeData(settings)
var dataType=settings.dataType,hasPlaceholder=/\?.+=\?/.test(settings.url)
if(hasPlaceholder)dataType='jsonp'
if(settings.cache===false||((!options||options.cache!==true)&&('script'==dataType||'jsonp'==dataType)))
settings.url=appendQuery(settings.url,'_='+Date.now())
if('jsonp'==dataType){if(!hasPlaceholder)
settings.url=appendQuery(settings.url,settings.jsonp?(settings.jsonp+'=?'):settings.jsonp===false?'':'callback=?')
return $.ajaxJSONP(settings,deferred)}
var mime=settings.accepts[dataType],headers={},setHeader=function(name,value){headers[name.toLowerCase()]=[name,value]},protocol=/^([\w-]+:)\/\//.test(settings.url)?RegExp.$1:window.location.protocol,xhr=settings.xhr(),nativeSetHeader=xhr.setRequestHeader,abortTimeout
if(deferred)deferred.promise(xhr)
if(!settings.crossDomain)setHeader('X-Requested-With','XMLHttpRequest')
setHeader('Accept',mime||'*/*')
if(mime=settings.mimeType||mime){if(mime.indexOf(',')>-1)mime=mime.split(',',2)[0]
xhr.overrideMimeType&&xhr.overrideMimeType(mime)}
if(settings.contentType||(settings.contentType!==false&&settings.data&&settings.type.toUpperCase()!='GET'))
setHeader('Content-Type',settings.contentType||'application/x-www-form-urlencoded')
if(settings.headers)for(name in settings.headers)setHeader(name,settings.headers[name])
xhr.setRequestHeader=setHeader
xhr.onreadystatechange=function(){if(xhr.readyState==4){xhr.onreadystatechange=empty
clearTimeout(abortTimeout)
var result,error=false
if((xhr.status>=200&&xhr.status<300)||xhr.status==304||(xhr.status==0&&protocol=='file:')){dataType=dataType||mimeToDataType(settings.mimeType||xhr.getResponseHeader('content-type'))
result=xhr.responseText
try{if(dataType=='script')(1,eval)(result)
else if(dataType=='xml')result=xhr.responseXML
else if(dataType=='json')result=blankRE.test(result)?null:$.parseJSON(result)}catch(e){error=e}
if(error)ajaxError(error,'parsererror',xhr,settings,deferred)
else ajaxSuccess(result,xhr,settings,deferred)}else{ajaxError(xhr.statusText||null,xhr.status?'error':'abort',xhr,settings,deferred)}}}
if(ajaxBeforeSend(xhr,settings)===false){xhr.abort()
ajaxError(null,'abort',xhr,settings,deferred)
return xhr}
if(settings.xhrFields)for(name in settings.xhrFields)xhr[name]=settings.xhrFields[name]
var async='async'in settings?settings.async:true
xhr.open(settings.type,settings.url,async,settings.username,settings.password)
for(name in headers)nativeSetHeader.apply(xhr,headers[name])
if(settings.timeout>0)abortTimeout=setTimeout(function(){xhr.onreadystatechange=empty
xhr.abort()
ajaxError(null,'timeout',xhr,settings,deferred)},settings.timeout)
xhr.send(settings.data?settings.data:null)
return xhr}
function parseArguments(url,data,success,dataType){if($.isFunction(data))dataType=success,success=data,data=undefined
if(!$.isFunction(success))dataType=success,success=undefined
return{url:url,data:data,success:success,dataType:dataType}}
$.get=function(){return $.ajax(parseArguments.apply(null,arguments))}
$.post=function(){var options=parseArguments.apply(null,arguments)
options.type='POST'
return $.ajax(options)}
$.getJSON=function(){var options=parseArguments.apply(null,arguments)
options.dataType='json'
return $.ajax(options)}
$.fn.load=function(url,data,success){if(!this.length)return this
var self=this,parts=url.split(/\s/),selector,options=parseArguments(url,data,success),callback=options.success
if(parts.length>1)options.url=parts[0],selector=parts[1]
options.success=function(response){self.html(selector?$('<div>').html(response.replace(rscript,"")).find(selector):response)
callback&&callback.apply(self,arguments)}
$.ajax(options)
return this}
var escape=encodeURIComponent
function serialize(params,obj,traditional,scope){var type,array=$.isArray(obj),hash=$.isPlainObject(obj)
$.each(obj,function(key,value){type=$.type(value)
if(scope)key=traditional?scope:scope+'['+(hash||type=='object'||type=='array'?key:'')+']'
if(!scope&&array)params.add(value.name,value.value)
else if(type=="array"||(!traditional&&type=="object"))
serialize(params,value,traditional,key)
else params.add(key,value)})}
$.param=function(obj,traditional){var params=[]
params.add=function(key,value){if($.isFunction(value))value=value()
if(value==null)value=""
this.push(escape(key)+'='+escape(value))}
serialize(params,obj,traditional)
return params.join('&').replace(/%20/g,'+')}})(Zepto);(function($){$.Callbacks=function(options){options=$.extend({},options)
var memory,fired,firing,firingStart,firingLength,firingIndex,list=[],stack=!options.once&&[],fire=function(data){memory=options.memory&&data
fired=true
firingIndex=firingStart||0
firingStart=0
firingLength=list.length
firing=true
for(;list&&firingIndex<firingLength;++firingIndex){if(list[firingIndex].apply(data[0],data[1])===false&&options.stopOnFalse){memory=false
break}}
firing=false
if(list){if(stack)stack.length&&fire(stack.shift())
else if(memory)list.length=0
else Callbacks.disable()}},Callbacks={add:function(){if(list){var start=list.length,add=function(args){$.each(args,function(_,arg){if(typeof arg==="function"){if(!options.unique||!Callbacks.has(arg))list.push(arg)}
else if(arg&&arg.length&&typeof arg!=='string')add(arg)})}
add(arguments)
if(firing)firingLength=list.length
else if(memory){firingStart=start
fire(memory)}}
return this},remove:function(){if(list){$.each(arguments,function(_,arg){var index
while((index=$.inArray(arg,list,index))>-1){list.splice(index,1)
if(firing){if(index<=firingLength)--firingLength
if(index<=firingIndex)--firingIndex}}})}
return this},has:function(fn){return!!(list&&(fn?$.inArray(fn,list)>-1:list.length))},empty:function(){firingLength=list.length=0
return this},disable:function(){list=stack=memory=undefined
return this},disabled:function(){return!list},lock:function(){stack=undefined;if(!memory)Callbacks.disable()
return this},locked:function(){return!stack},fireWith:function(context,args){if(list&&(!fired||stack)){args=args||[]
args=[context,args.slice?args.slice():args]
if(firing)stack.push(args)
else fire(args)}
return this},fire:function(){return Callbacks.fireWith(this,arguments)},fired:function(){return!!fired}}
return Callbacks}})(Zepto);(function($){var slice=Array.prototype.slice
function Deferred(func){var tuples=[["resolve","done",$.Callbacks({once:1,memory:1}),"resolved"],["reject","fail",$.Callbacks({once:1,memory:1}),"rejected"],["notify","progress",$.Callbacks({memory:1})]],state="pending",promise={state:function(){return state},always:function(){deferred.done(arguments).fail(arguments)
return this},then:function(){var fns=arguments
return Deferred(function(defer){$.each(tuples,function(i,tuple){var fn=$.isFunction(fns[i])&&fns[i]
deferred[tuple[1]](function(){var returned=fn&&fn.apply(this,arguments)
if(returned&&$.isFunction(returned.promise)){returned.promise().done(defer.resolve).fail(defer.reject).progress(defer.notify)}else{var context=this===promise?defer.promise():this,values=fn?[returned]:arguments
defer[tuple[0]+"With"](context,values)}})})
fns=null}).promise()},promise:function(obj){return obj!=null?$.extend(obj,promise):promise}},deferred={}
$.each(tuples,function(i,tuple){var list=tuple[2],stateString=tuple[3]
promise[tuple[1]]=list.add
if(stateString){list.add(function(){state=stateString},tuples[i^1][2].disable,tuples[2][2].lock)}
deferred[tuple[0]]=function(){deferred[tuple[0]+"With"](this===deferred?promise:this,arguments)
return this}
deferred[tuple[0]+"With"]=list.fireWith})
promise.promise(deferred)
if(func)func.call(deferred,deferred)
return deferred}
$.when=function(sub){var resolveValues=slice.call(arguments),len=resolveValues.length,i=0,remain=len!==1||(sub&&$.isFunction(sub.promise))?len:0,deferred=remain===1?sub:Deferred(),progressValues,progressContexts,resolveContexts,updateFn=function(i,ctx,val){return function(value){ctx[i]=this
val[i]=arguments.length>1?slice.call(arguments):value
if(val===progressValues){deferred.notifyWith(ctx,val)}else if(!(--remain)){deferred.resolveWith(ctx,val)}}}
if(len>1){progressValues=new Array(len)
progressContexts=new Array(len)
resolveContexts=new Array(len)
for(;i<len;++i){if(resolveValues[i]&&$.isFunction(resolveValues[i].promise)){resolveValues[i].promise().done(updateFn(i,resolveContexts,resolveValues)).fail(deferred.reject).progress(updateFn(i,progressContexts,progressValues))}else{--remain}}}
if(!remain)deferred.resolveWith(resolveContexts,resolveValues)
return deferred.promise()}
$.Deferred=Deferred})(Zepto);(function($){var _zid=1,undefined,slice=Array.prototype.slice,isFunction=$.isFunction,isString=function(obj){return typeof obj=='string'},handlers={},specialEvents={},focusinSupported='onfocusin'in window,focus={focus:'focusin',blur:'focusout'},hover={mouseenter:'mouseover',mouseleave:'mouseout'}
specialEvents.click=specialEvents.mousedown=specialEvents.mouseup=specialEvents.mousemove='MouseEvents'
function zid(element){return element._zid||(element._zid=_zid++)}
function findHandlers(element,event,fn,selector){event=parse(event)
if(event.ns)var matcher=matcherFor(event.ns)
return(handlers[zid(element)]||[]).filter(function(handler){return handler&&(!event.e||handler.e==event.e)&&(!event.ns||matcher.test(handler.ns))&&(!fn||zid(handler.fn)===zid(fn))&&(!selector||handler.sel==selector)})}
function parse(event){var parts=(''+event).split('.')
return{e:parts[0],ns:parts.slice(1).sort().join(' ')}}
function matcherFor(ns){return new RegExp('(?:^| )'+ns.replace(' ',' .* ?')+'(?: |$)')}
function eventCapture(handler,captureSetting){return handler.del&&(!focusinSupported&&(handler.e in focus))||!!captureSetting}
function realEvent(type){return hover[type]||(focusinSupported&&focus[type])||type}
function add(element,events,fn,data,selector,delegator,capture){var id=zid(element),set=(handlers[id]||(handlers[id]=[]))
events.split(/\s/).forEach(function(event){if(event=='ready')return $(document).ready(fn)
var handler=parse(event)
handler.fn=fn
handler.sel=selector
if(handler.e in hover)fn=function(e){var related=e.relatedTarget
if(!related||(related!==this&&!$.contains(this,related)))
return handler.fn.apply(this,arguments)}
handler.del=delegator
var callback=delegator||fn
handler.proxy=function(e){e=compatible(e)
if(e.isImmediatePropagationStopped())return
e.data=data
var result=callback.apply(element,e._args==undefined?[e]:[e].concat(e._args))
if(result===false)e.preventDefault(),e.stopPropagation()
return result}
handler.i=set.length
set.push(handler)
if('addEventListener'in element)
element.addEventListener(realEvent(handler.e),handler.proxy,eventCapture(handler,capture))})}
function remove(element,events,fn,selector,capture){var id=zid(element);(events||'').split(/\s/).forEach(function(event){findHandlers(element,event,fn,selector).forEach(function(handler){delete handlers[id][handler.i]
if('removeEventListener'in element)
element.removeEventListener(realEvent(handler.e),handler.proxy,eventCapture(handler,capture))})})}
$.event={add:add,remove:remove}
$.proxy=function(fn,context){var args=(2 in arguments)&&slice.call(arguments,2)
if(isFunction(fn)){var proxyFn=function(){return fn.apply(context,args?args.concat(slice.call(arguments)):arguments)}
proxyFn._zid=zid(fn)
return proxyFn}else if(isString(context)){if(args){args.unshift(fn[context],fn)
return $.proxy.apply(null,args)}else{return $.proxy(fn[context],fn)}}else{throw new TypeError("expected function")}}
$.fn.bind=function(event,data,callback){return this.on(event,data,callback)}
$.fn.unbind=function(event,callback){return this.off(event,callback)}
$.fn.one=function(event,selector,data,callback){return this.on(event,selector,data,callback,1)}
var returnTrue=function(){return true},returnFalse=function(){return false},ignoreProperties=/^([A-Z]|returnValue$|layer[XY]$)/,eventMethods={preventDefault:'isDefaultPrevented',stopImmediatePropagation:'isImmediatePropagationStopped',stopPropagation:'isPropagationStopped'}
function compatible(event,source){if(source||!event.isDefaultPrevented){source||(source=event)
$.each(eventMethods,function(name,predicate){var sourceMethod=source[name]
event[name]=function(){this[predicate]=returnTrue
return sourceMethod&&sourceMethod.apply(source,arguments)}
event[predicate]=returnFalse})
if(source.defaultPrevented!==undefined?source.defaultPrevented:'returnValue'in source?source.returnValue===false:source.getPreventDefault&&source.getPreventDefault())
event.isDefaultPrevented=returnTrue}
return event}
function createProxy(event){var key,proxy={originalEvent:event}
for(key in event)
if(!ignoreProperties.test(key)&&event[key]!==undefined)proxy[key]=event[key]
return compatible(proxy,event)}
$.fn.delegate=function(selector,event,callback){return this.on(event,selector,callback)}
$.fn.undelegate=function(selector,event,callback){return this.off(event,selector,callback)}
$.fn.live=function(event,callback){$(document.body).delegate(this.selector,event,callback)
return this}
$.fn.die=function(event,callback){$(document.body).undelegate(this.selector,event,callback)
return this}
$.fn.on=function(event,selector,data,callback,one){var autoRemove,delegator,$this=this
if(event&&!isString(event)){$.each(event,function(type,fn){$this.on(type,selector,data,fn,one)})
return $this}
if(!isString(selector)&&!isFunction(callback)&&callback!==false)
callback=data,data=selector,selector=undefined
if(isFunction(data)||data===false)
callback=data,data=undefined
if(callback===false)callback=returnFalse
return $this.each(function(_,element){if(one)autoRemove=function(e){remove(element,e.type,callback)
return callback.apply(this,arguments)}
if(selector)delegator=function(e){var evt,match=$(e.target).closest(selector,element).get(0)
if(match&&match!==element){evt=$.extend(createProxy(e),{currentTarget:match,liveFired:element})
return(autoRemove||callback).apply(match,[evt].concat(slice.call(arguments,1)))}}
add(element,event,callback,data,selector,delegator||autoRemove)})}
$.fn.off=function(event,selector,callback){var $this=this
if(event&&!isString(event)){$.each(event,function(type,fn){$this.off(type,selector,fn)})
return $this}
if(!isString(selector)&&!isFunction(callback)&&callback!==false)
callback=selector,selector=undefined
if(callback===false)callback=returnFalse
return $this.each(function(){remove(this,event,callback,selector)})}
$.fn.trigger=function(event,args){event=(isString(event)||$.isPlainObject(event))?$.Event(event):compatible(event)
event._args=args
return this.each(function(){if(event.type in focus&&typeof this[event.type]=="function")this[event.type]()
else if('dispatchEvent'in this)this.dispatchEvent(event)
else $(this).triggerHandler(event,args)})}
$.fn.triggerHandler=function(event,args){var e,result
this.each(function(i,element){e=createProxy(isString(event)?$.Event(event):event)
e._args=args
e.target=element
$.each(findHandlers(element,event.type||event),function(i,handler){result=handler.proxy(e)
if(e.isImmediatePropagationStopped())return false})})
return result}
;('focusin focusout focus blur load resize scroll unload click dblclick '+
'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
'change select keydown keypress keyup error').split(' ').forEach(function(event){$.fn[event]=function(callback){return(0 in arguments)?this.bind(event,callback):this.trigger(event)}})
$.Event=function(type,props){if(!isString(type))props=type,type=props.type
var event=document.createEvent(specialEvents[type]||'Events'),bubbles=true
if(props)for(var name in props)(name=='bubbles')?(bubbles=!!props[name]):(event[name]=props[name])
event.initEvent(type,bubbles,true)
return compatible(event)}})(Zepto)
;(function(window,undefined){'use strict';var riot={version:'v2.3.13',settings:{}},__uid=0,__virtualDom=[],__tagImpl={},RIOT_PREFIX='riot-',RIOT_TAG=RIOT_PREFIX+'tag',T_STRING='string',T_OBJECT='object',T_UNDEF='undefined',T_FUNCTION='function',SPECIAL_TAGS_REGEX=/^(?:opt(ion|group)|tbody|col|t[rhd])$/,RESERVED_WORDS_BLACKLIST=['_item','_id','_parent','update','root','mount','unmount','mixin','isMounted','isLoop','tags','parent','opts','trigger','on','off','one'],IE_VERSION=(window&&window.document||{}).documentMode|0
riot.observable=function(el){el=el||{}
var callbacks={},slice=Array.prototype.slice,onEachEvent=function(e,fn){e.replace(/\S+/g,fn)},defineProperty=function(key,value){Object.defineProperty(el,key,{value:value,enumerable:false,writable:false,configurable:false})}
defineProperty('on',function(events,fn){if(typeof fn!='function')return el
onEachEvent(events,function(name,pos){(callbacks[name]=callbacks[name]||[]).push(fn)
fn.typed=pos>0})
return el})
defineProperty('off',function(events,fn){if(events=='*'&&!fn)callbacks={}
else{onEachEvent(events,function(name){if(fn){var arr=callbacks[name]
for(var i=0,cb;cb=arr&&arr[i];++i){if(cb==fn)arr.splice(i--,1)}}else delete callbacks[name]})}
return el})
defineProperty('one',function(events,fn){function on(){el.off(events,on)
fn.apply(el,arguments)}
return el.on(events,on)})
defineProperty('trigger',function(events){var args=slice.call(arguments,1),fns
onEachEvent(events,function(name){fns=slice.call(callbacks[name]||[],0)
for(var i=0,fn;fn=fns[i];++i){if(fn.busy)return
fn.busy=1
fn.apply(el,fn.typed?[name].concat(args):args)
if(fns[i]!==fn){i--}
fn.busy=0}
if(callbacks['*']&&name!='*')
el.trigger.apply(el,['*',name].concat(args))})
return el})
return el}
;(function(riot){var RE_ORIGIN=/^.+?\/+[^\/]+/,EVENT_LISTENER='EventListener',REMOVE_EVENT_LISTENER='remove'+EVENT_LISTENER,ADD_EVENT_LISTENER='add'+EVENT_LISTENER,HAS_ATTRIBUTE='hasAttribute',REPLACE='replace',POPSTATE='popstate',HASHCHANGE='hashchange',TRIGGER='trigger',MAX_EMIT_STACK_LEVEL=3,win=typeof window!='undefined'&&window,doc=typeof document!='undefined'&&document,hist=win&&history,loc=win&&(hist.location||win.location),prot=Router.prototype,clickEvent=doc&&doc.ontouchstart?'touchstart':'click',started=false,central=riot.observable(),routeFound=false,debouncedEmit,base,current,parser,secondParser,emitStack=[],emitStackLevel=0
function DEFAULT_PARSER(path){return path.split(/[/?#]/)}
function DEFAULT_SECOND_PARSER(path,filter){var re=new RegExp('^'+filter[REPLACE](/\*/g,'([^/?#]+?)')[REPLACE](/\.\./,'.*')+'$'),args=path.match(re)
if(args)return args.slice(1)}
function debounce(fn,delay){var t
return function(){clearTimeout(t)
t=setTimeout(fn,delay)}}
function start(autoExec){debouncedEmit=debounce(emit,1)
win[ADD_EVENT_LISTENER](POPSTATE,debouncedEmit)
win[ADD_EVENT_LISTENER](HASHCHANGE,debouncedEmit)
doc[ADD_EVENT_LISTENER](clickEvent,click)
if(autoExec)emit(true)}
function Router(){this.$=[]
riot.observable(this)
central.on('stop',this.s.bind(this))
central.on('emit',this.e.bind(this))}
function normalize(path){return path[REPLACE](/^\/|\/$/,'')}
function isString(str){return typeof str=='string'}
function getPathFromRoot(href){return(href||loc.href||'')[REPLACE](RE_ORIGIN,'')}
function getPathFromBase(href){return base[0]=='#'?(href||loc.href||'').split(base)[1]||'':getPathFromRoot(href)[REPLACE](base,'')}
function emit(force){var isRoot=emitStackLevel==0
if(MAX_EMIT_STACK_LEVEL<=emitStackLevel)return
emitStackLevel++
emitStack.push(function(){var path=getPathFromBase()
if(force||path!=current){central[TRIGGER]('emit',path)
current=path}})
if(isRoot){while(emitStack.length){emitStack[0]()
emitStack.shift()}
emitStackLevel=0}}
function click(e){if(e.which!=1||e.metaKey||e.ctrlKey||e.shiftKey||e.defaultPrevented)return
var el=e.target
while(el&&el.nodeName!='A')el=el.parentNode
if(!el||el.nodeName!='A'||el[HAS_ATTRIBUTE]('download')||!el[HAS_ATTRIBUTE]('href')||el.target&&el.target!='_self'||el.href.indexOf(loc.href.match(RE_ORIGIN)[0])==-1)return
if(el.href!=loc.href){if(el.href.split('#')[0]==loc.href.split('#')[0]||base!='#'&&getPathFromRoot(el.href).indexOf(base)!==0||!go(getPathFromBase(el.href),el.title||doc.title))return}
e.preventDefault()}
function go(path,title,shouldReplace){if(hist){path=base+normalize(path)
title=title||doc.title
shouldReplace?hist.replaceState(null,title,path):hist.pushState(null,title,path)
doc.title=title
routeFound=false
emit()
return routeFound}
return central[TRIGGER]('emit',getPathFromBase(path))}
prot.m=function(first,second,third){if(isString(first)&&(!second||isString(second)))go(first,second,third||false)
else if(second)this.r(first,second)
else this.r('@',first)}
prot.s=function(){this.off('*')
this.$=[]}
prot.e=function(path){this.$.concat('@').some(function(filter){var args=(filter=='@'?parser:secondParser)(normalize(path),normalize(filter))
if(typeof args!='undefined'){this[TRIGGER].apply(null,[filter].concat(args))
return routeFound=true}},this)}
prot.r=function(filter,action){if(filter!='@'){filter='/'+normalize(filter)
this.$.push(filter)}
this.on(filter,action)}
var mainRouter=new Router()
var route=mainRouter.m.bind(mainRouter)
route.create=function(){var newSubRouter=new Router()
newSubRouter.m.stop=newSubRouter.s.bind(newSubRouter)
return newSubRouter.m.bind(newSubRouter)}
route.base=function(arg){base=arg||'#'
current=getPathFromBase()}
route.exec=function(){emit(true)}
route.parser=function(fn,fn2){if(!fn&&!fn2){parser=DEFAULT_PARSER
secondParser=DEFAULT_SECOND_PARSER}
if(fn)parser=fn
if(fn2)secondParser=fn2}
route.query=function(){var q={}
var href=loc.href||current
href[REPLACE](/[?&](.+?)=([^&]*)/g,function(_,k,v){q[k]=v})
return q}
route.stop=function(){if(started){if(win){win[REMOVE_EVENT_LISTENER](POPSTATE,debouncedEmit)
win[REMOVE_EVENT_LISTENER](HASHCHANGE,debouncedEmit)
doc[REMOVE_EVENT_LISTENER](clickEvent,click)}
central[TRIGGER]('stop')
started=false}}
route.start=function(autoExec){if(!started){if(win){if(document.readyState=='complete')start(autoExec)
else win[ADD_EVENT_LISTENER]('load',function(){setTimeout(function(){start(autoExec)},1)})}
started=true}}
route.base()
route.parser()
riot.route=route})(riot)
var brackets=(function(UNDEF){var
REGLOB='g',MLCOMMS=/\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,STRINGS=/"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g,S_QBSRC=STRINGS.source+'|'+/
(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source+'|'+/
\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,DEFAULT='{ }',FINDBRACES={'(':RegExp('([()])|'+S_QBSRC,REGLOB),'[':RegExp('([[\\]])|'+S_QBSRC,REGLOB),'{':RegExp('([{}])|'+S_QBSRC,REGLOB)}
var
cachedBrackets=UNDEF,_regex,_pairs=[]
function _loopback(re){return re}
function _rewrite(re,bp){if(!bp)bp=_pairs
return new RegExp(re.source.replace(/{/g,bp[2]).replace(/}/g,bp[3]),re.global?REGLOB:'')}
function _create(pair){var
cvt,arr=pair.split(' ')
if(pair===DEFAULT){arr[2]=arr[0]
arr[3]=arr[1]
cvt=_loopback}
else{if(arr.length!==2||/[\x00-\x1F<>a-zA-Z0-9'",;\\]/.test(pair)){throw new Error('Unsupported brackets "'+pair+'"')}
arr=arr.concat(pair.replace(/(?=[[\]()*+?.^$|])/g,'\\').split(' '))
cvt=_rewrite}
arr[4]=cvt(arr[1].length>1?/{[\S\s]*?}/:/{[^}]*}/,arr)
arr[5]=cvt(/\\({|})/g,arr)
arr[6]=cvt(/(\\?)({)/g,arr)
arr[7]=RegExp('(\\\\?)(?:([[({])|('+arr[3]+'))|'+S_QBSRC,REGLOB)
arr[8]=pair
return arr}
function _reset(pair){if(!pair)pair=DEFAULT
if(pair!==_pairs[8]){_pairs=_create(pair)
_regex=pair===DEFAULT?_loopback:_rewrite
_pairs[9]=_regex(/^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/)
_pairs[10]=_regex(/(^|[^\\]){=[\S\s]*?}/)
_brackets._rawOffset=_pairs[0].length}
cachedBrackets=pair}
function _brackets(reOrIdx){return reOrIdx instanceof RegExp?_regex(reOrIdx):_pairs[reOrIdx]}
_brackets.split=function split(str,tmpl,_bp){if(!_bp)_bp=_pairs
var
parts=[],match,isexpr,start,pos,re=_bp[6]
isexpr=start=re.lastIndex=0
while(match=re.exec(str)){pos=match.index
if(isexpr){if(match[2]){re.lastIndex=skipBraces(match[2],re.lastIndex)
continue}
if(!match[3])
continue}
if(!match[1]){unescapeStr(str.slice(start,pos))
start=re.lastIndex
re=_bp[6+(isexpr^=1)]
re.lastIndex=start}}
if(str&&start<str.length){unescapeStr(str.slice(start))}
return parts
function unescapeStr(str){if(tmpl||isexpr)
parts.push(str&&str.replace(_bp[5],'$1'))
else
parts.push(str)}
function skipBraces(ch,pos){var
match,recch=FINDBRACES[ch],level=1
recch.lastIndex=pos
while(match=recch.exec(str)){if(match[1]&&!(match[1]===ch?++level:--level))break}
return match?recch.lastIndex:str.length}}
_brackets.hasExpr=function hasExpr(str){return _brackets(4).test(str)}
_brackets.loopKeys=function loopKeys(expr){var m=expr.match(_brackets(9))
return m?{key:m[1],pos:m[2],val:_pairs[0]+m[3].trim()+_pairs[1]}:{val:expr.trim()}}
_brackets.array=function array(pair){return _create(pair||cachedBrackets)}
var _settings
function _setSettings(o){var b
o=o||{}
b=o.brackets
Object.defineProperty(o,'brackets',{set:_reset,get:function(){return cachedBrackets},enumerable:true})
_settings=o
_reset(b)}
Object.defineProperty(_brackets,'settings',{set:_setSettings,get:function(){return _settings}})
_brackets.settings=typeof riot!=='undefined'&&riot.settings||{}
_brackets.set=_reset
_brackets.R_STRINGS=STRINGS
_brackets.R_MLCOMMS=MLCOMMS
_brackets.S_QBLOCKS=S_QBSRC
return _brackets})()
var tmpl=(function(){var _cache={}
function _tmpl(str,data){if(!str)return str
return(_cache[str]||(_cache[str]=_create(str))).call(data,_logErr)}
_tmpl.isRaw=function(expr){return expr[brackets._rawOffset]==='='}
_tmpl.haveRaw=function(src){return brackets(10).test(src)}
_tmpl.hasExpr=brackets.hasExpr
_tmpl.loopKeys=brackets.loopKeys
_tmpl.errorHandler=null
function _logErr(err,ctx){if(_tmpl.errorHandler){err.riotData={tagName:ctx&&ctx.root&&ctx.root.tagName,_riot_id:ctx&&ctx._riot_id}
_tmpl.errorHandler(err)}}
function _create(str){var expr=_getTmpl(str)
if(expr.slice(0,11)!=='try{return ')expr='return '+expr
return new Function('E',expr+';')}
var
RE_QBLOCK=RegExp(brackets.S_QBLOCKS,'g'),RE_QBMARK=/\x01(\d+)~/g
function _getTmpl(str){var
qstr=[],expr,parts=brackets.split(str.replace(/\u2057/g,'"'),1)
if(parts.length>2||parts[0]){var i,j,list=[]
for(i=j=0;i<parts.length;++i){expr=parts[i]
if(expr&&(expr=i&1?_parseExpr(expr,1,qstr):'"'+expr.replace(/\\/g,'\\\\').replace(/\r\n?|\n/g,'\\n').replace(/"/g,'\\"')+
'"'))list[j++]=expr}
expr=j<2?list[0]:'['+list.join(',')+'].join("")'}
else{expr=_parseExpr(parts[1],0,qstr)}
if(qstr[0])
expr=expr.replace(RE_QBMARK,function(_,pos){return qstr[pos].replace(/\r/g,'\\r').replace(/\n/g,'\\n')})
return expr}
var
CS_IDENT=/^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\x01(\d+)~):/
function _parseExpr(expr,asText,qstr){if(expr[0]==='=')expr=expr.slice(1)
expr=expr.replace(RE_QBLOCK,function(s,div){return s.length>2&&!div?'\x01'+(qstr.push(s)-1)+'~':s}).replace(/\s+/g,' ').trim().replace(/\ ?([[\({},?\.:])\ ?/g,'$1')
if(expr){var
list=[],cnt=0,match
while(expr&&(match=expr.match(CS_IDENT))&&!match.index){var
key,jsb,re=/,|([[{(])|$/g
expr=RegExp.rightContext
key=match[2]?qstr[match[2]].slice(1,-1).trim().replace(/\s+/g,' '):match[1]
while(jsb=(match=re.exec(expr))[1])skipBraces(jsb,re)
jsb=expr.slice(0,match.index)
expr=RegExp.rightContext
list[cnt++]=_wrapExpr(jsb,1,key)}
expr=!cnt?_wrapExpr(expr,asText):cnt>1?'['+list.join(',')+'].join(" ").trim()':list[0]}
return expr
function skipBraces(jsb,re){var
match,lv=1,ir=jsb==='('?/[()]/g:jsb==='['?/[[\]]/g:/[{}]/g
ir.lastIndex=re.lastIndex
while(match=ir.exec(expr)){if(match[0]===jsb)++lv
else if(!--lv)break}
re.lastIndex=lv?expr.length:ir.lastIndex}}
var
JS_CONTEXT='"in this?this:'+(typeof window!=='object'?'global':'window')+').',JS_VARNAME=/[,{][$\w]+:|(^ *|[^$\w\.])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,JS_NOPROPS=/^(?=(\.[$\w]+))\1(?:[^.[(]|$)/
function _wrapExpr(expr,asText,key){var tb
expr=expr.replace(JS_VARNAME,function(match,p,mvar,pos,s){if(mvar){pos=tb?0:pos+match.length
if(mvar!=='this'&&mvar!=='global'&&mvar!=='window'){match=p+'("'+mvar+JS_CONTEXT+mvar
if(pos)tb=(s=s[pos])==='.'||s==='('||s==='['}
else if(pos){tb=!JS_NOPROPS.test(s.slice(pos))}}
return match})
if(tb){expr='try{return '+expr+'}catch(e){E(e,this)}'}
if(key){expr=(tb?'function(){'+expr+'}.call(this)':'('+expr+')')+'?"'+key+'":""'}
else if(asText){expr='function(v){'+(tb?expr.replace('return ','v='):'v=('+expr+')')+';return v||v===0?v:""}.call(this)'}
return expr}
_tmpl.parse=function(s){return s}
return _tmpl})()
tmpl.version=brackets.version='v2.3.20'
var mkdom=(function(checkIE){var rootEls={tr:'tbody',th:'tr',td:'tr',tbody:'table',col:'colgroup'},reToSrc=/<yield\s+to=(['"])?@\1\s*>([\S\s]+?)<\/yield\s*>/.source,GENERIC='div'
checkIE=checkIE&&checkIE<10
function _mkdom(templ,html){var match=templ&&templ.match(/^\s*<([-\w]+)/),tagName=match&&match[1].toLowerCase(),rootTag=rootEls[tagName]||GENERIC,el=mkEl(rootTag)
el.stub=true
if(html)templ=replaceYield(templ,html)
if(checkIE&&tagName&&(match=tagName.match(SPECIAL_TAGS_REGEX)))
ie9elem(el,templ,tagName,!!match[1])
else
el.innerHTML=templ
return el}
function ie9elem(el,html,tagName,select){var div=mkEl(GENERIC),tag=select?'select>':'table>',child
div.innerHTML='<'+tag+html+'</'+tag
child=$(tagName,div)
if(child)
el.appendChild(child)}
function replaceYield(templ,html){if(!/<yield\b/i.test(templ))return templ
var n=0
templ=templ.replace(/<yield\s+from=['"]([-\w]+)['"]\s*(?:\/>|>\s*<\/yield\s*>)/ig,function(str,ref){var m=html.match(RegExp(reToSrc.replace('@',ref),'i'))
++n
return m&&m[2]||''})
return n?templ:templ.replace(/<yield\s*(?:\/>|>\s*<\/yield\s*>)/gi,html||'')}
return _mkdom})(IE_VERSION)
function mkitem(expr,key,val){var item={}
item[expr.key]=key
if(expr.pos)item[expr.pos]=val
return item}
function unmountRedundant(items,tags){var i=tags.length,j=items.length,t
while(i>j){t=tags[--i]
tags.splice(i,1)
t.unmount()}}
function moveNestedTags(child,i){Object.keys(child.tags).forEach(function(tagName){var tag=child.tags[tagName]
if(isArray(tag))
each(tag,function(t){moveChildTag(t,tagName,i)})
else
moveChildTag(tag,tagName,i)})}
function addVirtual(tag,src,target){var el=tag._root,sib
tag._virts=[]
while(el){sib=el.nextSibling
if(target)
src.insertBefore(el,target._root)
else
src.appendChild(el)
tag._virts.push(el)
el=sib}}
function moveVirtual(tag,src,target,len){var el=tag._root,sib,i=0
for(;i<len;i++){sib=el.nextSibling
src.insertBefore(el,target._root)
el=sib}}
function _each(dom,parent,expr){remAttr(dom,'each')
var mustReorder=typeof getAttr(dom,'no-reorder')!==T_STRING||remAttr(dom,'no-reorder'),tagName=getTagName(dom),impl=__tagImpl[tagName]||{tmpl:dom.outerHTML},useRoot=SPECIAL_TAGS_REGEX.test(tagName),root=dom.parentNode,ref=document.createTextNode(''),child=getTag(dom),isOption=/option/gi.test(tagName),tags=[],oldItems=[],hasKeys,isVirtual=dom.tagName=='VIRTUAL'
expr=tmpl.loopKeys(expr)
root.insertBefore(ref,dom)
parent.one('before-mount',function(){dom.parentNode.removeChild(dom)
if(root.stub)root=parent.root}).on('update',function(){var items=tmpl(expr.val,parent),frag=document.createDocumentFragment()
if(!isArray(items)){hasKeys=items||false
items=hasKeys?Object.keys(items).map(function(key){return mkitem(expr,key,items[key])}):[]}
items.forEach(function(item,i){var _mustReorder=mustReorder&&item instanceof Object,oldPos=oldItems.indexOf(item),pos=~oldPos&&_mustReorder?oldPos:i,tag=tags[pos]
item=!hasKeys&&expr.key?mkitem(expr,item,i):item
if(!_mustReorder&&!tag||_mustReorder&&!~oldPos||!tag){tag=new Tag(impl,{parent:parent,isLoop:true,hasImpl:!!__tagImpl[tagName],root:useRoot?root:dom.cloneNode(),item:item},dom.innerHTML)
tag.mount()
if(isVirtual)tag._root=tag.root.firstChild
if(i==tags.length){if(isVirtual)
addVirtual(tag,frag)
else frag.appendChild(tag.root)}
else{if(isVirtual)
addVirtual(tag,root,tags[i])
else root.insertBefore(tag.root,tags[i].root)
oldItems.splice(i,0,item)}
tags.splice(i,0,tag)
pos=i}else tag.update(item)
if(pos!==i&&_mustReorder){if(isVirtual)
moveVirtual(tag,root,tags[i],dom.childNodes.length)
else root.insertBefore(tag.root,tags[i].root)
if(expr.pos)
tag[expr.pos]=i
tags.splice(i,0,tags.splice(pos,1)[0])
oldItems.splice(i,0,oldItems.splice(pos,1)[0])
if(!child)moveNestedTags(tag,i)}
tag._item=item
defineProperty(tag,'_parent',parent)},true)
unmountRedundant(items,tags)
if(isOption)root.appendChild(frag)
else root.insertBefore(frag,ref)
if(child)parent.tags[tagName]=tags
oldItems=items.slice()})}
var styleManager=(function(_riot){if(!window)return{ add:function(){},inject:function(){}}
var styleNode=(function(){var newNode=mkEl('style')
setAttr(newNode,'type','text/css')
var userNode=$('style[type=riot]')
if(userNode){if(userNode.id)newNode.id=userNode.id
userNode.parentNode.replaceChild(newNode,userNode)}
else document.getElementsByTagName('head')[0].appendChild(newNode)
return newNode})()
var cssTextProp=styleNode.styleSheet,stylesToInject=''
Object.defineProperty(_riot,'styleNode',{value:styleNode,writable:true})
return{ add:function(css){stylesToInject+=css},inject:function(){if(stylesToInject){if(cssTextProp)cssTextProp.cssText+=stylesToInject
else styleNode.innerHTML+=stylesToInject
stylesToInject=''}}}})(riot)
function parseNamedElements(root,tag,childTags,forceParsingNamed){walk(root,function(dom){if(dom.nodeType==1){dom.isLoop=dom.isLoop||(dom.parentNode&&dom.parentNode.isLoop||getAttr(dom,'each'))?1:0
if(childTags){var child=getTag(dom)
if(child&&!dom.isLoop)
childTags.push(initChildTag(child,{root:dom,parent:tag},dom.innerHTML,tag))}
if(!dom.isLoop||forceParsingNamed)
setNamed(dom,tag,[])}})}
function parseExpressions(root,tag,expressions){function addExpr(dom,val,extra){if(tmpl.hasExpr(val)){expressions.push(extend({dom:dom,expr:val},extra))}}
walk(root,function(dom){var type=dom.nodeType,attr
if(type==3&&dom.parentNode.tagName!='STYLE')addExpr(dom,dom.nodeValue)
if(type!=1)return 
attr=getAttr(dom,'each')
if(attr){_each(dom,tag,attr);return false}
each(dom.attributes,function(attr){var name=attr.name,bool=name.split('__')[1]
addExpr(dom,attr.value,{attr:bool||name,bool:bool})
if(bool){remAttr(dom,name);return false}})
if(getTag(dom))return false})}
function Tag(impl,conf,innerHTML){var self=riot.observable(this),opts=inherit(conf.opts)||{},parent=conf.parent,isLoop=conf.isLoop,hasImpl=conf.hasImpl,item=cleanUpData(conf.item),expressions=[],childTags=[],root=conf.root,fn=impl.fn,tagName=root.tagName.toLowerCase(),attr={},propsInSyncWithParent=[],dom
if(fn&&root._tag)root._tag.unmount(true)
this.isMounted=false
root.isLoop=isLoop
root._tag=this
defineProperty(this,'_riot_id',++__uid)
extend(this,{parent:parent,root:root,opts:opts,tags:{}},item)
each(root.attributes,function(el){var val=el.value
if(tmpl.hasExpr(val))attr[el.name]=val})
dom=mkdom(impl.tmpl,innerHTML)
function updateOpts(){var ctx=hasImpl&&isLoop?self:parent||self
each(root.attributes,function(el){var val=el.value
opts[toCamel(el.name)]=tmpl.hasExpr(val)?tmpl(val,ctx):val})
each(Object.keys(attr),function(name){opts[toCamel(name)]=tmpl(attr[name],ctx)})}
function normalizeData(data){for(var key in item){if(typeof self[key]!==T_UNDEF&&isWritable(self,key))
self[key]=data[key]}}
function inheritFromParent(){if(!self.parent||!isLoop)return
each(Object.keys(self.parent),function(k){var mustSync=!contains(RESERVED_WORDS_BLACKLIST,k)&&contains(propsInSyncWithParent,k)
if(typeof self[k]===T_UNDEF||mustSync){if(!mustSync)propsInSyncWithParent.push(k)
self[k]=self.parent[k]}})}
defineProperty(this,'update',function(data){data=cleanUpData(data)
inheritFromParent()
if(data&&typeof item===T_OBJECT){normalizeData(data)
item=data}
extend(self,data)
updateOpts()
self.trigger('update',data)
update(expressions,self)
rAF(function(){self.trigger('updated')})
return this})
defineProperty(this,'mixin',function(){each(arguments,function(mix){var instance
mix=typeof mix===T_STRING?riot.mixin(mix):mix
if(isFunction(mix)){instance=new mix()
mix=mix.prototype}else instance=mix
each(Object.getOwnPropertyNames(mix),function(key){if(key!='init')
self[key]=isFunction(instance[key])?instance[key].bind(self):instance[key]})
if(instance.init)instance.init.bind(self)()})
return this})
defineProperty(this,'mount',function(){updateOpts()
if(fn)fn.call(self,opts)
parseExpressions(dom,self,expressions)
toggle(true)
if(impl.attrs||hasImpl){walkAttributes(impl.attrs,function(k,v){setAttr(root,k,v)})
parseExpressions(self.root,self,expressions)}
if(!self.parent||isLoop)self.update(item)
self.trigger('before-mount')
if(isLoop&&!hasImpl){self.root=root=dom.firstChild}else{while(dom.firstChild)root.appendChild(dom.firstChild)
if(root.stub)self.root=root=parent.root}
if(isLoop)
parseNamedElements(self.root,self.parent,null,true)
if(!self.parent||self.parent.isMounted){self.isMounted=true
self.trigger('mount')}
else self.parent.one('mount',function(){if(!isInStub(self.root)){self.parent.isMounted=self.isMounted=true
self.trigger('mount')}})})
defineProperty(this,'unmount',function(keepRootTag){var el=root,p=el.parentNode,ptag
self.trigger('before-unmount')
__virtualDom.splice(__virtualDom.indexOf(self),1)
if(this._virts){each(this._virts,function(v){v.parentNode.removeChild(v)})}
if(p){if(parent){ptag=getImmediateCustomParentTag(parent)
if(isArray(ptag.tags[tagName]))
each(ptag.tags[tagName],function(tag,i){if(tag._riot_id==self._riot_id)
ptag.tags[tagName].splice(i,1)})
else
ptag.tags[tagName]=undefined}
else
while(el.firstChild)el.removeChild(el.firstChild)
if(!keepRootTag)
p.removeChild(el)
else
remAttr(p,'riot-tag')}
self.trigger('unmount')
toggle()
self.off('*')
self.isMounted=false
delete root._tag})
function toggle(isMount){each(childTags,function(child){child[isMount?'mount':'unmount']()})
if(!parent)return
var evt=isMount?'on':'off'
if(isLoop)
parent[evt]('unmount',self.unmount)
else
parent[evt]('update',self.update)[evt]('unmount',self.unmount)}
parseNamedElements(dom,this,childTags)}
function setEventHandler(name,handler,dom,tag){dom[name]=function(e){var ptag=tag._parent,item=tag._item,el
if(!item)
while(ptag&&!item){item=ptag._item
ptag=ptag._parent}
e=e||window.event
if(isWritable(e,'currentTarget'))e.currentTarget=dom
if(isWritable(e,'target'))e.target=e.srcElement
if(isWritable(e,'which'))e.which=e.charCode||e.keyCode
e.item=item
if(handler.call(tag,e)!==true&&!/radio|check/.test(dom.type)){if(e.preventDefault)e.preventDefault()
e.returnValue=false}
if(!e.preventUpdate){el=item?getImmediateCustomParentTag(ptag):tag
el.update()}}}
function insertTo(root,node,before){if(!root)return
root.insertBefore(before,node)
root.removeChild(node)}
function update(expressions,tag){each(expressions,function(expr,i){var dom=expr.dom,attrName=expr.attr,value=tmpl(expr.expr,tag),parent=expr.dom.parentNode
if(expr.bool)
value=value?attrName:false
else if(value==null)
value=''
if(parent&&parent.tagName=='TEXTAREA'){value=(''+value).replace(/riot-/g,'')
parent.value=value}
if(expr.value===value)return
expr.value=value
if(!attrName){dom.nodeValue=''+value
return}
remAttr(dom,attrName)
if(isFunction(value)){setEventHandler(attrName,value,dom,tag)
}else if(attrName=='if'){var stub=expr.stub,add=function(){insertTo(stub.parentNode,stub,dom)},remove=function(){insertTo(dom.parentNode,dom,stub)}
if(value){if(stub){add()
dom.inStub=false
if(!isInStub(dom)){walk(dom,function(el){if(el._tag&&!el._tag.isMounted)
el._tag.isMounted=!!el._tag.trigger('mount')})}}
}else{stub=expr.stub=stub||document.createTextNode('')
if(dom.parentNode)
remove()
else(tag.parent||tag).one('updated',remove)
dom.inStub=true}
}else if(/^(show|hide)$/.test(attrName)){if(attrName=='hide')value=!value
dom.style.display=value?'':'none'
}else if(attrName=='value'){dom.value=value
}else if(startsWith(attrName,RIOT_PREFIX)&&attrName!=RIOT_TAG){if(value)
setAttr(dom,attrName.slice(RIOT_PREFIX.length),value)}else{if(expr.bool){dom[attrName]=value
if(!value)return}
if(value===0||value&&typeof value!==T_OBJECT)
setAttr(dom,attrName,value)}})}
function each(els,fn){for(var i=0,len=(els||[]).length,el;i<len;i++){el=els[i]
if(el!=null&&fn(el,i)===false)i--}
return els}
function isFunction(v){return typeof v===T_FUNCTION||false}
function remAttr(dom,name){dom.removeAttribute(name)}
function toCamel(string){return string.replace(/-(\w)/g,function(_,c){return c.toUpperCase()})}
function getAttr(dom,name){return dom.getAttribute(name)}
function setAttr(dom,name,val){dom.setAttribute(name,val)}
function getTag(dom){return dom.tagName&&__tagImpl[getAttr(dom,RIOT_TAG)||dom.tagName.toLowerCase()]}
function addChildTag(tag,tagName,parent){var cachedTag=parent.tags[tagName]
if(cachedTag){if(!isArray(cachedTag))
if(cachedTag!==tag)
parent.tags[tagName]=[cachedTag]
if(!contains(parent.tags[tagName],tag))
parent.tags[tagName].push(tag)}else{parent.tags[tagName]=tag}}
function moveChildTag(tag,tagName,newPos){var parent=tag.parent,tags
if(!parent)return
tags=parent.tags[tagName]
if(isArray(tags))
tags.splice(newPos,0,tags.splice(tags.indexOf(tag),1)[0])
else addChildTag(tag,tagName,parent)}
function initChildTag(child,opts,innerHTML,parent){var tag=new Tag(child,opts,innerHTML),tagName=getTagName(opts.root),ptag=getImmediateCustomParentTag(parent)
tag.parent=ptag
tag._parent=parent
addChildTag(tag,tagName,ptag)
if(ptag!==parent)
addChildTag(tag,tagName,parent)
opts.root.innerHTML=''
return tag}
function getImmediateCustomParentTag(tag){var ptag=tag
while(!getTag(ptag.root)){if(!ptag.parent)break
ptag=ptag.parent}
return ptag}
function defineProperty(el,key,value,options){Object.defineProperty(el,key,extend({value:value,enumerable:false,writable:false,configurable:false},options))
return el}
function getTagName(dom){var child=getTag(dom),namedTag=getAttr(dom,'name'),tagName=namedTag&&!tmpl.hasExpr(namedTag)?namedTag:child?child.name:dom.tagName.toLowerCase()
return tagName}
function extend(src){var obj,args=arguments
for(var i=1;i<args.length;++i){if(obj=args[i]){for(var key in obj){if(isWritable(src,key))
src[key]=obj[key]}}}
return src}
function contains(arr,item){return~arr.indexOf(item)}
function isArray(a){return Array.isArray(a)||a instanceof Array}
function isWritable(obj,key){var props=Object.getOwnPropertyDescriptor(obj,key)
return typeof obj[key]===T_UNDEF||props&&props.writable}
function cleanUpData(data){if(!(data instanceof Tag)&&!(data&&typeof data.trigger==T_FUNCTION))
return data
var o={}
for(var key in data){if(!contains(RESERVED_WORDS_BLACKLIST,key))
o[key]=data[key]}
return o}
function walk(dom,fn){if(dom){if(fn(dom)===false)return
else{dom=dom.firstChild
while(dom){walk(dom,fn)
dom=dom.nextSibling}}}}
function walkAttributes(html,fn){var m,re=/([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g
while(m=re.exec(html)){fn(m[1].toLowerCase(),m[2]||m[3]||m[4])}}
function isInStub(dom){while(dom){if(dom.inStub)return true
dom=dom.parentNode}
return false}
function mkEl(name){return document.createElement(name)}
function $$(selector,ctx){return(ctx||document).querySelectorAll(selector)}
function $(selector,ctx){return(ctx||document).querySelector(selector)}
function inherit(parent){function Child(){}
Child.prototype=parent
return new Child()}
function getNamedKey(dom){return getAttr(dom,'id')||getAttr(dom,'name')}
function setNamed(dom,parent,keys){var key=getNamedKey(dom),isArr,add=function(value){if(contains(keys,key))return
isArr=isArray(value)
if(!value)
parent[key]=dom
else if(!isArr||isArr&&!contains(value,dom)){if(isArr)
value.push(dom)
else
parent[key]=[value,dom]}}
if(!key)return
if(tmpl.hasExpr(key))
parent.one('mount',function(){key=getNamedKey(dom)
add(parent[key])})
else
add(parent[key])}
function startsWith(src,str){return src.slice(0,str.length)===str}
var rAF=(function(w){var raf=w.requestAnimationFrame||w.mozRequestAnimationFrame||w.webkitRequestAnimationFrame
if(!raf||/iP(ad|hone|od).*OS 6/.test(w.navigator.userAgent)){var lastTime=0
raf=function(cb){var nowtime=Date.now(),timeout=Math.max(16-(nowtime-lastTime),0)
setTimeout(function(){cb(lastTime=nowtime+timeout)},timeout)}}
return raf})(window||{})
function mountTo(root,tagName,opts){var tag=__tagImpl[tagName],innerHTML=root._innerHTML=root._innerHTML||root.innerHTML
root.innerHTML=''
if(tag&&root)tag=new Tag(tag,{root:root,opts:opts},innerHTML)
if(tag&&tag.mount){tag.mount()
if(!contains(__virtualDom,tag))__virtualDom.push(tag)}
return tag}
riot.util={brackets:brackets,tmpl:tmpl}
riot.mixin=(function(){var mixins={}
return function(name,mixin){if(!mixin)return mixins[name]
mixins[name]=mixin}})()
riot.tag=function(name,html,css,attrs,fn){if(isFunction(attrs)){fn=attrs
if(/^[\w\-]+\s?=/.test(css)){attrs=css
css=''}else attrs=''}
if(css){if(isFunction(css))fn=css
else styleManager.add(css)}
__tagImpl[name]={name:name,tmpl:html,attrs:attrs,fn:fn}
return name}
riot.tag2=function(name,html,css,attrs,fn,bpair){if(css)styleManager.add(css)
__tagImpl[name]={name:name,tmpl:html,attrs:attrs,fn:fn}
return name}
riot.mount=function(selector,tagName,opts){var els,allTags,tags=[]
function addRiotTags(arr){var list=''
each(arr,function(e){if(!/[^-\w]/.test(e))
list+=',*['+RIOT_TAG+'='+e.trim()+']'})
return list}
function selectAllTags(){var keys=Object.keys(__tagImpl)
return keys+addRiotTags(keys)}
function pushTags(root){var last
if(root.tagName){if(tagName&&(!(last=getAttr(root,RIOT_TAG))||last!=tagName))
setAttr(root,RIOT_TAG,tagName)
var tag=mountTo(root,tagName||root.getAttribute(RIOT_TAG)||root.tagName.toLowerCase(),opts)
if(tag)tags.push(tag)}else if(root.length)
each(root,pushTags)}
styleManager.inject()
if(typeof tagName===T_OBJECT){opts=tagName
tagName=0}
if(typeof selector===T_STRING){if(selector==='*')
selector=allTags=selectAllTags()
else
selector+=addRiotTags(selector.split(','))
els=selector?$$(selector):[]}
else
els=selector
if(tagName==='*'){tagName=allTags||selectAllTags()
if(els.tagName)
els=$$(tagName,els)
else{var nodeList=[]
each(els,function(_el){nodeList.push($$(tagName,_el))})
els=nodeList}
tagName=0}
if(els.tagName)
pushTags(els)
else
each(els,pushTags)
return tags}
riot.update=function(){return each(__virtualDom,function(tag){tag.update()})}
riot.Tag=Tag
if(typeof exports===T_OBJECT)
module.exports=riot
else if(typeof define===T_FUNCTION&&typeof define.amd!==T_UNDEF)
define(function(){return riot})
else
window.riot=riot})(typeof window!='undefined'?window:void 0);var RiotControl={_stores:[],addStore:function(store){this._stores.push(store);}};['on','one','off','trigger'].forEach(function(api){RiotControl[api]=function(){var args=[].slice.call(arguments);this._stores.forEach(function(el){el[api].apply(null,args);});};});if(typeof(module)!=='undefined')module.exports=RiotControl;;(function(){var block={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:noop,hr:/^( *[-*_]){3,} *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,nptable:noop,lheading:/^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,blockquote:/^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,list:/^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:/^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,table:noop,paragraph:/^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,text:/^[^\n]+/};block.bullet=/(?:[*+-]|\d+\.)/;block.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;block.item=replace(block.item,'gm')
(/bull/g,block.bullet)
();block.list=replace(block.list)
(/bull/g,block.bullet)
('hr','\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
('def','\\n+(?='+block.def.source+')')
();block.blockquote=replace(block.blockquote)
('def',block.def)
();block._tag='(?!(?:'
+'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
+'|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
+'|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';block.html=replace(block.html)
('comment',/<!--[\s\S]*?-->/)
('closed',/<(tag)[\s\S]+?<\/\1>/)
('closing',/<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
(/tag/g,block._tag)
();block.paragraph=replace(block.paragraph)
('hr',block.hr)
('heading',block.heading)
('lheading',block.lheading)
('blockquote',block.blockquote)
('tag','<'+block._tag)
('def',block.def)
();block.normal=merge({},block);block.gfm=merge({},block.normal,{fences:/^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,paragraph:/^/,heading:/^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/});block.gfm.paragraph=replace(block.paragraph)
('(?!','(?!'
+block.gfm.fences.source.replace('\\1','\\2')+'|'
+block.list.source.replace('\\1','\\3')+'|')
();block.tables=merge({},block.gfm,{nptable:/^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,table:/^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/});function Lexer(options){this.tokens=[];this.tokens.links={};this.options=options||marked.defaults;this.rules=block.normal;if(this.options.gfm){if(this.options.tables){this.rules=block.tables;}else{this.rules=block.gfm;}}}
Lexer.rules=block;Lexer.lex=function(src,options){var lexer=new Lexer(options);return lexer.lex(src);};Lexer.prototype.lex=function(src){src=src.replace(/\r\n|\r/g,'\n').replace(/\t/g,'    ').replace(/\u00a0/g,' ').replace(/\u2424/g,'\n');return this.token(src,true);};Lexer.prototype.token=function(src,top,bq){var src=src.replace(/^ +$/gm,''),next,loose,cap,bull,b,item,space,i,l;while(src){if(cap=this.rules.newline.exec(src)){src=src.substring(cap[0].length);if(cap[0].length>1){this.tokens.push({type:'space'});}}
if(cap=this.rules.code.exec(src)){src=src.substring(cap[0].length);cap=cap[0].replace(/^ {4}/gm,'');this.tokens.push({type:'code',text:!this.options.pedantic?cap.replace(/\n+$/,''):cap});continue;}
if(cap=this.rules.fences.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'code',lang:cap[2],text:cap[3]||''});continue;}
if(cap=this.rules.heading.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'heading',depth:cap[1].length,text:cap[2]});continue;}
if(top&&(cap=this.rules.nptable.exec(src))){src=src.substring(cap[0].length);item={type:'table',header:cap[1].replace(/^ *| *\| *$/g,'').split(/ *\| */),align:cap[2].replace(/^ *|\| *$/g,'').split(/ *\| */),cells:cap[3].replace(/\n$/,'').split('\n')};for(i=0;i<item.align.length;i++){if(/^ *-+: *$/.test(item.align[i])){item.align[i]='right';}else if(/^ *:-+: *$/.test(item.align[i])){item.align[i]='center';}else if(/^ *:-+ *$/.test(item.align[i])){item.align[i]='left';}else{item.align[i]=null;}}
for(i=0;i<item.cells.length;i++){item.cells[i]=item.cells[i].split(/ *\| */);}
this.tokens.push(item);continue;}
if(cap=this.rules.lheading.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'heading',depth:cap[2]==='='?1:2,text:cap[1]});continue;}
if(cap=this.rules.hr.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'hr'});continue;}
if(cap=this.rules.blockquote.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'blockquote_start'});cap=cap[0].replace(/^ *> ?/gm,'');this.token(cap,top,true);this.tokens.push({type:'blockquote_end'});continue;}
if(cap=this.rules.list.exec(src)){src=src.substring(cap[0].length);bull=cap[2];this.tokens.push({type:'list_start',ordered:bull.length>1});cap=cap[0].match(this.rules.item);next=false;l=cap.length;i=0;for(;i<l;i++){item=cap[i];space=item.length;item=item.replace(/^ *([*+-]|\d+\.) +/,'');if(~item.indexOf('\n ')){space-=item.length;item=!this.options.pedantic?item.replace(new RegExp('^ {1,'+space+'}','gm'),''):item.replace(/^ {1,4}/gm,'');}
if(this.options.smartLists&&i!==l-1){b=block.bullet.exec(cap[i+1])[0];if(bull!==b&&!(bull.length>1&&b.length>1)){src=cap.slice(i+1).join('\n')+src;i=l-1;}}
loose=next||/\n\n(?!\s*$)/.test(item);if(i!==l-1){next=item.charAt(item.length-1)==='\n';if(!loose)loose=next;}
this.tokens.push({type:loose?'loose_item_start':'list_item_start'});this.token(item,false,bq);this.tokens.push({type:'list_item_end'});}
this.tokens.push({type:'list_end'});continue;}
if(cap=this.rules.html.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:this.options.sanitize?'paragraph':'html',pre:!this.options.sanitizer&&(cap[1]==='pre'||cap[1]==='script'||cap[1]==='style'),text:cap[0]});continue;}
if((!bq&&top)&&(cap=this.rules.def.exec(src))){src=src.substring(cap[0].length);this.tokens.links[cap[1].toLowerCase()]={href:cap[2],title:cap[3]};continue;}
if(top&&(cap=this.rules.table.exec(src))){src=src.substring(cap[0].length);item={type:'table',header:cap[1].replace(/^ *| *\| *$/g,'').split(/ *\| */),align:cap[2].replace(/^ *|\| *$/g,'').split(/ *\| */),cells:cap[3].replace(/(?: *\| *)?\n$/,'').split('\n')};for(i=0;i<item.align.length;i++){if(/^ *-+: *$/.test(item.align[i])){item.align[i]='right';}else if(/^ *:-+: *$/.test(item.align[i])){item.align[i]='center';}else if(/^ *:-+ *$/.test(item.align[i])){item.align[i]='left';}else{item.align[i]=null;}}
for(i=0;i<item.cells.length;i++){item.cells[i]=item.cells[i].replace(/^ *\| *| *\| *$/g,'').split(/ *\| */);}
this.tokens.push(item);continue;}
if(top&&(cap=this.rules.paragraph.exec(src))){src=src.substring(cap[0].length);this.tokens.push({type:'paragraph',text:cap[1].charAt(cap[1].length-1)==='\n'?cap[1].slice(0,-1):cap[1]});continue;}
if(cap=this.rules.text.exec(src)){src=src.substring(cap[0].length);this.tokens.push({type:'text',text:cap[0]});continue;}
if(src){throw new
Error('Infinite loop on byte: '+src.charCodeAt(0));}}
return this.tokens;};var inline={escape:/^\\([\\`*{}\[\]()#+\-.!_>])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,url:noop,tag:/^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,link:/^!?\[(inside)\]\(href\)/,reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,em:/^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,code:/^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,br:/^ {2,}\n(?!\s*$)/,del:noop,text:/^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/};inline._inside=/(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;inline._href=/\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;inline.link=replace(inline.link)
('inside',inline._inside)
('href',inline._href)
();inline.reflink=replace(inline.reflink)
('inside',inline._inside)
();inline.normal=merge({},inline);inline.pedantic=merge({},inline.normal,{strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/});inline.gfm=merge({},inline.normal,{escape:replace(inline.escape)('])','~|])')(),url:/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,del:/^~~(?=\S)([\s\S]*?\S)~~/,text:replace(inline.text)
(']|','~]|')
('|','|https?://|')
()});inline.breaks=merge({},inline.gfm,{br:replace(inline.br)('{2,}','*')(),text:replace(inline.gfm.text)('{2,}','*')()});function InlineLexer(links,options){this.options=options||marked.defaults;this.links=links;this.rules=inline.normal;this.renderer=this.options.renderer||new Renderer;this.renderer.options=this.options;if(!this.links){throw new
Error('Tokens array requires a `links` property.');}
if(this.options.gfm){if(this.options.breaks){this.rules=inline.breaks;}else{this.rules=inline.gfm;}}else if(this.options.pedantic){this.rules=inline.pedantic;}}
InlineLexer.rules=inline;InlineLexer.output=function(src,links,options){var inline=new InlineLexer(links,options);return inline.output(src);};InlineLexer.prototype.output=function(src){var out='',link,text,href,cap;while(src){if(cap=this.rules.escape.exec(src)){src=src.substring(cap[0].length);out+=cap[1];continue;}
if(cap=this.rules.autolink.exec(src)){src=src.substring(cap[0].length);if(cap[2]==='@'){text=cap[1].charAt(6)===':'?this.mangle(cap[1].substring(7)):this.mangle(cap[1]);href=this.mangle('mailto:')+text;}else{text=escape(cap[1]);href=text;}
out+=this.renderer.link(href,null,text);continue;}
if(!this.inLink&&(cap=this.rules.url.exec(src))){src=src.substring(cap[0].length);text=escape(cap[1]);href=text;out+=this.renderer.link(href,null,text);continue;}
if(cap=this.rules.tag.exec(src)){if(!this.inLink&&/^<a /i.test(cap[0])){this.inLink=true;}else if(this.inLink&&/^<\/a>/i.test(cap[0])){this.inLink=false;}
src=src.substring(cap[0].length);out+=this.options.sanitize?this.options.sanitizer?this.options.sanitizer(cap[0]):escape(cap[0]):cap[0]
continue;}
if(cap=this.rules.link.exec(src)){src=src.substring(cap[0].length);this.inLink=true;out+=this.outputLink(cap,{href:cap[2],title:cap[3]});this.inLink=false;continue;}
if((cap=this.rules.reflink.exec(src))||(cap=this.rules.nolink.exec(src))){src=src.substring(cap[0].length);link=(cap[2]||cap[1]).replace(/\s+/g,' ');link=this.links[link.toLowerCase()];if(!link||!link.href){out+=cap[0].charAt(0);src=cap[0].substring(1)+src;continue;}
this.inLink=true;out+=this.outputLink(cap,link);this.inLink=false;continue;}
if(cap=this.rules.strong.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.strong(this.output(cap[2]||cap[1]));continue;}
if(cap=this.rules.em.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.em(this.output(cap[2]||cap[1]));continue;}
if(cap=this.rules.code.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.codespan(escape(cap[2],true));continue;}
if(cap=this.rules.br.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.br();continue;}
if(cap=this.rules.del.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.del(this.output(cap[1]));continue;}
if(cap=this.rules.text.exec(src)){src=src.substring(cap[0].length);out+=this.renderer.text(escape(this.smartypants(cap[0])));continue;}
if(src){throw new
Error('Infinite loop on byte: '+src.charCodeAt(0));}}
return out;};InlineLexer.prototype.outputLink=function(cap,link){var href=escape(link.href),title=link.title?escape(link.title):null;return cap[0].charAt(0)!=='!'?this.renderer.link(href,title,this.output(cap[1])):this.renderer.image(href,title,escape(cap[1]));};InlineLexer.prototype.smartypants=function(text){if(!this.options.smartypants)return text;return text
.replace(/---/g,'\u2014')
.replace(/--/g,'\u2013')
.replace(/(^|[-\u2014/(\[{"\s])'/g,'$1\u2018')
.replace(/'/g,'\u2019')
.replace(/(^|[-\u2014/(\[{\u2018\s])"/g,'$1\u201c')
.replace(/"/g,'\u201d')
.replace(/\.{3}/g,'\u2026');};InlineLexer.prototype.mangle=function(text){if(!this.options.mangle)return text;var out='',l=text.length,i=0,ch;for(;i<l;i++){ch=text.charCodeAt(i);if(Math.random()>0.5){ch='x'+ch.toString(16);}
out+='&#'+ch+';';}
return out;};function Renderer(options){this.options=options||{};}
Renderer.prototype.code=function(code,lang,escaped){if(this.options.highlight){var out=this.options.highlight(code,lang);if(out!=null&&out!==code){escaped=true;code=out;}}
if(!lang){return'<pre><code>'
+(escaped?code:escape(code,true))
+'\n</code></pre>';}
return'<pre><code class="'
+this.options.langPrefix
+escape(lang,true)
+'">'
+(escaped?code:escape(code,true))
+'\n</code></pre>\n';};Renderer.prototype.blockquote=function(quote){return'<blockquote>\n'+quote+'</blockquote>\n';};Renderer.prototype.html=function(html){return html;};Renderer.prototype.heading=function(text,level,raw){return'<h'
+level
+' id="'
+this.options.headerPrefix
+raw.toLowerCase().replace(/[^\w]+/g,'-')
+'">'
+text
+'</h'
+level
+'>\n';};Renderer.prototype.hr=function(){return this.options.xhtml?'<hr/>\n':'<hr>\n';};Renderer.prototype.list=function(body,ordered){var type=ordered?'ol':'ul';return'<'+type+'>\n'+body+'</'+type+'>\n';};Renderer.prototype.listitem=function(text){return'<li>'+text+'</li>\n';};Renderer.prototype.paragraph=function(text){return'<p>'+text+'</p>\n';};Renderer.prototype.table=function(header,body){return'<table>\n'
+'<thead>\n'
+header
+'</thead>\n'
+'<tbody>\n'
+body
+'</tbody>\n'
+'</table>\n';};Renderer.prototype.tablerow=function(content){return'<tr>\n'+content+'</tr>\n';};Renderer.prototype.tablecell=function(content,flags){var type=flags.header?'th':'td';var tag=flags.align?'<'+type+' style="text-align:'+flags.align+'">':'<'+type+'>';return tag+content+'</'+type+'>\n';};Renderer.prototype.strong=function(text){return'<strong>'+text+'</strong>';};Renderer.prototype.em=function(text){return'<em>'+text+'</em>';};Renderer.prototype.codespan=function(text){return'<code>'+text+'</code>';};Renderer.prototype.br=function(){return this.options.xhtml?'<br/>':'<br>';};Renderer.prototype.del=function(text){return'<del>'+text+'</del>';};Renderer.prototype.link=function(href,title,text){if(this.options.sanitize){try{var prot=decodeURIComponent(unescape(href)).replace(/[^\w:]/g,'').toLowerCase();}catch(e){return'';}
if(prot.indexOf('javascript:')===0||prot.indexOf('vbscript:')===0){return'';}}
var out='<a href="'+href+'"';if(title){out+=' title="'+title+'"';}
out+='>'+text+'</a>';return out;};Renderer.prototype.image=function(href,title,text){var out='<img src="'+href+'" alt="'+text+'"';if(title){out+=' title="'+title+'"';}
out+=this.options.xhtml?'/>':'>';return out;};Renderer.prototype.text=function(text){return text;};function Parser(options){this.tokens=[];this.token=null;this.options=options||marked.defaults;this.options.renderer=this.options.renderer||new Renderer;this.renderer=this.options.renderer;this.renderer.options=this.options;}
Parser.parse=function(src,options,renderer){var parser=new Parser(options,renderer);return parser.parse(src);};Parser.prototype.parse=function(src){this.inline=new InlineLexer(src.links,this.options,this.renderer);this.tokens=src.reverse();var out='';while(this.next()){out+=this.tok();}
return out;};Parser.prototype.next=function(){return this.token=this.tokens.pop();};Parser.prototype.peek=function(){return this.tokens[this.tokens.length-1]||0;};Parser.prototype.parseText=function(){var body=this.token.text;while(this.peek().type==='text'){body+='\n'+this.next().text;}
return this.inline.output(body);};Parser.prototype.tok=function(){switch(this.token.type){case'space':{return'';}
case'hr':{return this.renderer.hr();}
case'heading':{return this.renderer.heading(this.inline.output(this.token.text),this.token.depth,this.token.text);}
case'code':{return this.renderer.code(this.token.text,this.token.lang,this.token.escaped);}
case'table':{var header='',body='',i,row,cell,flags,j;cell='';for(i=0;i<this.token.header.length;i++){flags={header:true,align:this.token.align[i]};cell+=this.renderer.tablecell(this.inline.output(this.token.header[i]),{header:true,align:this.token.align[i]});}
header+=this.renderer.tablerow(cell);for(i=0;i<this.token.cells.length;i++){row=this.token.cells[i];cell='';for(j=0;j<row.length;j++){cell+=this.renderer.tablecell(this.inline.output(row[j]),{header:false,align:this.token.align[j]});}
body+=this.renderer.tablerow(cell);}
return this.renderer.table(header,body);}
case'blockquote_start':{var body='';while(this.next().type!=='blockquote_end'){body+=this.tok();}
return this.renderer.blockquote(body);}
case'list_start':{var body='',ordered=this.token.ordered;while(this.next().type!=='list_end'){body+=this.tok();}
return this.renderer.list(body,ordered);}
case'list_item_start':{var body='';while(this.next().type!=='list_item_end'){body+=this.token.type==='text'?this.parseText():this.tok();}
return this.renderer.listitem(body);}
case'loose_item_start':{var body='';while(this.next().type!=='list_item_end'){body+=this.tok();}
return this.renderer.listitem(body);}
case'html':{var html=!this.token.pre&&!this.options.pedantic?this.inline.output(this.token.text):this.token.text;return this.renderer.html(html);}
case'paragraph':{return this.renderer.paragraph(this.inline.output(this.token.text));}
case'text':{return this.renderer.paragraph(this.parseText());}}};function escape(html,encode){return html.replace(!encode?/&(?!#?\w+;)/g:/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function unescape(html){return html.replace(/&([#\w]+);/g,function(_,n){n=n.toLowerCase();if(n==='colon')return':';if(n.charAt(0)==='#'){return n.charAt(1)==='x'?String.fromCharCode(parseInt(n.substring(2),16)):String.fromCharCode(+n.substring(1));}
return'';});}
function replace(regex,opt){regex=regex.source;opt=opt||'';return function self(name,val){if(!name)return new RegExp(regex,opt);val=val.source||val;val=val.replace(/(^|[^\[])\^/g,'$1');regex=regex.replace(name,val);return self;};}
function noop(){}
noop.exec=noop;function merge(obj){var i=1,target,key;for(;i<arguments.length;i++){target=arguments[i];for(key in target){if(Object.prototype.hasOwnProperty.call(target,key)){obj[key]=target[key];}}}
return obj;}
function marked(src,opt,callback){if(callback||typeof opt==='function'){if(!callback){callback=opt;opt=null;}
opt=merge({},marked.defaults,opt||{});var highlight=opt.highlight,tokens,pending,i=0;try{tokens=Lexer.lex(src,opt)}catch(e){return callback(e);}
pending=tokens.length;var done=function(err){if(err){opt.highlight=highlight;return callback(err);}
var out;try{out=Parser.parse(tokens,opt);}catch(e){err=e;}
opt.highlight=highlight;return err?callback(err):callback(null,out);};if(!highlight||highlight.length<3){return done();}
delete opt.highlight;if(!pending)return done();for(;i<tokens.length;i++){(function(token){if(token.type!=='code'){return--pending||done();}
return highlight(token.text,token.lang,function(err,code){if(err)return done(err);if(code==null||code===token.text){return--pending||done();}
token.text=code;token.escaped=true;--pending||done();});})(tokens[i]);}
return;}
try{if(opt)opt=merge({},marked.defaults,opt);return Parser.parse(Lexer.lex(src,opt),opt);}catch(e){e.message+='\nPlease report this to https://github.com/chjj/marked.';if((opt||marked.defaults).silent){return'<p>An error occured:</p><pre>'
+escape(e.message+'',true)
+'</pre>';}
throw e;}}
marked.options=marked.setOptions=function(opt){merge(marked.defaults,opt);return marked;};marked.defaults={gfm:true,tables:true,breaks:false,pedantic:false,sanitize:false,sanitizer:null,mangle:true,smartLists:false,silent:false,highlight:null,langPrefix:'lang-',smartypants:false,headerPrefix:'',renderer:new Renderer,xhtml:false};marked.Parser=Parser;marked.parser=Parser.parse;marked.Renderer=Renderer;marked.Lexer=Lexer;marked.lexer=Lexer.lex;marked.InlineLexer=InlineLexer;marked.inlineLexer=InlineLexer.output;marked.parse=marked;if(typeof module!=='undefined'&&typeof exports==='object'){module.exports=marked;}else if(typeof define==='function'&&define.amd){define(function(){return marked;});}else{this.marked=marked;}}).call(function(){return this||(typeof window!=='undefined'?window:global);}());function setupNotifications(){if("Notification"in window){switch(Notification.permission){case'granted':console.log('Notification permission previously granted');break;case'denied':console.log('Notification permission previously denied');;break;default:Notification.requestPermission(function(permission){switch(permission){case'granted':console.log('Notification permission granted');var notification=new Notification('Notifications here will be used to keep you updated');break;default:console.log('Notification permission '+permission);}});}}else{console.log('Notification API not supported');}}
function Store(item,collection){var self=this;if(typeof collection=='undefined'){collection=item+'s';}
var base='/api/'+collection;riot.observable(self);self.load_item=function(id){$.ajax({url:base+'/'+id,dataType:'json'}).done(function(data){console.log(item,id,'loaded',data);self.trigger(item+'.loaded',data);}).fail(function(){console.error(arguments);});};self.load_collection=function(){$.getJSON(base,{per_page:100}).done(function(data){console.log(collection,'loaded',data);self.trigger(collection+'.loaded',data);});};self.on(item+'.load',self.load_item);self.on(collection+'.load',self.load_collection);self.on(collection+'.create',function(attributes){$.ajax({url:base,type:'POST',contentType:'application/json',data:JSON.stringify(attributes)}).done(function(data){console.log(item,'saved',data);self.trigger(item+'.saved',data);self.load_collection();}).fail(function(xhr,errorType,error){console.error(item,'error',JSON.parse(xhr.responseText));self.trigger(item+'.error',JSON.parse(xhr.responseText));});});self.on(item+'.save',function(id,attributes){console.log(item,id,'save',attributes);$.ajax({url:base+'/'+id,type:'PATCH',contentType:'application/json',data:JSON.stringify(attributes)}).done(function(data){console.log(item,id,'saved',data);self.trigger(item+'.saved',data);self.load_collection();}).fail(function(xhr,errorType,error){console.error(item,id,'error',JSON.parse(xhr.responseText));self.trigger(item+'.error',JSON.parse(xhr.responseText));});});self.on(item+'.remove',function(id){$.ajax({url:base+'/'+id,type:'DELETE',success:self.load_collection});});}
function CurrentUserStore(){var self=this,base='/api/users/current';riot.observable(self);self.on('currentuser.load',function(){$.getJSON(base,function(data){console.log('currentuser','loaded',data);self.trigger('currentuser.loaded',data);});});}
var currentuser=new CurrentUserStore(),gateways=new Store('gateway'),networks=new Store('network'),users=new Store('user'),vouchers=new Store('voucher');gateways.on('gateway.upload',function(id,file){var xhr=new XMLHttpRequest(),fd=new FormData(),base='/api/gateways';fd.append('file',file);xhr.open('post',base+'/'+id+'/logo',true);return xhr.send(fd);});['expire','end','extend','block','unblock','archive'].forEach(function(action){vouchers.on('voucher.'+action,function(id){$.ajax({type:'POST',url:'/api/vouchers/'+id+'/'+action}).done(function(){console.log('voucher',action,id);this.load_collection();}.bind(this)).fail(function(xhr,errorType,error){console.error('voucher',action,id,'error',JSON.parse(xhr.responseText));});});});RiotControl.addStore(currentuser);RiotControl.addStore(gateways);RiotControl.addStore(networks);RiotControl.addStore(users);RiotControl.addStore(vouchers);(function(window,document){var layout=document.getElementById('layout'),menu=document.getElementById('menu'),menuLink=document.getElementById('menuLink');function toggleClass(element,className){var classes=element.className.split(/\s+/),length=classes.length,i=0;for(;i<length;i++){if(classes[i]===className){classes.splice(i,1);break;}}
if(length===classes.length){classes.push(className);}
element.className=classes.join(' ');}
menuLink.onclick=function(e){var active='active';e.preventDefault();toggleClass(layout,active);toggleClass(menu,active);toggleClass(menuLink,active);};}(this,this.document));riot.mixin('crud',{init:function(){RiotControl.on(this.collection+'.loaded',function(rows){this.update({rows:rows});}.bind(this));RiotControl.on(this.item+'.loaded',function(row){this.row=row;this.modal.heading=row.title;this.modal.hidden=false;this.update();}.bind(this));RiotControl.on(this.item+'.error',function(response){var errors={};response.errors.forEach(function(error){errors[error.path[0]]=error.message;});this.update({errors:errors});}.bind(this));RiotControl.on(this.item+'.saved',function(){this.modal.hidden=true;this.update();}.bind(this));RiotControl.on(this.item+'.cancel',function(e){var self=this;$(this.tags.modal.form).find('[name]').each(function(){var value=self.row[$(this).attr('name')];if(typeof value=='object'&&value!==null){if(typeof value['$ref']!='undefined'){var result=/[^\/]*$/.exec(value['$ref']);value=result[0];}}
$(this).val(value);});self.modal.hidden=true;self.update();}.bind(this)),RiotControl.trigger(this.collection+'.load');},getId:function(e){return $(e.target).closest('tr[data-id]').data('id');},onOk:function(e){var modal=this.tags.modal,data={};this.checkboxes=this.checkboxes||[];this.saveColumns.forEach(function(column){var value;if(this.checkboxes.indexOf(column)>-1){value=$(modal[column]).is(':checked');}else{value=$(modal[column]).val();}
data[column]=value;console.log('Set '+column+' to '+value);}.bind(this));if(this.beforeSave!==undefined){this.beforeSave(data,modal);}
if(modal.original_id.value){RiotControl.trigger(this.item+'.save',modal.original_id.value,data);}else{RiotControl.trigger(this.collection+'.create',data);}
return false;},onRemove:function(e){var id=this.getId(e);console.log('onRemove',id);if(confirm('Are you sure?')){RiotControl.trigger(this.item+'.remove',id);}},onEdit:function(e){var id=this.getId(e);console.log('onEdit',id);RiotControl.trigger(this.item+'.load',id);},onNew:function(e){console.log('onNew');this.row=this.defaultObject;this.modal.heading='New '+this.item;this.modal.hidden=false;}});riot.mixin('currentuser',{init:function(){RiotControl.on('currentuser.loaded',function(currentuser){this.currentuser=currentuser;this.update();}.bind(this));RiotControl.trigger('currentuser.load');},hasRole:function(role){return this.currentuser.roles.indexOf(role)>-1;},isAdmin:function(){return this.hasRole('super-admin')||this.hasRole('network-admin')||this.hasRole('gateway-admin');}});riot.mixin('events',{triggerEvent:function(event){return function(e){RiotControl.trigger(event);}.bind(this);}});riot.mixin('networks',{init:function(){RiotControl.on('networks.loaded',function(networks){this.update({networks:networks});}.bind(this));RiotControl.trigger('networks.load');}});riot.mixin('render',{render:function(attribute){if(attribute==null){return'-';}
switch(typeof attribute){case'object':if(typeof attribute.$date!='undefined'){var date=new Date(attribute.$date);return date.toLocaleString();}
if(typeof attribute.$ref!='undefined'){return attribute.$ref.replace(/^.*\//,'');}
default:return attribute;}},renderTime:function(dt){if(dt){dt=new Date(dt.$date);return this.pad(dt.getHours(),2)+':'+this.pad(dt.getMinutes(),2);}},pad:function(number,length){var str=''+number;while(str.length<length){str='0'+str;}
return str;}});