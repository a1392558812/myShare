"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[7962],{sYlY:function(e,t){t.A={leftSidebarW:{type:String,default:"300px"},ifLarger:{type:Boolean,default:!0},ifShowMenu:{type:Boolean,default:!0},toggleMenu:{type:Function,default:()=>{}},headerH:{type:String,default:"70px"}}},xxr7:function(e,t){let n=null;t.A=function(e,t=500,i=!1){null!==n&&clearTimeout(n),i?(i=!n,n=setTimeout((()=>{n=null}),t),i&&"function"==typeof e&&e()):n=setTimeout((()=>{"function"==typeof e&&e()}),t)}},"Bx/C":function(e,t,n){n.d(t,{BP:function(){return u},K0:function(){return l},NP:function(){return d},Pc:function(){return a},Uj:function(){return i},_G:function(){return r},ar:function(){return s},e4:function(){return c},se:function(){return o},wm:function(){return h}}),n("60oc"),n("kvaN"),n("o5/U"),n("pacc"),n("vDqi");const i=[{suffix:"md",formatFun:e=>e},{suffix:"js",formatFun:e=>"```javascript\n"+e+"\n```"},{suffix:"ts",formatFun:e=>"```typescript\n"+e+"\n```"},{suffix:"jsx",formatFun:e=>"```jsx\n"+e+"\n```"},{suffix:"html",formatFun:e=>"```html\n"+e+"\n```"},{suffix:"css",formatFun:e=>"```css\n"+e+"\n```"},{suffix:"less",formatFun:e=>"```less\n"+e+"\n```"},{suffix:"scss",formatFun:e=>"```scss\n"+e+"\n```"},{suffix:"py",formatFun:e=>"```python\n"+e+"\n```"},{suffix:"json",formatFun:e=>"```json\n"+e+"\n```"},{suffix:"ejs",formatFun:e=>"```ejs\n"+e+"\n```"},{suffix:"vue",formatFun:e=>"```html\n"+e+"\n```"}],r=e=>i.filter((t=>t.suffix===e)).length,l=e=>["jpg","png","gif","jpeg"].filter((t=>t===e)).length,a=(e,t=0,n)=>{if(0===(l=e.children("h3")).length)return 0<(i=e.children("a")).length?Object.freeze({name:i.text(),href:i.attr("href"),...i.attr("icon")?{icon:i.attr("icon")}:{}}):null;var i=l.text(),r=[],l={ifRender:!1,ifShow:!1},o=e.children("dl").children("dt");for(let e=0;e<o.length;e++){var s=a(o.eq(e));r.push(s)}return l.name=i,l.child=r,l},o=(e,t)=>Math.round(Math.random()*(t-e)+e),s=()=>window.location.origin+window.location.pathname,u=e=>new Promise((t=>{var n=new FileReader;n.readAsDataURL(e),n.onload=e=>{t(e.target.result)}})),d=(e=!0)=>{var t=["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];if(e){let e="#";for(let n=0;n<6;n++)e+=t[Math.floor(Math.random()*t.length)];return e}return`rgb(${Math.floor(256*Math.random())},${Math.floor(256*Math.random())},${Math.floor(256*Math.random())})`},c=e=>{const t="data-loadtype",n="asyncloadjs";return new Promise(((i,r)=>{if(!document)return r(new Error("document not find"));let l=document.querySelector(`script[src="${e}"][${t}="${n}"]`);l&&(l.parentNode.removeChild(l),l=null),(l=document.createElement("script")).type="text/javascript",l.src=e,l.setAttribute(t,n),document.head.appendChild(l),l.onload=e=>{i()},l.onerror=e=>{r(new Error(e))}}))},h=e=>{const t="data-loadtype",n="asyncloadcss";return new Promise(((i,r)=>{if(!document)return r(new Error("document not find"));let l=document.querySelector(`link[href="${e}"][${t}="${n}"]`);l&&(l.parentNode.removeChild(l),l=null),(l=document.createElement("link")).href=e,l.rel="stylesheet",l.type="text/css",l.setAttribute(t,n),document.head.appendChild(l),l.onload=()=>{i()},l.onerror=e=>{r(new Error(e))}}))}},"/vCB":function(e,t,n){var i=n("XEAi"),r=n("Bx/C"),l=n("4T8D");const a=(0,i.bF)("div",{style:"min-height: 800px; font-size: 12px; font-weight: bold",class:"width100 relative"},[(0,i.bF)("slot",null,null)]);t.A=(0,i.$V)({loader:()=>new Promise((e=>{const t=(0,r.ar)()+"demo-static/markdown-priview-vuecode/xiyueta/index.js";setTimeout((()=>{const i=Promise.all([n.e(940),n.e(1926),n.e(1061)]).then(n.bind(n,"Oy5v"));(0,r.e4)(t).then((()=>{e(i)}))}),500)})),errorComponent:()=>(0,i.bF)(a,{class:"flex align-items-center justify-content-center"},{default:()=>[(0,i.bF)("div",{style:"font-size: 2.2rem; font-weight: 600; line-height: 1.25; color: var(--global-markdown-body-text-color)"},[(0,i.eW)("加载错误，刷新浏览器试试")])]}),loadingComponent:()=>(0,i.bF)(a,null,{default:()=>[(0,i.bF)(l.A,{style:"background-color: transparent",showModal:!0},{default:()=>[(0,i.bF)("div",{style:"font-weight: bold",class:"width100 height100 flex align-items-center justify-content-center"},[(0,i.eW)("加载中...")])]})]})})},Se7X:function(e,t,n){n.d(t,{A:function(){return j}});var i=n("XEAi"),r=n("oekR"),l=n("yaf4"),a=n("Ip76"),o=(t=n("jZ9z"),n("DTtR")),s=n("LNhG"),u=n("xxr7"),d=n("sYlY"),c=n("nA4H"),h={name:"left-sidebar-item",components:{linkTag:c.A},props:{grade:{type:Number,default:-1},rowDetails:{type:Object,default:()=>({})},menuList:{type:Array,default:()=>[]},ifShow:{type:Boolean,default:!0}},setup(e,{emit:t}){const n=(0,l.Pj)(),r=(0,i.EW)((()=>n.state.menuData.nowActive)),a=(0,i.EW)((()=>e.rowDetails)),o=(0,i.EW)((()=>e.grade+1));var s=(0,i.EW)((()=>!(0!==o.value||!r.value)&&+r.value.split("-")[0]==+a.value.indexPage.split("-")[0]));const u=(0,i.EW)((()=>a.value&&a.value.children?a.value.children:[]));var d=(0,i.EW)((()=>u.value.length?"div":"a")),c=(0,i.EW)((()=>u.value.length?{}:{href:"/#/?indexPage="+a.value.indexPage})),h=(0,i.EW)((()=>({marginLeft:"1em",display:a.value.ifShow?"block":"none"}))),f=(0,i.EW)((()=>{let e="cursor-pointer cell";return a.value.link?e+=" link-cell":e=e+" "+(u.value.length?"list-cell":"display-block item-cell"),r.value!==a.value.indexPage||a.value.children||(e+=" item-active"),e}));return{tag:d,currentGrade:o,renderList:u,hrefMap:c,className:f,titleStyleName:h,ifActiveList:s,listClick:(e,n)=>{e.stopPropagation(),t("listClick",e,n)},itemClick:(e,n,i)=>{e.stopPropagation(),e.preventDefault(),t("itemClick",e,n,i)}}},render(){var e=this.tag;return this.rowDetails&&this.rowDetails.name?(0,i.bF)(e,(0,i.v6)({class:this.className},this.hrefMap,{title:this.rowDetails.name,onClick:e=>{this.renderList.length?this.listClick(e,this.rowDetails):this.itemClick(e,this.menuList,this.rowDetails)},key:this.rowDetails.index}),{default:()=>[this.ifActiveList?(0,i.bF)("div",{class:"list-active"},null):null,(0,i.bF)("div",{onClick:e=>{this.renderList.length?this.listClick(e,this.rowDetails):this.itemClick(e,this.menuList,this.rowDetails)},class:"cell-item-title flex"},[(0,i.bF)("span",{style:"margin-left: 0.5em"},[this.rowDetails.name]),this.renderList.length?(0,i.bF)("svg",{class:"icon flex-shrink-0",style:{transform:`rotate(${this.rowDetails.ifShow?90:0}deg)`,transition:"all 0.3s",width:"1em",height:"1.5em",verticalAlign:"middle",fill:"currentColor",overflow:"hidden"},viewBox:"0 0 1024 1024",version:"1.1",xmlns:"http://www.w3.org/2000/svg","p-id":"34097"},[(0,i.bF)("path",{d:"M349.184 208.384l346.624 261.632c22.528 16.896 27.136 49.152 10.24 71.68-3.072 3.584-6.144 7.168-10.24 10.24l-346.624 261.632c-11.264 8.704-27.136 6.144-35.84-5.12-3.584-4.608-5.12-9.728-5.12-15.36V228.864c0-14.336 11.264-25.6 25.6-25.6 5.12 0 10.752 2.048 15.36 5.12z","p-id":"34098"},null)]):null,this.rowDetails.link?(0,i.bF)(c.A,null,null):null,this.rowDetails.topping?(0,i.bF)("div",{class:"flex-shrink-0 flex align-items-center justify-content-center topping"},[(0,i.bF)("span",null,[(0,i.eW)("置顶")])]):null]),this.rowDetails.ifHadRender?(0,i.bF)("div",{style:this.titleStyleName},[this.renderList.map(((e,t)=>(0,i.bF)((0,i.g2)("left-sidebar-item"),{rowDetails:e,menuList:this.renderList,key:t,ifShow:this.rowDetails.ifShow,grade:this.currentGrade,onListClick:this.listClick,onItemClick:this.itemClick},null)))]):null]}):null}},f=n("uaZu"),m=(0,f.A)(h,[["__scopeId","data-v-1ae1ea08"]]),v=(h=n("zcGJ"),n("gw9Z")),p=n("n/QL"),g=e=>((0,i.Qi)("data-v-34be1217"),e=e(),(0,i.jt)(),e);const w={ref:"target",style:{"z-index":"1"},class:"relative cell list-cell"},y={style:{width:"1em",height:"1em","margin-left":"-2px","vertical-align":"middle",fill:"currentColor",overflow:"hidden"},viewBox:"0 0 1024 1024",version:"1.1",xmlns:"http://www.w3.org/2000/svg","p-id":"27655"},k=[g((()=>(0,i.Lk)("path",{d:"M0 1024h1024v-170.666667H0v170.666667z m0-426.666667h1024V426.666667H0v170.666666z m0-597.333333v170.666667h1024V0H0z","p-id":"27656"},null,-1)))],b={class:"relative width100 height100 flex align-items-center justify-content-space-between"},x={class:"relative"},C={class:"input relative"},L={class:"icon absolute align-center-y",style:{width:"1em",height:"1em","vertical-align":"middle",fill:"currentColor",overflow:"hidden"},viewBox:"0 0 1024 1024",version:"1.1",xmlns:"http://www.w3.org/2000/svg","p-id":"3269"},S=[g((()=>(0,i.Lk)("path",{d:"M416 192C537.6 192 640 294.4 640 416S537.6 640 416 640 192 537.6 192 416 294.4 192 416 192M416 128C256 128 128 256 128 416S256 704 416 704 704 576 704 416 576 128 416 128L416 128zM832 864c-6.4 0-19.2 0-25.6-6.4l-192-192c-12.8-12.8-12.8-32 0-44.8s32-12.8 44.8 0l192 192c12.8 12.8 12.8 32 0 44.8C851.2 864 838.4 864 832 864z","p-id":"3270"},null,-1)))],D={key:0,class:"absolute bg-white drop-down"},F=["href","onClick"];n("60oc");var A=n("KLu4"),M=n("XdTV"),T=n("MLNC"),W=(g={name:"LeftSidebarSearch",components:{commonmBtn:h.A,linkTag:c.A},props:{toggleMenu:{type:Function,default:()=>{}}},setup(e,{emit:t}){const n=(0,l.Pj)(),a=(0,i.EW)((()=>n.state.menuData.menuList)),o=(0,r.KR)(""),s=(0,r.KR)([]),u=(0,T.rd)();var d=(0,r.KR)(null);const c=(0,r.KR)(!1),h=()=>{e.toggleMenu(!1),u.push({path:"/search",query:{key:encodeURI(o.value)?o.value:""}})};return(0,A.X2F)(d,(e=>{c.value=!1})),(0,M.rN)(o,(()=>{if(""===o.value)s.value=[];else{let e=10;const t=[],n=o.value.trim().toLowerCase(),i=r=>{for(let l=0;l<r.length&&e;l++)r[l].children?i(r[l].children):-1!==r[l].name.trim().toLowerCase().indexOf(n)&&(e--,t.push(r[l]))};i(a.value),t.length?(5<=t.length&&t.push({name:"更多....",goSearch:!0}),s.value=t):s.value=[{name:"暂无搜索结果",noResult:!0}]}}),{debounce:600}),{inputValue:o,target:d,searchResult:s,ifShowSearchDropDown:c,goToDetail:(e,n)=>{if(n.preventDefault(),!e.noResult)return e.goSearch?h():void t("itemClick",n,e)},menuListCloseAll:()=>{t("menuListCloseAll")},search:h}}},(0,f.A)(g,[["render",function(e,t,n,r,l,a){const o=(0,i.g2)("linkTag");var s=(0,i.g2)("commonm-btn");return(0,i.uX)(),(0,i.CE)("div",w,[(0,i.Lk)("div",{title:"整理菜单",class:"absolute align-center-y flex align-items-center justify-content-center cursor-pointer menu-list-close",onClick:t[0]||(t[0]=(...e)=>r.menuListCloseAll&&r.menuListCloseAll(...e))},[((0,i.uX)(),(0,i.CE)("svg",y,k))]),(0,i.Lk)("div",b,[(0,i.Lk)("div",x,[(0,i.Lk)("div",C,[((0,i.uX)(),(0,i.CE)("svg",L,S)),(0,i.bo)((0,i.Lk)("input",{"onUpdate:modelValue":t[1]||(t[1]=e=>r.inputValue=e),class:"display-block search-input",type:"text",onFocus:t[2]||(t[2]=e=>r.ifShowSearchDropDown=!0)},null,544),[[v.Jo,r.inputValue]])]),r.searchResult.length&&r.ifShowSearchDropDown?((0,i.uX)(),(0,i.CE)("ul",D,[((0,i.uX)(!0),(0,i.CE)(i.FK,null,(0,i.pI)(r.searchResult,(e=>((0,i.uX)(),(0,i.CE)("li",{key:e,class:(0,p.C4)(["cursor-pointer drop-down-item",e.goSearch?"flex align-items-center justify-content-center more-content":""])},[(0,i.Lk)("a",{class:"drop-down-item-label",href:"/#/?indexPage="+e.indexPage,onClick:function(t){r.goToDetail(e,t)}},[e.link?((0,i.uX)(),(0,i.Wv)(o,{key:0,class:"display-inline"})):(0,i.Q3)("",!0),(0,i.Lk)("span",null,(0,p.v_)(e.name),1)],8,F)],2)))),128))])):(0,i.Q3)("",!0)]),(0,i.bF)(s,{onClick:r.search},{default:(0,i.k6)((()=>[(0,i.eW)(" 搜索 ")])),_:1},8,["onClick"])])],512)}],["__scopeId","data-v-34be1217"]])),P=n("8w0y");a.Ay.use(t.A),a.Ay.use(o.A),a.Ay.use(s.A),g={name:"LeftSidebar",components:{leftSidebarItem:m,leftSidebarSearch:W,commonmBtn:h.A},props:{...d.A},setup(e,{emit:t}){const n=(0,l.Pj)(),o=(0,i.EW)((()=>n.state.menuData.menuList)),s=(0,r.KR)(null),d=(0,r.KR)(null),c=()=>{s.value&&s.value.destroy(),s.value=null};return(0,i.wB)((()=>e.ifLarger),(e=>{n.dispatch(P.XK).then((()=>{e&&o.value.length?(0,i.dY)().then((()=>{c(),s.value=new a.Ay(d.value,{click:!0,observeDOM:!0,bounce:!1,scrollbar:{fade:!1,interactive:!0,scrollbarTrackClickable:!0},mouseWheel:{speed:20,invert:!1,easeTime:300}})})):c()}))}),{immediate:!0}),(0,i.xo)((()=>{c()})),{menuList:o,listContentRef:d,menuListCloseAll:()=>{(0,u.A)((()=>{n.dispatch(P.x5)}),1e3,!0)},sidebarClassName:(0,i.EW)((()=>{let t="left-sidebar flex-shrink-0 bg-white height100";return e.ifLarger?""+t:t+" absolute "+(e.ifShowMenu?"translateX-0":"translateX-100")})),leftSidebarItemClick:(i,r,l)=>{n.dispatch(P.JD,l.indexPage),n.dispatch(P.Dq,l),e.toggleMenu(!1),t("itemClick",l)},leftSidebarListClick:(e,i)=>{n.dispatch(P.g5,i),n.dispatch(P.JD,i.indexPage),t("listClick",i)}}},render(){return(0,i.bF)("div",{class:this.sidebarClassName},[this.menuList.length?(0,i.bF)("div",{class:"flex height100 relative flex-direction-column left-sidebar-content"},[(0,i.bF)(W,{class:"search",toggleMenu:this.toggleMenu,onItemClick:(e,t)=>{this.leftSidebarItemClick(e,[],t)},onMenuListCloseAll:this.menuListCloseAll},null),(0,i.bF)("div",{key:this.ifLarger,class:`flex-1 flex-shrink-0 ${this.ifLarger?"overflow-y-hidden":"overflow-y-auto"} relative list-wrap`},[(0,i.bF)("div",{ref:e=>{this.listContentRef=e},class:"list-content height100 "+(this.ifLarger?"overflow-y-hidden":"")},[(0,i.bF)("div",{style:{padding:"0 0 50px 0"}},[this.menuList.map(((e,t)=>(0,i.bF)(m,{rowDetails:e,key:t,grade:-1,menuList:this.menuList,url:[e.name],onItemClick:(e,t,n)=>{this.leftSidebarItemClick(e,t,n)},onListClick:(e,t)=>{this.leftSidebarListClick(e,t)}},null)))])])])]):null])}};const E=()=>{(0,v.$9)((e=>({"55b091b4":e.leftSidebarW})))},R=g.setup;g.setup=R?(e,t)=>(E(),R(e,t)):E;var j=(0,f.A)(g,[["__scopeId","data-v-24e0882a"]])},nA4H:function(e,t,n){n.d(t,{A:function(){return a}});var i=n("XEAi"),r=n("n/QL");const l={class:"flex-shrink-0 cell-item-link"};t={__name:"link-tag",props:{tagText:{type:String,default:"链接"}},setup(e){return(t,n)=>((0,i.uX)(),(0,i.CE)("div",l,[(0,i.Lk)("span",null,(0,r.v_)(e.tagText),1)]))}};var a=(0,n("uaZu").A)(t,[["__scopeId","data-v-08e22701"]])},sJFK:function(e,t,n){n.r(t),n.d(t,{default:function(){return H}});var i=n("XEAi"),r=n("n/QL");const l={class:"content-inner bg-white overflow-hidden width100 height100 flex flex-direction-row"},a=(e=>((0,i.Qi)("data-v-378e2dd4"),e=e(),(0,i.jt)(),e))((()=>(0,i.Lk)("div",{class:"bg-image overflow-hidden width100 height100 absolute"},null,-1))),o={class:"home overflow-y-auto relative width100 height100"},s={key:0,class:"title width100 flex align-items-center justify-content-center"},u={key:3,class:"link"},d=["href"];n("60oc");var c=n("oekR"),h=n("MLNC"),f=n("yaf4"),m=n("8w0y"),v=n("nfpg"),p=n("Bx/C"),g=(t=n("sYlY"),n("Se7X"));const w={class:"other-type"},y={class:"downLoad-cell"},k={class:"downLoad-cell"},b={class:"downLoad-cell downLoad-wrap flex"},x=["href","download"];var C={name:"OtherType",props:{downloadName:{type:String,default:""},htmlMD:{type:String,default:""}}},L=n("uaZu"),S=(C=(0,L.A)(C,[["render",function(e,t,n,l,a,o){return(0,i.uX)(),(0,i.CE)("div",w,[(0,i.Lk)("div",y," 链接： "+(0,r.v_)(n.htmlMD),1),(0,i.Lk)("div",k," 文件名： "+(0,r.v_)(n.downloadName),1),(0,i.Lk)("div",b,[(0,i.Lk)("a",{class:"display-block downLoad",href:n.htmlMD,download:n.downloadName},"下载",8,x)])])}],["__scopeId","data-v-3b7e8c82"]]),{name:"ImageType",props:{loading:{type:Boolean,default:!0},htmlMD:{type:String,default:""}},emits:["imageLoad"],setup(e,{emit:t}){let n=null;const r=(0,c.KR)(1),l=(0,c.KR)(!1),a=e=>{l.value&&27===e.keyCode&&(l.value=!1)};return(0,i.wB)((()=>e.loading),(e=>{l.value=!1,r.value=1,clearInterval(n),e&&(n=setInterval((()=>{r.value++}),1e3))})),(0,i.sV)((()=>{document.addEventListener("keydown",a)})),(0,i.hi)((()=>{clearInterval(n),document.removeEventListener("keydown",a)})),{imageloadingTime:r,showPopup:l,imageLoad:()=>{clearInterval(n),r.value=0,t("imageLoad",!1)}}},render(){return(0,i.bF)(i.FK,null,[(0,i.bF)("div",{class:"image width100"},[(0,i.bF)("div",null,[(0,i.eW)("预览 / 点击查看详情")]),(0,i.bF)("div",{class:"image-wrap flex"},[(0,i.bF)("div",{style:this.loading?{display:"none"}:{},className:"image-content",onClick:()=>{this.showPopup=!0}},[(0,i.bF)("img",{title:this.htmlMD,onLoad:this.imageLoad,onError:this.imageLoad,src:this.htmlMD,alt:this.htmlMD},null)]),(0,i.bF)("div",{style:this.loading?{}:{display:"none"}},[(0,i.bF)("div",null,[(0,i.eW)("github响应有点慢，莫急,已加载"),this.imageloadingTime,(0,i.eW)("秒")]),(0,i.bF)("div",{class:"loading"},[(0,i.eW)("φ(≧ω≦*)♪图片正在努力加载中")])])])]),this.showPopup?(0,i.bF)("div",{className:"popup flex align-items-center justify-content-center relative",onClick:()=>{this.showPopup=!1}},[(0,i.bF)("img",{src:this.htmlMD,alt:this.htmlMD},null)]):null])}}),D=(S=(0,L.A)(S,[["__scopeId","data-v-2a634e94"]]),n("IDL4"),n("Kc0P"),n("2Rpu"),n("H8wc"),n("T/t+"),n("s7J8"),n("09S7"),n("/vCB"));const F={class:"width100 height100 markdown-title-inner"},A=(e=>((0,i.Qi)("data-v-094eec11"),e=e(),(0,i.jt)(),e))((()=>(0,i.Lk)("div",{class:"width100 text-align-center markdown-title-navigator"}," 标题导航 ",-1))),M={class:"markdown-title-wrap"},T={class:"overflow-y-auto height100 markdown-title-main"},W=["onClick"];var P=n("gw9Z"),E=n("EVdn"),R={name:"NavigatorTitle",props:{ifLarger:{type:Boolean,default:!0},markdownTitleWidth:{type:String,default:"10px"},articleTitles:{type:Array,default:()=>[]},headerH:{type:String,default:"70px"}},setup(e,{emit:t}){const n=(0,c.KR)(0),r=(0,c.KR)(0);return(0,i.sV)((()=>{var t,i,l;n.value=e.ifLarger?((t=document.createElement("div")).style.width="100px",t.style.position="absolute",t.style.top="-9999px",document.body.appendChild(t),i=t.offsetWidth,t.style.overflow="scroll",(l=document.createElement("div")).style.width="100%",t.appendChild(l),l=l.offsetWidth,document.body.removeChild(t),i-l):0,r.value=E(".home").height()})),{barWidth:n,articleTitlesHeight:r,handleAnchorClick:e=>{t("handleAnchorClick",e)}}}};const j=()=>{(0,P.$9)((e=>({"5720f7cb":e.markdownTitleWidth,"01b234ed":e.headerH})))},I=R.setup;R.setup=I?(e,t)=>(j(),I(e,t)):j,R=(0,L.A)(R,[["render",function(e,t,n,l,a,o){return n.articleTitles.length?((0,i.uX)(),(0,i.CE)("div",{key:0,style:(0,r.Tr)({right:l.barWidth+"px",height:l.articleTitlesHeight+"px"}),class:"fixed flex-shrink-0 markdown-title"},[(0,i.Lk)("div",F,[A,(0,i.Lk)("div",M,[(0,i.Lk)("div",T,[((0,i.uX)(!0),(0,i.CE)(i.FK,null,(0,i.pI)(n.articleTitles,((e,t)=>((0,i.uX)(),(0,i.CE)("div",{key:t,class:"markdown-title-item",style:(0,r.Tr)({padding:`10px 0 10px ${10*e.indent}px`})},[(0,i.Lk)("a",{style:{cursor:"pointer"},onClick:t=>l.handleAnchorClick(e)},(0,r.v_)(e.title),9,W)],4)))),128))])])])],4)):(0,i.Q3)("",!0)}],["__scopeId","data-v-094eec11"]]);var N=n("4T8D"),X=n("EVdn"),H=(n={name:"Markdown",components:{navigatorTitle:R,loadingComponent:N.A,vMdPreview:D.A},props:{headerH:{type:String,default:"70px"},loading:{type:Boolean,default:!0},ifLarger:{type:Boolean,default:!0},htmlMD:{type:String,default:""},markdownTitleWidth:{type:String,default:""},title:{type:String,default:""}},setup(e){const t=(0,c.KR)(null),n=(0,c.KR)([]);var r=(0,c.KR)("850px");const l=(0,c.KR)("calc(100% - 170px)"),a=(0,c.KR)(""),o=()=>{if(t.value){var e=t.value.$el.querySelectorAll("h1,h2,h3,h4,h5,h6");if((e=Array.from(e).filter((e=>!!e.innerText.trim()))).length){const t=Array.from(new Set(e.map((e=>e.tagName)))).sort();n.value=e.map((e=>({title:e.innerText,lineIndex:e.getAttribute("data-v-md-line"),indent:t.indexOf(e.tagName)})))}else n.value=[]}else setTimeout((()=>{o()}))},s=()=>{l.value=`calc(100% - ${100+X(".home .title").outerHeight()}px)`};return(0,i.wB)((()=>e.htmlMD),((e,t)=>{e!==t&&e&&(a.value=e,(0,i.dY)().then((()=>{o()})))}),{immediate:!0}),(0,i.wB)((()=>e.title),(()=>{s()})),(0,i.sV)(s),{preview:t,htmlMarkStr:a,articleTitles:n,markdownMinHeight:l,markdownContentMinWidth:r,handleAnchorClick:e=>{e=e.lineIndex,(e=t.value.$el.querySelector(`[data-v-md-line="${e}"]`))&&t.value.scrollToTarget({target:e,scrollContainer:X(".home")[0]})}}},render(){return(0,i.bF)(i.FK,null,[(0,i.bF)("div",{style:(e={},this.ifLarger?this.articleTitles.length?(e.width=`calc(100% - ${this.markdownTitleWidth})`,e.minWidth=`calc(${this.markdownContentMinWidth} - ${this.markdownTitleWidth})`):(e.width="100%",e.minWidth=""+this.markdownContentMinWidth):e.width="100%",e),class:"title flex align-items-center justify-content-center"},[this.title]),(0,i.bF)("div",{class:"relative markdown",style:{minHeight:this.markdownMinHeight,...this.ifLarger?{minWidth:this.markdownContentMinWidth}:{}}},[this.loading?(0,i.bF)(N.A,{style:"background-color: transparent",showModal:!0},{default:()=>[(0,i.bF)("div",{style:"font-weight: bold",class:"width100 height100 flex align-items-center justify-content-center"},[(0,i.eW)("加载中...")])]}):(0,i.bF)("div",{style:(e={},this.ifLarger&&(this.articleTitles.length?(e.minWidth=`calc(${this.markdownContentMinWidth} - ${this.markdownTitleWidth})`,e.paddingRight=""+this.markdownTitleWidth):(e.minWidth=`calc(${this.markdownContentMinWidth})`,e.paddingRight=0)),e),class:"flex height100"},[(0,i.bF)("div",{class:"width100"},[(0,i.bF)((0,i.g2)("v-md-preview"),{class:"width100",ifLarger:this.ifLarger,onGetVMdPreviewRef:e=>{this.preview=e},text:this.htmlMarkStr},null)]),this.ifLarger?(0,i.bF)((0,i.g2)("navigator-title"),{ifLarger:this.ifLarger,markdownTitleWidth:this.markdownTitleWidth,articleTitles:this.articleTitles,onHandleAnchorClick:e=>{this.handleAnchorClick(e)}},null):null])])]);var e}},R={name:"Home",components:{layoutLeftSidebar:g.A,markdownType:(0,L.A)(n,[["__scopeId","data-v-3b9446de"]]),otherType:C,imageType:S},props:{...t.A},setup(e){const t=(0,h.rd)(),n=(0,h.lq)(),r=(0,f.Pj)(),l=(0,c.KR)(""),a=(0,c.KR)("ReadMe-前言"),o=(0,c.KR)(""),s=(0,c.KR)("文件"),u=(0,c.KR)(!0),d=(0,i.EW)((()=>(0,p._G)(o.value))),g=(0,i.EW)((()=>(0,p.K0)(o.value)));var w=(0,i.EW)((()=>"link"===o.value));const y=(0,i.EW)((()=>r.state.menuData.menuList)),k=()=>{(0,i.dY)().then((()=>{document.querySelector(".home").scrollTop=0}))};return(0,i.wB)((()=>n.query),(()=>{r.dispatch(m.XK).then((()=>{var i=n.query.indexPage||"";e.toggleMenu(!1),i?(e=>{var n,i,c,h,f,w,b=e.split("-");try{let x={children:y.value};if(b.forEach((e=>{x=x.children[+e]})),!x)return t.push("/");if(Object.prototype.hasOwnProperty.call(x,"children"))throw new Error("不合法的路由参数");return r.dispatch(m.g5,{indexPage:e}),r.dispatch(m.JD,e),r.dispatch(m.Dq,{indexPage:e}),x&&x.link?(w=x.link,u.value=!1,o.value="link",a.value="链接",l.value=w,void window.open(w)):(n=x.url[x.url.length-1].split("."),o.value=n[n.length-1]?n[n.length-1]:"",i="./"+x.url.join("/"),a.value=x.url.join(" > "),u.value=!0,g.value?(f=i,l.value=f,void k()):void(d.value?v.A.get(i).then((e=>{u.value=!1,l.value=p.Uj.find((e=>e.suffix===o.value.toLocaleLowerCase())).formatFun(e.data),k()})).catch((()=>{l.value="网络寄了，我哭哭~~",o.value="md",u.value=!1})):(c=x.url,h=i,s.value=c[c.length-1],l.value=h,k())))}catch(e){t.push("/error")}})(i):(r.dispatch(m.x5,{indexPage:i}),o.value="md",u.value=!0,v.A.get("./README.md").then((e=>{u.value=!1,l.value=e.data})).catch((e=>{u.value=!1,l.value="寄拉！"})))}))}),{immediate:!0}),{menuList:y,markdownType:d,markdownTitleWidth:(0,c.KR)("300px"),imageType:g,linkType:w,loading:u,htmlMD:l,title:a,fileSuffix:o,downloadName:s,itemClick:e=>{e.indexPage!==n.query.indexPage&&t.push({path:"/",query:{indexPage:e.indexPage}})}}}},(0,L.A)(R,[["render",function(e,t,n,c,h,f){var m=(0,i.g2)("layout-left-sidebar"),v=(0,i.g2)("markdown-type"),p=(0,i.g2)("image-type"),g=(0,i.g2)("other-type"),w=(0,i.gN)("loading");return(0,i.bo)(((0,i.uX)(),(0,i.CE)("div",l,[(0,i.bF)(m,{"left-sidebar-w":e.leftSidebarW,"if-show-menu":e.ifShowMenu,"if-larger":e.ifLarger,"header-h":e.headerH,"toggle-menu":e.toggleMenu,onItemClick:c.itemClick},null,8,["left-sidebar-w","if-show-menu","if-larger","header-h","toggle-menu","onItemClick"]),(0,i.Lk)("div",{style:(0,r.Tr)(e.ifLarger?{width:`calc(100% - ${e.leftSidebarW})`}:{width:"100%"}),class:"relative height100"},[a,(0,i.Lk)("div",o,[c.menuList.length?((0,i.uX)(),(0,i.CE)(i.FK,{key:0},[c.markdownType?(0,i.Q3)("",!0):((0,i.uX)(),(0,i.CE)("div",s,(0,r.v_)(c.title),1)),c.markdownType?((0,i.uX)(),(0,i.Wv)(v,{key:1,title:c.title,"markdown-title-width":c.markdownTitleWidth,loading:c.loading,"if-larger":e.ifLarger,"header-h":e.headerH,"html-m-d":c.htmlMD},null,8,["title","markdown-title-width","loading","if-larger","header-h","html-m-d"])):c.imageType?((0,i.uX)(),(0,i.Wv)(p,{key:2,"html-m-d":c.htmlMD,loading:c.loading,onImageLoad:t[0]||(t[0]=e=>c.loading=!1)},null,8,["html-m-d","loading"])):c.linkType?((0,i.uX)(),(0,i.CE)("div",u,[(0,i.Lk)("a",{href:c.htmlMD},"链接： "+(0,r.v_)(c.htmlMD),9,d)])):((0,i.uX)(),(0,i.Wv)(g,{key:4,"download-name":c.downloadName,"html-m-d":c.htmlMD},null,8,["download-name","html-m-d"]))],64)):(0,i.Q3)("",!0)])],4)])),[[w,!c.menuList.length]])}],["__scopeId","data-v-378e2dd4"]]))},"+PQQ":function(e,t,n){var i=n("rNpr").has;e.exports=function(e){return i(e),e}},kWh2:function(e,t,n){var i=n("dxB+"),r=n("hgw9"),l=n("wnEH"),a=n("vHVK")("toStringTag"),o=Object,s="Arguments"===l(function(){return arguments}());e.exports=i?l:function(e){var t;return void 0===e?"Undefined":null===e?"Null":"string"==typeof(t=function(e,t){try{return e[t]}catch(e){}}(e=o(e),a))?t:s?l(e):"Object"===(t=l(e))&&r(e.callee)?"Arguments":t}},"5u0C":function(e,t,n){var i=n("lMFB"),r=n("iAz1");e.exports=function(e,t,n){return n.get&&i(n.get,t,{getter:!0}),n.set&&i(n.set,t,{setter:!0}),r.f(e,t,n)}},"+N4w":function(e,t,n){var i=n("VWI/"),r=n("4C66");e.exports=function(e,t,n){try{return i(r(Object.getOwnPropertyDescriptor(e,t)[n]))}catch(e){}}},VDrO:function(e){e.exports=function(e){return{iterator:e,next:e.next,done:!1}}},"7a6f":function(e,t,n){function i(e,t){this.set=e,this.size=h(t,0),this.has=r(e.has),this.keys=r(e.keys)}var r=n("4C66"),l=n("5SKH"),a=n("UA6Z"),o=n("WgY9"),s=n("VDrO"),u="Invalid size",d=RangeError,c=TypeError,h=Math.max;i.prototype={getIterator:function(){return s(l(a(this.keys,this.set)))},includes:function(e){return a(this.has,this.set,e)}},e.exports=function(e){l(e);var t=+e.size;if(t!=t)throw new c(u);if((t=o(t))<0)throw new d(u);return new i(e,t)}},SemH:function(e,t,n){var i=n("UA6Z");e.exports=function(e,t,n){for(var r,l=n?e:e.iterator,a=e.next;!(r=i(a,l)).done;)if(void 0!==(r=t(r.value)))return r}},qlfU:function(e,t,n){var i=n("UA6Z"),r=n("5SKH"),l=n("ma+H");e.exports=function(e,t,n){var a,o;r(e);try{if(!(a=l(e,"return"))){if("throw"===t)throw n;return n}a=i(a,e)}catch(e){o=!0,a=e}if("throw"===t)throw n;if(o)throw a;return r(a),n}},HURT:function(e,t,n){var i=n("rNpr"),r=n("+Qo7"),l=i.Set,a=i.add;e.exports=function(e){var t=new l;return r(e,(function(e){a(t,e)})),t}},jSYD:function(e,t,n){var i=n("+PQQ"),r=n("rNpr"),l=n("HURT"),a=n("RG+P"),o=n("7a6f"),s=n("+Qo7"),u=n("SemH"),d=r.has,c=r.remove;e.exports=function(e){var t=i(this),n=o(e),r=l(t);return a(t)<=n.size?s(t,(function(e){n.includes(e)&&c(r,e)})):u(n.getIterator(),(function(e){d(t,e)&&c(r,e)})),r}},rNpr:function(e,t,n){n=n("VWI/");var i=Set.prototype;e.exports={Set:Set,add:n(i.add),has:n(i.has),remove:n(i.delete),proto:i}},"/FzI":function(e,t,n){var i=n("+PQQ"),r=n("rNpr"),l=n("RG+P"),a=n("7a6f"),o=n("+Qo7"),s=n("SemH"),u=r.Set,d=r.add,c=r.has;e.exports=function(e){var t=i(this),n=a(e),r=new u;return l(t)>n.size?s(n.getIterator(),(function(e){c(t,e)&&d(r,e)})):o(t,(function(e){n.includes(e)&&d(r,e)})),r}},ZXuv:function(e,t,n){var i=n("+PQQ"),r=n("rNpr").has,l=n("RG+P"),a=n("7a6f"),o=n("+Qo7"),s=n("SemH"),u=n("qlfU");e.exports=function(e){var t,n=i(this),d=a(e);return l(n)<=d.size?!1!==o(n,(function(e){if(d.includes(e))return!1}),!0):(t=d.getIterator(),!1!==s(t,(function(e){if(r(n,e))return u(t,"normal",!1)})))}},"4XzX":function(e,t,n){var i=n("+PQQ"),r=n("RG+P"),l=n("+Qo7"),a=n("7a6f");e.exports=function(e){var t=i(this),n=a(e);return!(r(t)>n.size)&&!1!==l(t,(function(e){if(!n.includes(e))return!1}),!0)}},"fbF/":function(e,t,n){var i=n("+PQQ"),r=n("rNpr").has,l=n("RG+P"),a=n("7a6f"),o=n("SemH"),s=n("qlfU");e.exports=function(e){var t,n=i(this);return e=a(e),!(l(n)<e.size)&&(t=e.getIterator(),!1!==o(t,(function(e){if(!r(n,e))return s(t,"normal",!1)})))}},"+Qo7":function(e,t,n){var i=n("VWI/"),r=n("SemH"),l=(n=n("rNpr")).Set,a=i((n=n.proto).forEach),o=i(n.keys),s=o(new l).next;e.exports=function(e,t,n){return n?r({iterator:o(e),next:s},t):a(e,t)}},jnMm:function(e,t,n){function i(e){return{size:e,has:function(){return!1},keys:function(){return{next:function(){return{done:!0}}}}}}var r=n("FFLG");e.exports=function(e){var t=r("Set");try{(new t)[e](i(0));try{return(new t)[e](i(-1)),!1}catch(e){return!0}}catch(e){return!1}}},"RG+P":function(e,t,n){var i=n("+N4w");n=n("rNpr"),e.exports=i(n.proto,"size","get")||function(e){return e.size}},"6ev8":function(e,t,n){var i=n("+PQQ"),r=n("rNpr"),l=n("HURT"),a=n("7a6f"),o=n("SemH"),s=r.add,u=r.has,d=r.remove;e.exports=function(e){var t=i(this),n=(e=a(e).getIterator(),l(t));return o(e,(function(e){(u(t,e)?d:s)(n,e)})),n}},e6YO:function(e,t,n){var i=n("+PQQ"),r=n("rNpr").add,l=n("HURT"),a=n("7a6f"),o=n("SemH");e.exports=function(e){var t=i(this),n=(e=a(e).getIterator(),l(t));return o(e,(function(e){r(n,e)})),n}},"dxB+":function(e,t,n){var i={};i[n("vHVK")("toStringTag")]="z",e.exports="[object z]"===String(i)},"/uDU":function(e,t,n){var i=n("kWh2"),r=String;e.exports=function(e){if("Symbol"===i(e))throw new TypeError("Cannot convert a Symbol value to a string");return r(e)}},"0MaD":function(e){var t=TypeError;e.exports=function(e,n){if(e<n)throw new t("Not enough arguments");return e}},"2e4J":function(e,t,n){var i=n("iX0t"),r=n("jSYD");i({target:"Set",proto:!0,real:!0,forced:!n("jnMm")("difference")},{difference:r})},ik8b:function(e,t,n){var i=n("iX0t"),r=n("zJyf"),l=n("/FzI");i({target:"Set",proto:!0,real:!0,forced:!n("jnMm")("intersection")||r((function(){return"3,2"!==String(Array.from(new Set([1,2,3]).intersection(new Set([3,2]))))}))},{intersection:l})},APt5:function(e,t,n){var i=n("iX0t"),r=n("ZXuv");i({target:"Set",proto:!0,real:!0,forced:!n("jnMm")("isDisjointFrom")},{isDisjointFrom:r})},pjNe:function(e,t,n){var i=n("iX0t"),r=n("4XzX");i({target:"Set",proto:!0,real:!0,forced:!n("jnMm")("isSubsetOf")},{isSubsetOf:r})},Sew0:function(e,t,n){var i=n("iX0t"),r=n("fbF/");i({target:"Set",proto:!0,real:!0,forced:!n("jnMm")("isSupersetOf")},{isSupersetOf:r})},D3Q3:function(e,t,n){var i=n("iX0t"),r=n("6ev8");i({target:"Set",proto:!0,real:!0,forced:!n("jnMm")("symmetricDifference")},{symmetricDifference:r})},"v/7u":function(e,t,n){var i=n("iX0t"),r=n("e6YO");i({target:"Set",proto:!0,real:!0,forced:!n("jnMm")("union")},{union:r})},IDL4:function(e,t,n){n("2e4J")},Kc0P:function(e,t,n){n("ik8b")},"2Rpu":function(e,t,n){n("APt5")},H8wc:function(e,t,n){n("pjNe")},"T/t+":function(e,t,n){n("Sew0")},s7J8:function(e,t,n){n("D3Q3")},"09S7":function(e,t,n){n("v/7u")},kvaN:function(e,t,n){var i=n("P6Ci"),r=n("VWI/"),l=n("/uDU"),a=n("0MaD"),o=(n=URLSearchParams).prototype,s=r(o.append),u=r(o.delete),d=r(o.forEach),c=r([].push);(r=new n("a=1&a=2&b=3")).delete("a",1),r.delete("b",void 0),r+""!="a=2"&&i(o,"delete",(function(e){var t=arguments.length,n=t<2?void 0:arguments[1];if(t&&void 0===n)return u(this,e);for(var i,r=[],o=(d(this,(function(e,t){c(r,{key:t,value:e})})),a(t,1),l(e)),h=l(n),f=0,m=0,v=!1,p=r.length;f<p;)i=r[f++],v||i.key===o?(v=!0,u(this,i.key)):m++;for(;m<p;)(i=r[m++]).key===o&&i.value===h||s(this,i.key,i.value)}),{enumerable:!0,unsafe:!0})},"o5/U":function(e,t,n){var i=n("P6Ci"),r=n("VWI/"),l=n("/uDU"),a=n("0MaD"),o=(n=URLSearchParams).prototype,s=r(o.getAll),u=r(o.has);!(r=new n("a=1")).has("a",2)&&r.has("a",void 0)||i(o,"has",(function(e){var t=arguments.length,n=t<2?void 0:arguments[1];if(t&&void 0===n)return u(this,e);for(var i=s(this,e),r=(a(t,1),l(n)),o=0;o<i.length;)if(i[o++]===r)return!0;return!1}),{enumerable:!0,unsafe:!0})},pacc:function(e,t,n){var i=n("S4+I"),r=n("VWI/"),l=(n=n("5u0C"),URLSearchParams.prototype),a=r(l.forEach);!i||"size"in l||n(l,"size",{get:function(){var e=0;return a(this,(function(){e++})),e},configurable:!0,enumerable:!0})}}]);