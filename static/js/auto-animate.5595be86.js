"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[3036],{"Bx/C":function(e,t,n){n.d(t,{BP:function(){return u},K0:function(){return a},NP:function(){return s},Pc:function(){return i},Uj:function(){return r},_G:function(){return o},ar:function(){return d},e4:function(){return c},se:function(){return l},wm:function(){return f}}),n("60oc"),n("kvaN"),n("o5/U"),n("pacc"),n("vDqi");const r=[{suffix:"md",formatFun:e=>e},{suffix:"js",formatFun:e=>"```javascript\n"+e+"\n```"},{suffix:"ts",formatFun:e=>"```typescript\n"+e+"\n```"},{suffix:"jsx",formatFun:e=>"```jsx\n"+e+"\n```"},{suffix:"html",formatFun:e=>"```html\n"+e+"\n```"},{suffix:"css",formatFun:e=>"```css\n"+e+"\n```"},{suffix:"less",formatFun:e=>"```less\n"+e+"\n```"},{suffix:"scss",formatFun:e=>"```scss\n"+e+"\n```"},{suffix:"py",formatFun:e=>"```python\n"+e+"\n```"},{suffix:"json",formatFun:e=>"```json\n"+e+"\n```"},{suffix:"ejs",formatFun:e=>"```ejs\n"+e+"\n```"},{suffix:"vue",formatFun:e=>"```html\n"+e+"\n```"}],o=e=>r.filter((t=>t.suffix===e)).length,a=e=>["jpg","png","gif","jpeg"].filter((t=>t===e)).length,i=(e,t=0,n)=>{if(0===(a=e.children("h3")).length)return 0<(r=e.children("a")).length?Object.freeze({name:r.text(),href:r.attr("href"),...r.attr("icon")?{icon:r.attr("icon")}:{}}):null;var r=a.text(),o=[],a={ifRender:!1,ifShow:!1},l=e.children("dl").children("dt");for(let e=0;e<l.length;e++){var d=i(l.eq(e));o.push(d)}return a.name=r,a.child=o,a},l=(e,t)=>Math.round(Math.random()*(t-e)+e),d=()=>window.location.origin+window.location.pathname,u=e=>new Promise((t=>{var n=new FileReader;n.readAsDataURL(e),n.onload=e=>{t(e.target.result)}})),s=(e=!0)=>{var t=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];if(e){let e="#";for(let n=0;n<6;n++)e+=t[Math.floor(Math.random()*t.length)];return e}return`rgb(${Math.floor(256*Math.random())},${Math.floor(256*Math.random())},${Math.floor(256*Math.random())})`},c=e=>{const t="data-loadtype",n="asyncloadjs";return new Promise(((r,o)=>{if(!document)return o(new Error("document not find"));let a=document.querySelector(`script[src="${e}"][${t}="${n}"]`);a&&(a.parentNode.removeChild(a),a=null),(a=document.createElement("script")).type="text/javascript",a.src=e,a.setAttribute(t,n),document.head.appendChild(a),a.onload=e=>{r()},a.onerror=e=>{o(new Error(e))}}))},f=e=>{const t="data-loadtype",n="asyncloadcss";return new Promise(((r,o)=>{if(!document)return o(new Error("document not find"));let a=document.querySelector(`link[href="${e}"][${t}="${n}"]`);a&&(a.parentNode.removeChild(a),a=null),(a=document.createElement("link")).href=e,a.rel="stylesheet",a.type="text/css",a.setAttribute(t,n),document.head.appendChild(a),a.onload=()=>{r()},a.onerror=e=>{o(new Error(e))}}))}},BkxM:function(e,t,n){n.r(t),n.d(t,{default:function(){return G}});var r=n("XEAi"),o=n("n/QL");const a={ref:"content",class:"flex align-items-center flex-wrap"},i=["onClick"];n("60oc");var l=n("oekR");const d=new Set,u=new WeakMap,s=new WeakMap,c=new WeakMap,f=new WeakMap,p=new WeakMap,h=new WeakMap,m=new WeakMap,g=new WeakSet;let v,x=0,w=0;const b="__aa_tgt",y="__aa_del",k="__aa_new";t=e=>{e=!e.reduce(((e,t)=>[...e,...Array.from(t.addedNodes),...Array.from(t.removedNodes)]),[]).every((e=>"#comment"===e.nodeName))&&e.reduce(((e,t)=>{if(!1===e)return!1;if(t.target instanceof Element){if(S(t.target),!e.has(t.target)){e.add(t.target);for(let r=0;r<t.target.children.length;r++){var n=t.target.children.item(r);if(n){if(y in n)return!1;S(t.target,n),e.add(n)}}}if(t.removedNodes.length)for(let n=0;n<t.removedNodes.length;n++){var r=t.removedNodes[n];if(y in r)return!1;r instanceof Element&&(e.add(r),S(t.target,r),s.set(r,[t.previousSibling,t.nextSibling]))}}return e}),new Set),e&&e.forEach((e=>{var t,n=e.isConnected,r=u.has(e);n&&s.has(e)&&s.delete(e),c.has(e)&&null!=(t=c.get(e))&&t.cancel(),(k in e?P:r&&n?function(e){var t=u.get(e),n=T(e);if(!z(e))return u.set(e,n);let r;var o,a,i,l,d,s,f;t&&("function"!=typeof(o=F(e))?(d=t.left-n.left,s=t.top-n.top,[f,a,i,l]=W(e,t,n),d={transform:`translate(${d}px, ${s}px)`},s={transform:"translate(0, 0)"},f!==a&&(d.width=f+"px",s.width=a+"px"),i!==l&&(d.height=i+"px",s.height=l+"px"),r=e.animate([d,s],{duration:o.duration,easing:o.easing})):([f]=N(o(e,"remain",t,n)),(r=new Animation(f)).play()),c.set(e,r),u.set(e,n),r.addEventListener("finish",C.bind(null,e)))}:r&&!n?function(e){if(s.has(e)&&u.has(e)){var[t,n]=s.get(e),r=(Object.defineProperty(e,y,{value:!0,configurable:!0}),window.scrollX),o=window.scrollY;if(n&&n.parentNode&&n.parentNode instanceof Element?n.parentNode.insertBefore(e,n):t&&t.parentNode?t.parentNode.appendChild(e):null!=(n=_(e))&&n.appendChild(e),!z(e))return B(e);var[t,n,a,i]=function(e){var t=u.get(e),[n,,r]=W(e,t,T(e));let o=e.parentElement;for(;o&&("static"===getComputedStyle(o).position||o instanceof HTMLBodyElement);)o=o.parentElement;o=o||document.body,e=getComputedStyle(o);var a=u.get(o)||T(o);return[Math.round(t.top-a.top)-L(e.borderTopWidth),t=Math.round(t.left-a.left)-L(e.borderLeftWidth),n,r]}(e),l=F(e),d=u.get(e);r===x&&o===w||function(e,t,n,r){const o=x-t,a=w-n,i=document.documentElement.style.scrollBehavior;if("smooth"===getComputedStyle(v).scrollBehavior&&(document.documentElement.style.scrollBehavior="auto"),window.scrollTo(window.scrollX+o,window.scrollY+a),e.parentElement){const t=e.parentElement;let n=t.clientHeight,o=t.clientWidth;const a=performance.now();!function e(){requestAnimationFrame((()=>{if(!O(r)){const l=n-t.clientHeight,d=o-t.clientWidth;a+r.duration>performance.now()?(window.scrollTo({left:window.scrollX-d,top:window.scrollY-l}),n=t.clientHeight,o=t.clientWidth,e()):document.documentElement.style.scrollBehavior=i}}))}()}}(e,r,o,l);let f,p={position:"absolute",top:t+"px",left:n+"px",width:a+"px",height:i+"px",margin:"0",pointerEvents:"none",transformOrigin:"center",zIndex:"100"};O(l)?([r,o]=N(l(e,"remove",d)),!1!==(null==o?void 0:o.styleReset)&&(p=(null==o?void 0:o.styleReset)||p,Object.assign(e.style,p)),(f=new Animation(r)).play()):(Object.assign(e.style,p),f=e.animate([{transform:"scale(1)",opacity:1},{transform:"scale(.98)",opacity:0}],{duration:l.duration,easing:"ease-out"})),c.set(e,f),f.addEventListener("finish",B.bind(null,e,p))}}:P)(e)}))};var E=e=>{e.forEach((e=>{e.target===v&&(clearTimeout(m.get(v)),m.set(v,setTimeout((()=>{d.forEach((e=>A(e,(e=>j((()=>C(e)))))))}),100))),u.has(e.target)&&C(e.target)}))};function C(e){clearTimeout(m.get(e));var t=O(t=F(e))?500:t.duration;m.set(e,setTimeout((async()=>{var t=c.get(e);try{await(null==t?void 0:t.finished),u.set(e,T(e));{var n=e;null!=(r=f.get(n))&&r.disconnect();let t=u.get(n),a=0;t||(t=T(n),u.set(n,t));var{offsetWidth:r,offsetHeight:o}=v,r=[t.top-5,r-(t.left+5+t.width),o-(t.top+5+t.height),t.left-5].map((e=>-1*Math.floor(e)+"px")).join(" ");return(o=new IntersectionObserver((()=>{1<++a&&C(n)}),{root:v,threshold:1,rootMargin:r})).observe(n),void f.set(n,o)}}catch{}}),t))}function M(e){setTimeout((()=>{p.set(e,setInterval((()=>j(C.bind(null,e))),2e3))}),Math.round(2e3*Math.random()))}function j(e){("function"==typeof requestIdleCallback?requestIdleCallback:requestAnimationFrame)((()=>e()))}let I,R;function S(e,t){t||b in e?!t||b in t||Object.defineProperty(t,b,{value:e}):Object.defineProperty(e,b,{value:e})}function L(e){return Number(e.replace(/[^0-9.\-]/g,""))}function T(e){var t=e.getBoundingClientRect(),{x:e,y:n}=function(e){let t=e.parentElement;for(;t;){if(t.scrollLeft||t.scrollTop)return{x:t.scrollLeft,y:t.scrollTop};t=t.parentElement}return{x:0,y:0}}(e);return{top:t.top+n,left:t.left+e,width:t.width,height:t.height}}function W(e,t,n){let r=t.width,o=t.height,a=n.width,i=n.height;return"content-box"===(t=getComputedStyle(e)).getPropertyValue("box-sizing")&&(n=L(t.paddingTop)+L(t.paddingBottom)+L(t.borderTopWidth)+L(t.borderBottomWidth),r-=e=L(t.paddingLeft)+L(t.paddingRight)+L(t.borderRightWidth)+L(t.borderLeftWidth),a-=e,o-=n,i-=n),[r,a,o,i].map(Math.round)}function F(e){return b in e&&h.has(e[b])?h.get(e[b]):{duration:250,easing:"ease-in-out"}}function _(e){if(b in e)return e[b]}function z(e){return(e=_(e))&&g.has(e)}function A(e,...t){t.forEach((t=>t(e,h.has(e))));for(let n=0;n<e.children.length;n++){const r=e.children.item(n);r&&t.forEach((e=>e(r,h.has(r))))}}function N(e){return Array.isArray(e)?e:[e]}function O(e){return"function"==typeof e}function P(e){k in e&&delete e[k];var t=T(e),n=(u.set(e,t),F(e));if(z(e)){let r;"function"!=typeof n?r=e.animate([{transform:"scale(.98)",opacity:0},{transform:"scale(0.98)",opacity:0,offset:.5},{transform:"scale(1)",opacity:1}],{duration:1.5*n.duration,easing:"ease-in"}):([n]=N(n(e,"add",t)),(r=new Animation(n)).play()),c.set(e,r),r.addEventListener("finish",C.bind(null,e))}}function B(e,t){var n;e.remove(),u.delete(e),s.delete(e),c.delete(e),null!=(n=f.get(e))&&n.disconnect(),setTimeout((()=>{if(y in e&&delete e[y],Object.defineProperty(e,k,{value:!0,configurable:!0}),t&&e instanceof HTMLElement)for(const n in t)e.style[n]=""}),0)}function $(e,t={}){return I&&R&&(window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!O(t)&&!t.disrespectUserMotionPreference||(g.add(e),"static"===getComputedStyle(e).position&&Object.assign(e.style,{position:"relative"}),A(e,C,M,(e=>null==R?void 0:R.observe(e))),O(t)?h.set(e,t):h.set(e,{duration:250,easing:"ease-in-out",...t}),I.observe(e,{childList:!0}),d.add(e))),Object.freeze({parent:e,enable:()=>{g.add(e)},disable:()=>{g.delete(e)},isEnabled:()=>g.has(e)})}function K(e){const t=(0,l.KR)();let n;return(0,r.sV)((()=>{(0,r.nT)((()=>{t.value instanceof HTMLElement&&(n=$(t.value,e||{}))}))})),[t,function(e){n&&(e?n.enable():n.disable())}]}"undefined"!=typeof window&&"ResizeObserver"in window&&(v=document.documentElement,I=new MutationObserver(t),R=new ResizeObserver(E),window.addEventListener("scroll",(()=>{w=window.scrollY,x=window.scrollX})),R.observe(v)),t={setup(){var[e]=K({duration:200});const t=(0,l.KR)([0,1,2,3,4]);return{content:e,list:t,addItem:()=>{t.value.push(t.value.length)},deleteItem:e=>{t.value=t.value.filter(((t,n)=>n!==e))}}}};var X=(0,(E=n("uaZu")).A)(t,[["render",function(e,t,n,l,d,u){return(0,r.uX)(),(0,r.CE)("div",null,[(0,r.Lk)("button",{onClick:t[0]||(t[0]=(...e)=>l.addItem&&l.addItem(...e))},"添加一个item"),(0,r.Lk)("div",a,[((0,r.uX)(!0),(0,r.CE)(r.FK,null,(0,r.pI)(l.list,((e,t)=>((0,r.uX)(),(0,r.CE)("div",{class:"item cursor-pointer",onClick:e=>l.deleteItem(t),key:e},(0,o.v_)(e),9,i)))),128))],512)])}],["__scopeId","data-v-1afed417"]]);const U={ref:"content",style:{background:"red"}};var H=n("Bx/C"),q=(0,E.A)({setup(){var[e]=K({duration:300});const t=()=>({height:(0,H.se)(50,300)+"px"}),n=(0,l.KR)(!1),r=(0,l.KR)(t());return{iframe:(0,l.KR)(null),content:e,ifExpand:n,expandStyle:r,toggleExpand:()=>{n.value=!n.value,n.value&&Object.assign(r.value,t())}}}},[["render",function(e,t,n,a,i,l){return(0,r.uX)(),(0,r.CE)("div",null,[(0,r.Lk)("button",{onClick:t[0]||(t[0]=(...e)=>a.toggleExpand&&a.toggleExpand(...e))},"不定高展开"),(0,r.Lk)("div",U,[a.ifExpand?((0,r.uX)(),(0,r.CE)("div",{key:0,style:(0,o.Tr)(a.expandStyle)},"当前随机高度: "+(0,o.v_)(a.expandStyle),5)):(0,r.Q3)("",!0)],512)])}]]);const D=["data-index"];var V={__name:"test3",setup(e){const t=(0,l.KR)(0),n=(0,l.KR)(0),a=(0,l.KR)([[{width:"100px",height:"100px",left:"0px",top:"0px",background:"red",zIndex:3},{width:"100px",height:"200px",left:"10px",top:"10px",background:"rgba(85,155,53,1)",zIndex:3,borderRadius:"40px"},{width:"200px",height:"100px",left:"20px",top:"0px",background:"red",zIndex:3,borderRadius:"10px"}],[{width:"200px",height:"200px",left:"0px",top:"0px",background:"green",zIndex:2},{width:"50px",height:"50px",left:"90px",top:"0px",background:"green",zIndex:2},{width:"200px",height:"300px",left:"180px",top:"30px",background:"green",zIndex:2}],[{width:"400px",height:"400px",left:"0px",top:"0px",background:"yellow",zIndex:1},{width:"200px",height:"200px",left:"30px",top:"60px",background:"pink",zIndex:1,borderRadius:"999999px"},{width:"100px",height:"400px",left:"20px",top:"20px",background:"yellow",zIndex:1,borderRadius:"40px"}]]),[i]=K(((e,r,o,i)=>{let l;var d,u,s,c;return"add"===r&&(l=[a.value[e.dataset.index][n.value],a.value[e.dataset.index][t.value]]),"remove"===r&&(l=[{display:"none"},{display:"none"}]),"remain"===r&&(r=o.left-i.left,c=o.top-i.top,[o,i,d,u]=W(e,o,i),s={transform:`translate(${r}px, ${c}px)`},r={transform:`translate(${-.15*r}px, ${-.15*c}px)`,offset:.75},c={transform:"translate(0, 0)"},o!==i&&(s.width=o+"px",r.width=(i<=o?i/1.05:1.05*i)+"px",c.width=i+"px"),d!==u&&(s.height=d+"px",r.height=(u<=d?u/1.05:1.05*u)+"px",c.height=u+"px"),l=[s,r,c]),new KeyframeEffect(e,l,{duration:600,easing:"ease-out"})}));function d(){n.value=t.value,2===t.value?t.value=0:t.value=t.value+1}return(e,n)=>((0,r.uX)(),(0,r.CE)("div",null,[(0,r.Lk)("button",{onClick:d},"切换"),(0,r.Lk)("div",{class:"relative width100",ref_key:"parent",ref:i},[((0,r.uX)(!0),(0,r.CE)(r.FK,null,(0,r.pI)(a.value,((e,n)=>((0,r.uX)(),(0,r.CE)("div",{class:"absolute","data-index":n,style:(0,o.Tr)(e[t.value]),key:t.value+"-"+n},null,12,D)))),128))],512)]))}};const Y={class:"flex flex-direction-column align-items-center justify-content-center"},Q=(e=>((0,r.Qi)("data-v-7206b7f2"),e=e(),(0,r.jt)(),e))((()=>(0,r.Lk)("div",{class:"title"},"auto-animate自动过渡动画",-1)));var G=(0,E.A)({__name:"index",setup(e){return(e,t)=>((0,r.uX)(),(0,r.CE)("div",Y,[Q,(0,r.bF)(X,{style:{"margin-bottom":"20px",width:"500px"}}),(0,r.bF)(q,{style:{"margin-bottom":"20px",width:"500px"}}),(0,r.bF)(V,{style:{"margin-bottom":"20px",width:"500px"}})]))}},[["__scopeId","data-v-7206b7f2"]])},kWh2:function(e,t,n){var r=n("dxB+"),o=n("hgw9"),a=n("wnEH"),i=n("vHVK")("toStringTag"),l=Object,d="Arguments"===a(function(){return arguments}());e.exports=r?a:function(e){var t;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(t=function(e,t){try{return e[t]}catch(e){}}(e=l(e),i))?t:d?a(e):"Object"===(t=a(e))&&o(e.callee)?"Arguments":t}},"5u0C":function(e,t,n){var r=n("lMFB"),o=n("iAz1");e.exports=function(e,t,n){return n.get&&r(n.get,t,{getter:!0}),n.set&&r(n.set,t,{setter:!0}),o.f(e,t,n)}},"dxB+":function(e,t,n){var r={};r[n("vHVK")("toStringTag")]="z",e.exports="[object z]"===String(r)},"/uDU":function(e,t,n){var r=n("kWh2"),o=String;e.exports=function(e){if("Symbol"===r(e))throw new TypeError("Cannot convert a Symbol value to a string");return o(e)}},"0MaD":function(e){var t=TypeError;e.exports=function(e,n){if(e<n)throw new t("Not enough arguments");return e}},kvaN:function(e,t,n){var r=n("P6Ci"),o=n("VWI/"),a=n("/uDU"),i=n("0MaD"),l=(n=URLSearchParams).prototype,d=o(l.append),u=o(l.delete),s=o(l.forEach),c=o([].push);(o=new n("a=1&a=2&b=3")).delete("a",1),o.delete("b",void 0),o+""!="a=2"&&r(l,"delete",(function(e){var t=arguments.length,n=t<2?void 0:arguments[1];if(t&&void 0===n)return u(this,e);for(var r,o=[],l=(s(this,(function(e,t){c(o,{key:t,value:e})})),i(t,1),a(e)),f=a(n),p=0,h=0,m=!1,g=o.length;p<g;)r=o[p++],m||r.key===l?(m=!0,u(this,r.key)):h++;for(;h<g;)(r=o[h++]).key===l&&r.value===f||d(this,r.key,r.value)}),{enumerable:!0,unsafe:!0})},"o5/U":function(e,t,n){var r=n("P6Ci"),o=n("VWI/"),a=n("/uDU"),i=n("0MaD"),l=(n=URLSearchParams).prototype,d=o(l.getAll),u=o(l.has);!(o=new n("a=1")).has("a",2)&&o.has("a",void 0)||r(l,"has",(function(e){var t=arguments.length,n=t<2?void 0:arguments[1];if(t&&void 0===n)return u(this,e);for(var r=d(this,e),o=(i(t,1),a(n)),l=0;l<r.length;)if(r[l++]===o)return!0;return!1}),{enumerable:!0,unsafe:!0})},pacc:function(e,t,n){var r=n("S4+I"),o=n("VWI/"),a=(n=n("5u0C"),URLSearchParams.prototype),i=o(a.forEach);!r||"size"in a||n(a,"size",{get:function(){var e=0;return i(this,(function(){e++})),e},configurable:!0,enumerable:!0})}}]);