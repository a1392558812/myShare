import{a}from"../../../../../@vue-runtime-dom-Dkxbnx-0.js";import{a as e}from"../../../../common/axios/index-CK6lisJl.js";import{m as o}from"./components/markdown-priview/index-CoMXtTy7.js";import{r as d}from"../../../../../@vue-reactivity-mdokXGQ5.js";import{a as m,g as r,l,m as s,s as t,j as i,x as n,y as u,P as v}from"../../../../../@vue-runtime-core-lkGMyH8G.js";const w=a=>(n("data-v-97afaa26"),a=a(),u(),a),c={class:"width100 overflow-y-auto markdown-priview-vuecode"},p={style:{"min-width":"1000px"}},k={class:"vuepress-markdown-body"},h=w((()=>l("h1",null,"拓展markdown功能，解析里面的vue代码演示功能",-1))),x=w((()=>l("p",null,"vue演练场为异步懒加载，且在挂载编译过程中加入了2s的防抖，防止过快生成组件实例",-1))),f=w((()=>l("p",null,[v("具体的markdown文件可通过"),l("code",null,"F12"),v("打开控制台查看")],-1))),j=w((()=>l("p",null,[l("a",{href:"/demo-static/markdown-priview-vuecode/markdown.md"},"源文件markdown"),v("字符串👇👇👇: ")],-1))),y={key:0,class:"code-textarea-wrap"},g=w((()=>l("p",null,"下面是自定义markdown解析: 👇👇👇",-1))),b=Object.assign({name:"view-demo-markdown-priview-vuecode"},{__name:"index",setup(n){const u=d(""),v=d(!0);return((a="/demo-static/markdown-priview-vuecode/markdown.md")=>{v.value=!0,e.get(a).then((a=>{u.value=a.data,v.value=!1})).catch((a=>{u.value="网络寄了，我哭哭~~",v.value=!1}))})(),(e,d)=>(m(),r("div",c,[l("div",p,[l("div",k,[h,x,f,j,v.value?t("",!0):(m(),r("div",y,[s(l("textarea",{class:"height100 width100 display-block code-textarea","onUpdate:modelValue":d[0]||(d[0]=a=>u.value=a)},null,512),[[a,u.value]])])),g]),i(o,{title:"markdown.md",loading:v.value,"html-m-d":u.value},null,8,["loading","html-m-d"])])]))}});export{b as _};