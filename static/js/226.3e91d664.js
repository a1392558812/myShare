(self.webpackChunkblog=self.webpackChunkblog||[]).push([[226],{H55z:function(e){e.exports=e=>{const t=e.renderer.rules.fence;e.renderer.rules.fence=(...e)=>{const n=t(...e);return e=n.slice(n.indexOf("<code>"),n.indexOf("</code>")).split("\n"),e=[...Array(e.length-1)].map(((e,t)=>`<span class="line-number">${t+1}</span><br>`)).join(""),n.replace("\x3c!--beforeend--\x3e",`<div class="line-numbers-wrapper">${e}</div>\x3c!--beforeend--\x3e`).replace("extra-class","line-numbers-mode")}}},"+QRC":function(e,t,n){"use strict";var a=n("E9nw"),l={"text/plain":"Text","text/html":"Url",default:"Text"};e.exports=function(e,t){var n,i,r,o,s=!1;t=t||{};try{var d=a(),c=document.createRange(),u=document.getSelection();if((i=document.createElement("span")).textContent=e,i.style.all="unset",i.style.position="fixed",i.style.top=0,i.style.clip="rect(0, 0, 0, 0)",i.style.whiteSpace="pre",i.style.webkitUserSelect="text",i.style.MozUserSelect="text",i.style.msUserSelect="text",i.style.userSelect="text",i.addEventListener("copy",(function(n){var a;n.stopPropagation(),t.format&&(n.preventDefault(),void 0===n.clipboardData?(window.clipboardData.clearData(),a=l[t.format]||l.default,window.clipboardData.setData(a,e)):(n.clipboardData.clearData(),n.clipboardData.setData(t.format,e))),t.onCopy&&(n.preventDefault(),t.onCopy(n.clipboardData))})),document.body.appendChild(i),c.selectNodeContents(i),u.addRange(c),!document.execCommand("copy"))throw new Error("copy command was unsuccessful");s=!0}catch(i){try{window.clipboardData.setData(t.format||"text",e),t.onCopy&&t.onCopy(window.clipboardData),s=!0}catch(i){r="message"in t?t.message:"Copy to clipboard: #{key}, Enter",o=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C",n=r.replace(/#{\s*key\s*}/g,o),window.prompt(n,e)}}finally{u&&("function"==typeof u.removeRange?u.removeRange(c):u.removeAllRanges()),i&&document.body.removeChild(i),d()}return s}},RoiK:function(e){e.exports=function(e){return e&&e.__esModule?e:{default:e}},e.exports.__esModule=!0,e.exports.default=e.exports},E9nw:function(e){e.exports=function(){var e=document.getSelection();if(!e.rangeCount)return function(){};for(var t=document.activeElement,n=[],a=0;a<e.rangeCount;a++)n.push(e.getRangeAt(a));switch(t.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":t.blur();break;default:t=null}return e.removeAllRanges(),function(){"Caret"===e.type&&e.removeAllRanges(),e.rangeCount||n.forEach((function(t){e.addRange(t)})),t&&t.focus()}}},"4GdV":function(e,t,n){"use strict";n.r(t),n.d(t,{default:function(){return C}});var a=n("XEAi"),l=n("oekR"),i=n("n/QL");const r={class:"width100 height100 markdown-title-inner"},o=(e=>((0,a.dD)("data-v-7d1baa6a"),e=e(),(0,a.Cn)(),e))((()=>(0,a._)("div",{class:"width100 text-align-center markdown-title-navigator"}," 标题导航 ",-1))),s=["onClick"];var d=n("gw9Z"),c=n("EVdn");const u={name:"NavigatorTitle",props:{ifLarger:{type:Boolean,default:!0},markdownTitleWidth:{type:String,default:"10px"},articleTitles:{type:Array,default:()=>[]},headerH:{type:String,default:"70px"}},setup(e,{emit:t}){const n=(0,l.iH)(0),i=(0,l.iH)(0);return(0,a.bv)((()=>{n.value=e.ifLarger?(()=>{const e=document.createElement("div");e.style.width="100px",e.style.position="absolute",e.style.top="-9999px",document.body.appendChild(e);var t=e.offsetWidth;e.style.overflow="scroll";const n=document.createElement("div");n.style.width="100%",e.appendChild(n);var a=n.offsetWidth;return document.body.removeChild(e),t-a})():0,i.value=c(".home").height()})),{barWidth:n,articleTitlesHeight:i,handleAnchorClick:e=>{t("handleAnchorClick",e)}}}},h=()=>{(0,d.sj)((e=>({af2f3a08:e.markdownTitleWidth,b0844348:e.headerH})))},p=u.setup;u.setup=p?(e,t)=>(h(),p(e,t)):h,t=u;var m=n("uaZu"),f=(t=(0,m.Z)(t,[["render",function(e,t,n,l,d,c){return n.articleTitles.length?((0,a.wg)(),(0,a.iD)("div",{key:0,style:(0,i.j5)({right:l.barWidth+"px",height:l.articleTitlesHeight+"px"}),class:"fixed markdown-title"},[(0,a._)("div",r,[o,((0,a.wg)(!0),(0,a.iD)(a.HY,null,(0,a.Ko)(n.articleTitles,((e,t)=>((0,a.wg)(),(0,a.iD)("div",{key:t,class:"markdown-title-item",style:(0,i.j5)({padding:`10px 0 10px ${20*e.indent}px`})},[(0,a._)("a",{style:{cursor:"pointer"},onClick:t=>l.handleAnchorClick(e)},(0,i.zw)(e.title),9,s)],4)))),128))])],4)):(0,a.kq)("",!0)}],["__scopeId","data-v-7d1baa6a"]]),n("GbPD")),g=(f=n.n(f),n("YDpD")),v=(g=n.n(g),n("FIf5")),y=(v=n.n(v),n("3vcW")),w=n("nTDo"),x=n("EVdn"),C=(f().use(g(),{Hljs:v()}),f().use((0,y.Z)()),f().use((0,w.Z)()),n={name:"Markdown",components:{navigatorTitle:t,VMdPreview:f()},props:{headerH:{type:String,default:"70px"},loading:{type:Boolean,default:!0},ifLarger:{type:Boolean,default:!0},htmlMD:{type:String,default:""},markdownTitleWidth:{type:String,default:""},title:{type:String,default:""}},setup(e){const t=(0,l.iH)(null),n=(0,l.iH)([]),i=(0,l.iH)("calc(100% - 170px)"),r=()=>{i.value=`calc(100% - ${100+x(".home .title").outerHeight()}px)`};return(0,a.YP)((()=>e.htmlMD),(()=>(0,a.Y3)().then((()=>{{var e=t.value.$el.querySelectorAll("h1,h2,h3,h4,h5,h6");const a=Array.from(e).filter((e=>!!e.innerText.trim()));if(a.length){const e=Array.from(new Set(a.map((e=>e.tagName)))).sort();n.value=a.map((t=>({title:t.innerText,lineIndex:t.getAttribute("data-v-md-line"),indent:e.indexOf(t.tagName)})))}else n.value=[];return}})))),(0,a.YP)((()=>e.title),(()=>{r()})),(0,a.bv)(r),{preview:t,articleTitles:n,markdownMinHeight:i,handelClick:e=>{let t=x(e.target);if(t.hasClass("v-md-copy-code-btn")){let e=t.html(),n={width:t.width(),height:t.height(),lineHeight:t.css("line-height")};t.html("复制成功"),t.css({width:"5em",height:"2em",lineHeight:"1.5em",transition:"all 0.3s"}),setTimeout((()=>{t.css(n),t.html(e),t=null,e=null,n=null}),1e3)}else t=null},handleCopyCodeSuccess:e=>{},handleAnchorClick:e=>{e=e.lineIndex;let n=t.value.$el.querySelector(`[data-v-md-line="${e}"]`);n&&t.value.scrollToTarget({target:n,scrollContainer:x(".home")[0],top:30}),n=null}}},render(){return(0,a.Wm)(a.HY,null,[(0,a.Wm)("div",{style:this.ifLarger&&this.articleTitles.length?{width:`calc(100% - ${this.markdownTitleWidth})`}:{width:"100%"},className:"title flex align-items-center justify-content-center"},[this.title]),(0,a.wy)((0,a.Wm)("div",{className:"relative markdown",style:{minHeight:this.markdownMinHeight}},[this.loading?null:(0,a.Wm)("div",{className:"flex height100"},[(0,a.Wm)((0,a.up)("v-md-preview"),{style:this.ifLarger&&this.articleTitles.length?{width:`calc(100% - ${this.markdownTitleWidth})`}:{width:"100%"},onClick:this.handelClick,"onCopy-code-success":this.handleCopyCodeSuccess,ref:"preview",text:this.htmlMD},null),this.ifLarger?(0,a.Wm)((0,a.up)("navigator-title"),{ifLarger:this.ifLarger,markdownTitleWidth:this.markdownTitleWidth,articleTitles:this.articleTitles,onHandleAnchorClick:e=>{this.handleAnchorClick(e)}},null):null])]),[[(0,a.Q2)("loading"),this.loading]])])}},(0,m.Z)(n,[["__scopeId","data-v-0597a93a"]]))}}]);