import{J as e,M as t,F as i,P as n}from"../../../../../@egjs-DOerAWwb.js";import{i as s}from"../../../../../@vueuse-CzS49P4w.js";import{r as a,g as l}from"../../../../common/util/methods-BlEsKu8e.js";import{_ as r}from"../../../../../plugin-vue_export-helper-BCo6x5W8.js";import{r as o}from"../../../../../@vue-reactivity-mdokXGQ5.js";import{a as c,g as m,l as d,F as u,q as f,c as p,k as g,O as v,s as y,x,y as h}from"../../../../../@vue-runtime-core-lkGMyH8G.js";import{n as j,k}from"../../../../../@vue-shared-LkD7rn4X.js";import"../../../../../@cfcs-C76_NZB_.js";import"../../../../../axios-DPD4D5Qz.js";import"../../../../../__commonjsHelpers__-MdiGH4nz.js";const b={name:"view-demo-infinite-scroll",components:{JustifiedInfiniteGrid:e,MasonryInfiniteGrid:t,FrameInfiniteGrid:i,PackingInfiniteGrid:n},setup(){const e=o([]),t=o([{name:"JustifiedInfiniteGrid",label:"动态定高",getWidth:()=>`${a(100,300)}px`,getHeight:()=>`${a(100,300)}px`},{name:"MasonryInfiniteGrid",label:"动态定宽",getWidth:()=>"300px",getHeight:()=>`${a(300,500)}px`},{name:"FrameInfiniteGrid",label:"动态比例",getWidth:()=>`${a(100,300)}px`,getHeight:()=>`${a(100,300)}px`},{name:"PackingInfiniteGrid",label:"比例缩放",getWidth:()=>`${a(100,300)}px`,getHeight:()=>`${a(100,300)}px`}]),i=o(0),n=o(null),r=o(null),c=o(!1),m=()=>{c.value||(c.value=!0,setTimeout((()=>{const n=e.value.length,s=[];for(let e=0;e<30;e++)s.push({groupKey:n+e,style:{width:t.value[i.value].getWidth(),height:t.value[i.value].getHeight(),background:l()},key:n+e});e.value=e.value.concat(s),c.value=!1}),2500))};return m(),s(n,(()=>{m()}),{distance:10}),{list:e,handleSelect:(t,n)=>{i.value!==n&&!0!==c.value&&(i.value=n,e.value=[],m())},currentComponentIndex:i,componentsList:t,infiniteScroll:n,infiniteGrid:r,loading:c}}},I=e=>(x("data-v-6c7a9c3d"),e=e(),h(),e),G={ref:"infiniteScroll",class:"infinite-wrap overflow-y-auto"},$=I((()=>d("div",{class:"text-label flex align-items-center justify-content-center"}," 瀑布流高度会等比缩放 ",-1))),_={style:{"margin-bottom":"20px"},class:"flex align-items-center justify-content-center"},H=I((()=>d("div",{style:{"margin-right":"20px"}},"当前瀑布流类型:",-1))),C=["onClick"],F={style:{"margin-bottom":"10px"}},W=I((()=>d("div",{style:{"margin-bottom":"10px"}},"默认style",-1))),w={key:1,class:"text-label flex align-items-center justify-content-center"};const S=r(b,[["render",function(e,t,i,n,s,a){return c(),m("div",G,[$,d("div",_,[H,(c(!0),m(u,null,f(n.componentsList,((e,t)=>(c(),m("div",{class:"scroll-item cursor-pointer",onClick:i=>n.handleSelect(e,t),key:e.name,style:j({background:t===n.currentComponentIndex?"#ef475d":""})},k(e.label),13,C)))),128))]),n.list.length?(c(),p(v(n.componentsList[n.currentComponentIndex].name),{key:0,frame:[[1,1,2,3,3],[1,1,4,4,5]],useFit:!1,gap:20,ref:"infiniteGrid",class:"container",sizeRange:[200,1/0]},{default:g((()=>[(c(!0),m(u,null,f(n.list,((e,t)=>(c(),m("div",{class:"item flex flex-direction-column justify-content-center",style:j(e.style),key:t},[d("div",F,"第"+k(t)+"个",1),W,(c(!0),m(u,null,f(Object.keys(e.style),(i=>(c(),m("div",{style:{"margin-bottom":"10px"},key:`${i}-${t}`},k(i)+": "+k(e.style[i]),1)))),128))],4)))),128))])),_:1},512)):y("",!0),n.loading?(c(),m("div",w," loading... ")):y("",!0)],512)}],["__scopeId","data-v-6c7a9c3d"]]);export{S as default};