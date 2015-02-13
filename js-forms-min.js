Forms=function(){function e(){throw Error(Array.prototype.slice.call(arguments).join(", "))}function t(){console.log(Array.prototype.slice.call(arguments).join(", "))}function n(e){if(!(e.config[D]&x))return void(e.submit=function(t){e.container.submit(t)});var t=function(){var t=arguments[arguments.length-1],n="function"==typeof t?t:function(){},a=e.config[L]||e.defaults.submitCallback,i=e.config[R]||e.defaults.validateCallback,r=e.config[j]||e.defaults.beforeSubmitCallback,o=e.config[S]||e.defaults.afterSubmitCallback,l=e.config[F]||function(t){t=t||function(){};var n=e.validate();if(i(n),n){var r=e.getFormData();if(e.config[B])for(var o in e.config[B])r[o]=e.config[B][o];return e.defaults.ajax(e.action,"POST",r,function(t){return function(n,i){a.call(e,n,i,t)}}(t)),e.saveChanges(),!0}return!1};r(function(){l(n)&&o()})};e.container.submit=e.submit=t,p(e.container,"submit",function(e){return e.preventDefault&&e.preventDefault(),t(),e.returnValue=!1,!1})}function a(e,t,n,a){var i="";switch(e){case"select":i='<select name="'+t+'" id="'+n+'">';for(var r,o=0;r=a[o];o++)i+=r.input;i+="</select>";break;case"radio":case"checkbox":i='<table cellpadding="0" cellspacing="0" class="forms-'+e+'-table">';for(var r,o=0;r=a[o];o++)i+='<tr><td class="forms-'+e+'">'+r.input+'</td><td class="forms-label-'+e+'">'+r.label+"</td></tr>";i+="</table>";break;default:return!1}return i}function i(e){var t=e.name,n=e.type,a=e.tagName.toLowerCase();if(!t||e.disabled||"reset"==n||"button"==n||"radio"==n&&!e.checked||("submit"==n||"image"==n)&&e.form&&e.form.clk!=e||"select"==a&&-1==e.selectedIndex)return null;switch(a){case"select":var i=e.selectedIndex;if(0>i)return null;for(var r=[],o=e.options,l="select-one"==n,s=l?i+1:o.length,c=l?i:0;s>c;c++){var u=o[c];if(u.selected){var f=u.value;if(f||(f=u.attributes&&u.attributes.value&&!u.attributes.value.specified?u.text:u.value),l)return f;r.push(f)}}return r.join(",");case"input":switch(n){case"radio":return""===e.value?null:e.value;case"checkbox":return e.checked?e.value||"1":"";case"text":case"password":case"hidden":return e.value}break;case"textarea":return e.value;default:return null}}function r(e){var t={};if(!e.length)return t;for(var n,a=0;n=e[a];a++){var r=n.name;if(r&&!n.disabled&&!f(n,"default-text")){var o=i(n);void 0===vt.get(r,t)&&null===o&&vt.set(r,null,t),null!==o&&(n.hasAttribute("bitmask")?(o=parseInt(o,10)||0,o|=vt.get(r,t),vt.set(r,o,t)):vt.set(r,o,t))}}return t}function o(e,t){if(e){var n=function(e,t){var n=e.tagName.toLowerCase();switch(n){case"select":for(var a,i=e.children,r=!1,o=0;a=i[o];o++)t!=a.value?(a.removeAttribute("selected"),a.selected=!1):(a.setAttribute("selected","1"),a.selected=!0,r=o);e.selectedIndex=r===!1?-1:r;break;case"input":switch(e.type){case"radio":t==e.value?(e.setAttribute("checked","true"),e.checked=!0):(e.removeAttribute("checked"),e.checked=!1);break;case"password":case"hidden":case"text":e.setAttribute("value",null===t?"":t),e.value=null===t?"":t;break;case"checkbox":var l=e.hasAttribute("bitmask");l&&e.value&t||t&&"0"!==t&&"!1"!==t&&!l?(e.setAttribute("checked","true"),e.checked=!0):(e.removeAttribute("checked"),e.checked=!1)}break;case"textarea":e.innerHTML=t,e.value=t}};if("object"==typeof t&&e.length)for(var a,i=0;a=e[i];i++)n(a,null!==t&&t[i]?t[i]:null);else if(!e.length||e.tagName)n(e,t);else for(var a,i=0;a=e[i];i++)n(a,t)}}function l(e,t,n){e.elements[t]&&(o(e.elements[t],n),vt.set(t,n,e.currentData))}function s(e,t){return e.elements[t]?vt.get(t,r(Array.prototype.concat(e.elements[t]))):void 0}function c(e){return dt[e]?dt[e]:!1}function u(e,t){f(e,t)||(e.className=(e.className+" "+t).trim())}function f(e,t){return RegExp("( |^)"+t+"( |$)","g").test(e.className)}function d(e,t){var n=RegExp("( |^)"+t+"( |$)","g");e.className=e.className.replace(n,function(e,t,n){return t==n?n:""})}function v(e){var t=!this.elements;t&&(this.elements={});for(var n,a=0;n=this.container[a];a++)t&&(this.elements[n.name]?"[object Array]"===Object.prototype.toString.call(this.elements[n.name])?this.elements[n.name].push(n):this.elements[n.name]=Array.prototype.concat(this.elements[n.name],n):this.elements[n.name]=n),e(n)}function h(){v.call(this,function(e){this.setField(e.name,"")}.bind(this))}function g(e,t,n){var a=document.createElement(n.toUpperCase());return a.setAttribute("class","form_"+t+"_"+e),a.setAttribute("name",e),a}function m(e,t){var n=document.createElement("SPAN");return n.className=e,u(n,t),n}function b(e,t,n){var a=this.notificationContainers[e];if(void 0===a[t]){var i=C(this.container,t,e);if(!i){if(!this.fieldContainers[t])return;i=g(t,e,this.fieldContainers[t].tagName),this.fieldContainers[t].parentNode.insertBefore(i,this.fieldContainers[t].nextSibling)}i.children.length||i.appendChild(m(n,this.options.defaults.hideClass)),a[t]=i}return this.notificationContainers[e][t].children[0]}function p(e,t,n){return e.addEventListener?(e.addEventListener(t,n,!1),!0):e.attachEvent?e.attachEvent("on"+t,n):(t="on"+t,"function"==typeof e[t]&&(n=function(e,t){return function(){e.apply(this,arguments),t.apply(this,arguments)}}(e[t],n)),e[t]=n,!0)}function C(e,t,n){var a;if(!e.allChildren){e.allChildren={};for(var i,r=e.getElementsByTagName("*"),o=0;i=r[o];o++)e.allChildren[i.className]=e.allChildren[i.className]||[],e.allChildren[i.className].push(i)}return a=e.allChildren["form_"+n+"_"+t],a?a&&void 0===a.length?a:1==a.length?a[0]:a[0]?a:null:null}function y(e,t,n,i){if(i=i||!1,n=n||!1,t){var r=e.container;e.errorContainers={},e.warningContainers={},e.fieldContainers={};var o=function(e,t){var n=document.createElement("LABEL");return n.innerHTML=e,n.setAttribute("for",t),n};for(var l in t){var s=l+"",c=t[s],u=c[q];if(u&&(e.fieldContainers[s]=C(r,s,Z),e.fieldContainers[s])){e.fieldContainers[s].innerHTML="",v=n?s+"-"+ut++:s;var f=C(r,s,J);if(c.label&&f){f.innerHTML="";var d=o(c.label,v);i&&d.setAttribute("title",s),f.appendChild(d)}var v,h={};c.data?h=c.data:c.label?h[c.label]=null:h[""]=null,e.fieldContainers[s].innerHTML=function(e,t,n,i,r){var o=[],l=1,s=0;for(var c in e)s++;var u=s>=2;for(var f in e){var d,v=t+(u?"-"+l:""),h={},g=null===e[f]?"":e[f];"select"==n?(0!==c&&void 0===e[""]&&(d='<option value=""></option>',o.push({input:d}),c=0),d='<option value="'+g+'">'+f+"</option>"):(d="text"==n||"hidden"==n||"password"==n||"checkbox"==n||"radio"==n?'<input type="'+n+'" name="'+i+'" id="'+v+'" error-id="'+t+'" value="'+g+'" />':'<textarea name="'+i+'" id="'+v+'" error-id="'+t+'" >'+g+"</textarea>",h.label=r?"":'<label for="'+v+'">'+f+"</label>"),h.input=d,o.push(h),l++}var m=a(n,i,t,o);return m?m:o[0].input}(h,v,u,s,!!f)}}}}function A(a){function i(a){function i(e){return!!e}var c={config:null,defaults:f,initialized:!1,container:null},d=this;if(c.config=c.config||a,d.init=function(n){return c.initialized?(t(tt),!1):(i(n)||e(et),c.config=n,c.initialized=!0,!0)},d.isChanged=!1,d.currentData={},d.initialData={},d.differsObj={},d.config=c.config,d.options=c,d.defaults=f,!i(c.config))return void t(et);if(c.config[O]&&(c.container=document.getElementById(c.config[O]),c.container||e(nt,c.config[O]),d.container=c.container),c.config[N]&&(d.container=c.container=c.config[N],c.config[O]=d.container.getAttribute("id")),d.container){c.config[D]=c.config[D]?c.config[D]|f.flags:f.flags,c.config[T]||(c.config[T]=f.validationType);{!!(c.config[D]&E)}d.getFormData=function(){return d.currentData},c.config[H]&&c.container.setAttribute(H,c.config[H]),d.action=c.container.getAttribute("action"),d.getFieldValue=function(e){return s(d,e)},d.setField=function(e,t,n){l(d,e,t),n&&m&&m(e,t)},d.setFields=function(e,t){for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&d.setField(n,e[n],t)},d.getField=function(e){return d.elements[e]},d.validate=function(e){if(e){var t=d.getFormData(!0);return g.field(d,e,d.config[I][e],t[e],f.errorClass,f.warningClass)}return d.config[P]?d.config[P](d,d.getFormData(1)):g.process(d,c.config[I])},d.clear=h.bind(d),d.notificationContainers={},d.notificationContainers[Q]={},d.notificationContainers[K]={},d.getErrorContainer=function(e){return b.call(d,Q,e,f.errorClass)},d.getWarningContainer=function(e){return b.call(d,K,e,f.warningClass)};var m=c.config[M]||!1;d.initInputs=function(){var e=c.config[I]||{},t=c.config[z],n=c.config[T],a=c.config[V]||f.onChange,i=function(e,t,n){var i=vt.get(t,this.currentData),r=d.getFieldValue(t),o=vt.get(t,this.initialData);switch(n){case it:"blur"==e.type&&this.validate(t);break;case rt:this.validate(t);break;case at:}differs(i,r,!0)&&(vt.set(t,r,this.currentData),m&&m(t,r));var l=differs(this.differsObj,{});differs(o,r,!0)?vt.set(t,!0,this.differsObj):vt.del(t,this.differsObj);var s=differs(this.differsObj,{});l!=s&&(this.isChanged=s,a(s,this))};v.call(d,function(a){void 0===a.hasAttribute&&(a.hasAttribute=function(e){return void 0!==this[e]}),function(){(!a.type||"hidden"!=a.type&&"disabled"!=a.type)&&(a.setAttribute("tabindex",++ct),a.formIndex=a.formIndex||ct)}();var r=a.name,l=vt.get(r,t);if(e[r]){void 0===l&&(l=void 0!==e[r].defaultVal?e[r].defaultVal:"");for(var s in e[r]){var c=null;switch(s){case X:case $:if(a.length)for(var f,v=0;f=a[v];v++)f.setAttribute(s,"1");else a.setAttribute(s,"1");break;case U:c=e[r][s];for(var h in c)a.setAttribute(h,c[h]);break;case G:if(c=e[r][s],"string"==typeof c)u(a,c);else try{for(var v=0;v<c.length;v++)u(a,c[v])}catch(g){}}}}if(void 0!==l&&(o(a,l),vt.set(r,l,d.currentData)),!a.initialized){var m=function(e){return function(t){i.call(this,t,e,n)}.bind(this)}.call(d,a.name);p(a,"blur",m),p(a,"click",m),p(a,"keyup",m),p(a,"formChange",m),a.initialized=!0}})},d.saveChanges=function(){d.differsObj={},d.initialData=cloneObject(d.currentData),(c.config[V]||f.onChange)(!1,d),d.isChanged=!1},d.resetToDefaults=function(e){var t=c.config[I]||{};v.call(d,function(n){if(t[n.name]){var a=t[n.name].defaultVal;t[n.name]&&void 0!==a&&(o(n,a),vt.set(n.name,a,d.currentData),e&&m&&m(n.name,a))}})},d.getAllValues=function(){return r(d.container)},d.currentData=r(d.container),y(d,c.config[I],!!(c.config[D]&k),!!(c.config[D]&w)),d.initInputs(),c.config[_]&&c.config[_](d),n(d),d.saveChanges(),d.refresh=function(){d.currentData=r(d.container),d.saveChanges()},c.config[T]===rt&&d.validate(),d.remove=function(){Forms.remove(c.config[O])},d.remove(),ft[c.config[O]]=d}}var f={flags:a.flags||0,validationType:a.validationType||Forms.VALIDATION_ON_SUBMIT,hideClass:a.hideClass||"h",errorClass:a.errorClass||"error",warningClass:a.warningClass||"warning",ajax:a.ajax||function(e,t,n,a,i){var r=new XMLHttpRequest;i=i||function(){},r.open(t,e),r.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8"),r.setRequestHeader("X-Requested-With","XMLHttpRequest"),r.send(vt.serialize(n,null)),r.onreadystatechange=function(){200==r.status&&4==r.readyState&&a(r.status,r.response),200!=r.status&&i()}},onChange:a.onChange||function(){},formContext:a.formContext||function(){},fieldContext:a.fieldContext||function(){},submitCallback:a.submitCallback||function(e,t,n){return n(),!0},validateCallback:a.validateCallback||function(){return!0},beforeSubmitCallback:a.beforeSubmitCallback||function(e){return e(),!0},afterSubmitCallback:a.afterSubmitCallback||function(){return!0}},g={methods:{},hideError:function(e){e&&u(e,f.hideClass)},showError:function(e,t){e&&(e.innerHTML=t,d(e,f.hideClass))},field:function(e,t,n,a,i,r){var o=!0,l=!0;if(!n)return l;if(n[W])for(var s in n[W])if(Object.prototype.hasOwnProperty.call(n[W],s)){var f=g.methods[s]||c(s);if(f){if(("required"==s||""!=a&&null!==a&&void 0!==a)&&(o=f[ot](a,n[W][s])),!o){g.showError(e.getErrorContainer(t),f[lt].supplant({val:n[W][s]})),e.elements[t]&&void 0!==e.elements[t].name&&u(e.elements[t],i),l=!1;break}e.notificationContainers[Q][t]&&g.hideError(e.getErrorContainer(t)),e.elements[t]&&void 0!==e.elements[t].name&&d(e.elements[t],i)}}if(n[Y])for(var s in n[Y])if(Object.prototype.hasOwnProperty.call(n[Y],s)){var f=g.methods[s]||c(s);if(f)if(l){if(("required"==s||""!=a&&null!==a&&void 0!==a)&&(o=f[ot](a,n[Y][s])),!o){g.showError(e.getWarningContainer(t),f[st].supplant({val:n[Y][s]})),e.elements[t]&&void 0!==e.elements[t].name&&u(e.elements[t],r);break}e.notificationContainers[K][t]&&g.hideError(e.getWarningContainer(t)),e.elements[t]&&void 0!==e.elements[t].name&&d(e.elements[t],r)}else e.notificationContainers[K][t]&&g.hideError(e.getWarningContainer(t))}return l},process:function(e,t){var n=e.getFormData(1),a=!0;for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&(t[i][W]||t[i][Y])&&(g.field(e,i,t[i],n[i],f.errorClass,f.warningClass)||(a=!1));return a}};if(a.validation)for(var m in a.validation)Object.prototype.hasOwnProperty.call(a.validation,m)&&(g.methods[m]=a.validation[m]);this.create=i}var k=1,w=2,E=4,x=8,O="id",N="obj",D="flags",F="onSubmit",j="beforeSubmit",L="submitCallback",S="afterSubmit",I="fields",T="validationType",M="onFieldChange",V="onChange",_="onInit",R="onValidate",P="validate",z="data",B="params",H="action",U="attributes",q="type",W="validate",G="class",$="bitmask",X="disabled",Y="warning",Z="field",K="warning",Q="error",J="label",et="No configuration passed",tt="Form is initialized already",nt="No such element on the page",at=1,it=2,rt=3,ot=2,lt=0,st=1,ct=0,ut=1,ft={},dt={multiple:["Must be a multiple of {val}","Should be a multiple of {val}",function(e,t){return e%t===0}],email:["Wrong email format","Bad email format",function(e){return/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e)}],"int":["Must be an integer","Should be an integer",function(e){return parseInt(e,10)==e}],"float":["Must be a decimal","Should be a decimal",function(e){return/^-?\d{0,}([\.|\,]\d{0,})?$/.test(e)}],min:["Must be >= {val}","Value is lower than {val}",function(e,t){return(parseFloat(e)||0)>=(parseFloat(t)||0)}],max:["Must be <= {val}","Value is higher than {val}",function(e,t){return(parseFloat(e)||0)<=(parseFloat(t)||0)}],date:["Wrong date format","Bad date format",function(e){return/^([1-9]|0[1-9]|1[012])[- \/.](0[1-9]|[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d$/.test(e)}],length:["Must be {val} characters long","Should be {val} characters long",function(e,t){return e.length==t}],maxLength:["Must be <= {val} characters long","Should be less than {val} characters long",function(e,t){return e.length<=t}],minLength:["Must be >= {val} characters long","Should be more than {val} characters long",function(e,t){return e.length<=t}],required:["Required field","This field is highly recommended to fill",function(e){return!(""==e||null==e||void 0===e)}]},vt={allReg:/\[([a-zA-Z0-9-]*)\]/g,isObjReg:/\[(.*)\]/g,getPath:function(e){var t=e.replace(vt.isObjReg,""),n=[];t&&n.push(t);for(var a;a=vt.allReg.exec(e);)n.push(a[1]);return n},serialize:function(e,t){var n=[];for(var a in e){var i=t?t+"["+a+"]":a,r=e[a];n.push("object"==typeof r&&null!==r?vt.serialize(r,i):encodeURIComponent(i)+"="+(null===r?"":encodeURIComponent(r)))}return n.join("&")},getOrDel:function(e,t,n){var a=this.getPath(e);if(void 0===t||void 0===t[a[0]])return void 0;for(var i,r,o=t,l=0;l<a.length;l++)if(void 0!==o[a[l]]){if(""==o[a[l]])return n?delete o[a[l]]:o[a[l]];i=o,r=a[l],o=o[a[l]]}return n?delete i[r]:o},del:function(e,t){return this.getOrDel(e,t,!0)},get:function(e,t){return this.getOrDel(e,t)},setVal:function(e,t,n){if(e.length){var a=e.shift(),i=e[0],r=n;if(void 0===i){if(""==a)return n.push?void n.push(t):!1;if(void 0===n)return;return void(n[a]=t)}""==a&&(r.push||(r=[]),r.push(""==i?[]:{}),a=r.length-1),r=r[a]="object"==typeof r[a]&&null!==r[a]?r[a]:""==i?[]:{},vt.setVal(e,t,r)}},set:function(e,t,n){var a=this.getPath(e);vt.setVal(a,t,n)}};return function(e,t){void 0!==window.Element&&(e[t]||(e[t]=function(e){return this.querySelectorAll("."+e)},Element.prototype[t]=e[t]))}(document,"getElementsByClassName"),{Form:A,remove:function(e){ft[e]&&delete ft[e]},getList:function(){return ft},VALIDATION_ON_SUBMIT:at,VALIDATION_ON_CHANGE:it,VALIDATION_ON_KEYUP:rt,FLAG_DEBUG:w,FLAG_SUBMIT_EMPTY:E,FLAG_UNIQUE_LABELS:k,FLAG_ASYNC:x}}();