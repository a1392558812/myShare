"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([[5177],{xgSN:function(e,l,a){var t=a("vDqi"),n=a.n(t),i=(t=a("Mj6V"),a.n(t));n().interceptors.request.use((e=>(i().start(),e))),n().interceptors.response.use((e=>(i().done(),e))),l.Z={get:e=>new Promise(((l,a)=>{n().get(e).then((e=>{l(e)})).catch((e=>{i().done(),a(e)}))}))}},"5nml":function(e,l,a){a.r(l),a.d(l,{default:function(){return _}});var t=a("XEAi"),n=a("n/QL");l=e=>((0,t.dD)("data-v-4831cd28"),e=e(),(0,t.Cn)(),e);const i={class:"content-inner bg-white overflow-hidden width100 height100 flex flex-direction-row"},o=l((()=>(0,t._)("div",{class:"bg-image width100 height100 absolute"},null,-1))),d={key:0,class:"title width100 flex align-items-center justify-content-center"},r={style:{"font-size":"30px","font-weight":"900"},class:"width100 height100 flex align-items-center justify-content-center"},s=l((()=>(0,t._)("div",null," Suspense异步组件加载中",-1))),u={class:"relative loading-wrap"},h={key:3,class:"link"},m=["href"];a("FNk8");var c=a("oekR"),v=a("MLNC"),g=a("xgSN"),p=a("HlMS"),w=a("HESj"),f=(l=a("EMon"),a("bfTd"));const y={class:"other-type"},k={class:"downLoad-cell"},M={class:"downLoad-cell"},b={class:"downLoad-cell downLoad-wrap flex"},L=["href","download"];var D={name:"OtherType",props:{downloadName:{type:String,default:""},htmlMD:{type:String,default:""}}},C=a("uaZu"),T=(D=(0,C.Z)(D,[["render",function(e,l,a,i,o,d){return(0,t.wg)(),(0,t.iD)("div",y,[(0,t._)("div",k," 链接： "+(0,n.zw)(a.htmlMD),1),(0,t._)("div",M," 文件名： "+(0,n.zw)(a.downloadName),1),(0,t._)("div",b,[(0,t._)("a",{class:"display-block downLoad",href:a.htmlMD,download:a.downloadName},"下载",8,L)])])}],["__scopeId","data-v-1e9e2cf3"]]),{name:"ImageType",props:{loading:{type:Boolean,default:!0},htmlMD:{type:String,default:""}},emits:["imageLoad"],setup(e,{emit:l}){let a=null;const n=(0,c.iH)(1),i=(0,c.iH)(!1),o=e=>{i.value&&27===e.keyCode&&(i.value=!1)};return(0,t.YP)((()=>e.loading),(e=>{i.value=!1,n.value=1,clearInterval(a),e&&(a=setInterval((()=>{n.value++}),1e3))})),(0,t.bv)((()=>{document.addEventListener("keydown",o)})),(0,t.Ah)((()=>{clearInterval(a),document.removeEventListener("keydown",o)})),{imageloadingTime:n,showPopup:i,imageLoad:()=>{clearInterval(a),n.value=0,l("imageLoad",!1)}}},render(){return(0,t.Wm)(t.HY,null,[(0,t.Wm)("div",{class:"image width100"},[(0,t.Wm)("div",null,[(0,t.Uk)("预览 / 点击查看详情")]),(0,t.Wm)("div",{class:"image-wrap flex"},[(0,t.Wm)("div",{style:this.loading?{display:"none"}:{},className:"image-content",onClick:()=>{this.showPopup=!0}},[(0,t.Wm)("img",{onLoad:this.imageLoad,onError:this.imageLoad,src:this.htmlMD,alt:this.htmlMD},null)]),(0,t.Wm)("div",{style:this.loading?{}:{display:"none"}},[(0,t.Wm)("div",null,[(0,t.Uk)("github响应有点慢，莫急,已加载"),this.imageloadingTime,(0,t.Uk)("秒")]),(0,t.Wm)("div",{className:"loading"},[(0,t.Uk)("φ(≧ω≦*)♪图片正在努力加载中")])])])]),this.showPopup?(0,t.Wm)("div",{className:"popup flex align-items-center justify-content-center relative",onClick:()=>{this.showPopup=!1}},[(0,t.Wm)("img",{src:this.htmlMD,alt:this.htmlMD},null)]):null])}}),W=(T=(0,C.Z)(T,[["__scopeId","data-v-14afe538"]]),a("zCXv")),_=(f={name:"Home",components:{layoutLeftSidebar:f.Z,loadingComponent:W.Z,markdownType:(0,t.RC)({loader:()=>new Promise((e=>{setTimeout((()=>{e(Promise.all([a.e(8895),a.e(6599),a.e(6746),a.e(7230)]).then(a.bind(a,"KhpA")))}),0)}))}),otherType:D,imageType:T},props:{...l.Z},setup(e){const l=(0,c.iH)(""),a=(0,c.iH)("ReadMe-前言"),n=(0,c.iH)(""),i=(0,c.iH)("文件"),o=(0,c.iH)(!0),d=(0,t.Fl)((()=>(0,p.eW)(n.value))),r=(0,t.Fl)((()=>(0,p.Vx)(n.value)));var s=(0,t.Fl)((()=>"link"===n.value));const u=()=>{(0,t.Y3)().then((()=>{document.querySelector(".home").scrollTop=0}))},h=e=>{o.value=!1,n.value="link",a.value="链接",l.value=e,window.open(e)},m=e=>{var t=e[e.length-1].split(".");return n.value=t[t.length-1]?t[t.length-1]:"",t="./"+e.join("/"),a.value=e.join(" > "),o.value=!0,r.value?(e=>{l.value=e,u()})(t):d.value?(e=>{g.Z.get(e).then((e=>{o.value=!1,"js"===n.value?l.value="```js\n"+e.data+"\n```":"ts"===n.value?l.value="```typescript\n"+e.data+"\n```":"py"===n.value?l.value="```python\n"+e.data+"\n```":"html"===n.value?l.value="```html\n"+e.data+"\n```":"jsx"===n.value?l.value="```jsx\n"+e.data+"\n```":(l.value=e.data,u())})).catch((e=>{l.value="网络寄了，我哭哭~~",n.value="md",o.value=!1}))})(t):void((e,a)=>{i.value=e[e.length-1],l.value=a,u()})(e,t)};return(0,t.wF)((()=>{var a=(0,v.yj)().query.indexPage;if(e.toggleMenu(!1),a){const e=[];a=a.split("-");try{let l=w.Z;if(a.forEach((a=>{l=(Object.prototype.hasOwnProperty.call(l,"children")?l.children:l)[+a],e.push(l.name)})),!l)return void(0,v.tv)().push("/");if(Object.prototype.hasOwnProperty.call(l,"children"))throw new Error("不合法的路由参数");if(l&&l.link)return void h(l.link);m(e)}catch(a){(0,v.tv)().push("/error")}}else n.value="md",o.value=!0,g.Z.get("./README.md").then((e=>{o.value=!1,l.value=e.data})).catch((e=>{o.value=!1,l.value="寄拉！"}))})),{markdownType:d,markdownTitleWidth:(0,c.iH)("270px"),imgType:r,linkType:s,loading:o,htmlMD:l,title:a,type:n,downloadName:i,itemClick:m,linkClick:h}}},(0,C.Z)(f,[["render",function(e,l,a,c,v,g){var p=(0,t.up)("layout-left-sidebar");const w=(0,t.up)("markdown-type"),f=(0,t.up)("loadingComponent");var y=(0,t.up)("image-type"),k=(0,t.up)("other-type");return(0,t.wg)(),(0,t.iD)("div",i,[(0,t.Wm)(p,{"left-sidebar-w":e.leftSidebarW,"if-show-menu":e.ifShowMenu,"if-larger":e.ifLarger,"header-h":e.headerH,"toggle-menu":e.toggleMenu,onLinkClick:c.linkClick,onItemClick:c.itemClick},null,8,["left-sidebar-w","if-show-menu","if-larger","header-h","toggle-menu","onLinkClick","onItemClick"]),(0,t._)("div",{style:(0,n.j5)(e.ifLarger?{width:`calc(100% - ${e.leftSidebarW})`}:{width:"100%"}),class:"relative height100"},[o,(0,t._)("div",{class:(0,n.C_)([e.ifLarger?"scroll-bar-y":"","home overflow-y-auto relative width100 height100"])},[c.markdownType?(0,t.kq)("",!0):((0,t.wg)(),(0,t.iD)("div",d,(0,n.zw)(c.title),1)),c.markdownType?((0,t.wg)(),(0,t.j4)(t.n4,{key:1},{fallback:(0,t.w5)((()=>[(0,t._)("div",r,[s,(0,t._)("div",u,[(0,t.Wm)(f,{style:{background:"transparent"},showModal:!0})])])])),default:(0,t.w5)((()=>[(0,t.Wm)(w,{title:c.title,"markdown-title-width":c.markdownTitleWidth,loading:c.loading,"if-larger":e.ifLarger,"header-h":e.headerH,"html-m-d":c.htmlMD},null,8,["title","markdown-title-width","loading","if-larger","header-h","html-m-d"])])),_:1})):c.imgType?((0,t.wg)(),(0,t.j4)(y,{key:2,"html-m-d":c.htmlMD,loading:c.loading,onImageLoad:l[0]||(l[0]=e=>c.loading=!1)},null,8,["html-m-d","loading"])):c.linkType?((0,t.wg)(),(0,t.iD)("div",h,[(0,t._)("a",{href:c.htmlMD},"链接： "+(0,n.zw)(c.htmlMD),9,m)])):((0,t.wg)(),(0,t.j4)(k,{key:4,"download-name":c.downloadName,"html-m-d":c.htmlMD},null,8,["download-name","html-m-d"]))],2)],4)])}],["__scopeId","data-v-4831cd28"]]))}}]);