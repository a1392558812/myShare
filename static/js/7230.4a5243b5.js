(self.webpackChunkblog=self.webpackChunkblog||[]).push([[7230],{H55z:function(e){e.exports=e=>{const t=e.renderer.rules.fence;e.renderer.rules.fence=(...e)=>{var i=(e=t(...e)).slice(e.indexOf("<code>"),e.indexOf("</code>")).split("\n");return i=[...Array(i.length-1)].map(((e,t)=>`<span class="line-number">${t+1}</span><br>`)).join(""),e.replace("\x3c!--beforeend--\x3e",`<div class="line-numbers-wrapper">${i}</div>\x3c!--beforeend--\x3e`).replace("extra-class","line-numbers-mode")}}},"+QRC":function(e,t,i){"use strict";var l=i("E9nw"),a={"text/plain":"Text","text/html":"Url",default:"Text"};e.exports=function(e,t){var i,n,r,o,s=!1;t=t||{};try{var d=l(),c=document.createRange(),u=document.getSelection();if((n=document.createElement("span")).textContent=e,n.ariaHidden="true",n.style.all="unset",n.style.position="fixed",n.style.top=0,n.style.clip="rect(0, 0, 0, 0)",n.style.whiteSpace="pre",n.style.webkitUserSelect="text",n.style.MozUserSelect="text",n.style.msUserSelect="text",n.style.userSelect="text",n.addEventListener("copy",(function(i){var l;i.stopPropagation(),t.format&&(i.preventDefault(),void 0===i.clipboardData?(window.clipboardData.clearData(),l=a[t.format]||a.default,window.clipboardData.setData(l,e)):(i.clipboardData.clearData(),i.clipboardData.setData(t.format,e))),t.onCopy&&(i.preventDefault(),t.onCopy(i.clipboardData))})),document.body.appendChild(n),c.selectNodeContents(n),u.addRange(c),!document.execCommand("copy"))throw new Error("copy command was unsuccessful");s=!0}catch(n){try{window.clipboardData.setData(t.format||"text",e),t.onCopy&&t.onCopy(window.clipboardData),s=!0}catch(n){r="message"in t?t.message:"Copy to clipboard: #{key}, Enter",o=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C",i=r.replace(/#{\s*key\s*}/g,o),window.prompt(i,e)}}finally{u&&("function"==typeof u.removeRange?u.removeRange(c):u.removeAllRanges()),n&&document.body.removeChild(n),d()}return s}},E9nw:function(e){e.exports=function(){var e=document.getSelection();if(!e.rangeCount)return function(){};for(var t=document.activeElement,i=[],l=0;l<e.rangeCount;l++)i.push(e.getRangeAt(l));switch(t.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":t.blur();break;default:t=null}return e.removeAllRanges(),function(){"Caret"===e.type&&e.removeAllRanges(),e.rangeCount||i.forEach((function(t){e.addRange(t)})),t&&t.focus()}}},KhpA:function(e,t,i){"use strict";i.r(t),i.d(t,{default:function(){return w}});var l=i("XEAi"),a=i("oekR"),n=i("n/QL");const r=(e=>((0,l.dD)("data-v-448d850d"),e=e(),(0,l.Cn)(),e))((()=>(0,l._)("div",{class:"width100 text-align-center markdown-title-navigator"}," 标题导航 ",-1))),o=["onClick"];var s=i("gw9Z"),d=i("EVdn");t={name:"NavigatorTitle",props:{ifLarger:{type:Boolean,default:!0},markdownTitleWidth:{type:String,default:"10px"},articleTitles:{type:Array,default:()=>[]},headerH:{type:String,default:"70px"}},setup(e,{emit:t}){const i=(0,a.iH)(0),n=(0,a.iH)(0);return(0,l.bv)((()=>{var t,l,a;i.value=e.ifLarger?((t=document.createElement("div")).style.width="100px",t.style.position="absolute",t.style.top="-9999px",document.body.appendChild(t),l=t.offsetWidth,t.style.overflow="scroll",(a=document.createElement("div")).style.width="100%",t.appendChild(a),a=a.offsetWidth,document.body.removeChild(t),l-a):0,n.value=d(".home").height()})),{barWidth:i,articleTitlesHeight:n,handleAnchorClick:e=>{t("handleAnchorClick",e)}}}};const c=()=>{(0,s.sj)((e=>({d089c520:e.markdownTitleWidth,"8351b730":e.headerH})))},u=t.setup;t.setup=u?(e,t)=>(c(),u(e,t)):c;var h=i("uaZu"),p=(t=(0,h.Z)(t,[["render",function(e,t,i,a,s,d){return i.articleTitles.length?((0,l.wg)(),(0,l.iD)("div",{key:0,style:(0,n.j5)({right:a.barWidth+"px",height:a.articleTitlesHeight+"px"}),class:"fixed flex-shrink-0 markdown-title"},[(0,l._)("div",{class:(0,n.C_)([i.ifLarger?"scroll-bar-y":"","width100 height100 markdown-title-inner"])},[r,((0,l.wg)(!0),(0,l.iD)(l.HY,null,(0,l.Ko)(i.articleTitles,((e,t)=>((0,l.wg)(),(0,l.iD)("div",{key:t,class:"markdown-title-item",style:(0,n.j5)({padding:`10px 0 10px ${20*e.indent}px`})},[(0,l._)("a",{style:{cursor:"pointer"},onClick:t=>a.handleAnchorClick(e)},(0,n.zw)(e.title),9,o)],4)))),128))],2)],4)):(0,l.kq)("",!0)}],["__scopeId","data-v-448d850d"]]),i("GbPD")),m=(p=i.n(p),i("YDpD")),f=(m=i.n(m),i("FIf5")),g=(f=i.n(f),i("3vcW")),v=i("nTDo"),y=i("EVdn"),w=(p().use(m(),{Hljs:f()}),p().use((0,g.Z)()),p().use((0,v.Z)()),i={name:"Markdown",components:{navigatorTitle:t,VMdPreview:p()},props:{headerH:{type:String,default:"70px"},loading:{type:Boolean,default:!0},ifLarger:{type:Boolean,default:!0},htmlMD:{type:String,default:""},markdownTitleWidth:{type:String,default:""},title:{type:String,default:""}},setup(e){const t=(0,a.iH)(null),i=(0,a.iH)([]),n=(0,a.iH)("calc(100% - 170px)"),r=()=>{if(t.value){var e=t.value.$el.querySelectorAll("h1,h2,h3,h4,h5,h6");if((e=Array.from(e).filter((e=>!!e.innerText.trim()))).length){const t=Array.from(new Set(e.map((e=>e.tagName)))).sort();i.value=e.map((e=>({title:e.innerText,lineIndex:e.getAttribute("data-v-md-line"),indent:t.indexOf(e.tagName)})))}else i.value=[]}else setTimeout((()=>{r()}))},o=()=>{n.value=`calc(100% - ${100+y(".home .title").outerHeight()}px)`};return(0,l.YP)((()=>e.htmlMD),(()=>(0,l.Y3)().then((()=>{r()}))),{immediate:!0}),(0,l.YP)((()=>e.title),(()=>{o()})),(0,l.bv)(o),{preview:t,articleTitles:i,markdownMinHeight:n,handelClick:e=>{let t=y(e.target);if(t.hasClass("v-md-copy-code-btn")){let e=t.html(),i={width:t.width(),height:t.height(),lineHeight:t.css("line-height")};t.html("复制成功"),t.css({width:"5em",height:"2em",lineHeight:"1.5em",transition:"all 0.3s"}),setTimeout((()=>{t.css(i),t.html(e),t=null,e=null,i=null}),1e3)}else t=null},handleCopyCodeSuccess:e=>{},handleAnchorClick:e=>{e=e.lineIndex,(e=t.value.$el.querySelector(`[data-v-md-line="${e}"]`))&&t.value.scrollToTarget({target:e,scrollContainer:y(".home")[0],top:30})}}},render(){return(0,l.Wm)(l.HY,null,[(0,l.Wm)("div",{style:this.ifLarger&&this.articleTitles.length?{width:`calc(100% - ${this.markdownTitleWidth})`}:{width:"100%"},className:"title flex align-items-center justify-content-center"},[this.title]),(0,l.wy)((0,l.Wm)("div",{className:"relative markdown",style:{minHeight:this.markdownMinHeight}},[this.loading?null:(0,l.Wm)("div",{className:"flex height100"},[(0,l.Wm)((0,l.up)("v-md-preview"),{style:this.ifLarger&&this.articleTitles.length?{width:`calc(100% - ${this.markdownTitleWidth})`}:{width:"100%"},onClick:this.handelClick,"onCopy-code-success":this.handleCopyCodeSuccess,ref:"preview",text:this.htmlMD},null),this.ifLarger?(0,l.Wm)((0,l.up)("navigator-title"),{ifLarger:this.ifLarger,markdownTitleWidth:this.markdownTitleWidth,articleTitles:this.articleTitles,onHandleAnchorClick:e=>{this.handleAnchorClick(e)}},null):null])]),[[(0,l.Q2)("loading"),this.loading]])])}},(0,h.Z)(i,[["__scopeId","data-v-12938ae4"]]))},zyPB:function(e){e.exports=function(e){return e&&e.__esModule?e:{default:e}},e.exports.__esModule=!0,e.exports.default=e.exports}}]);