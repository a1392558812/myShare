import{$ as t}from"../../../../../../jquery-IViRahhZ.js";import{p as o,m as e,g as i}from"../../../../../../photo-sphere-viewer-B5rT8NhA.js";import{b as a}from"../../../../../common/util/methods-G0pJ8i8C.js";import{_ as n}from"../../../../../../plugin-vue_export-helper-BCo6x5W8.js";import{o as s,a as r,g as l,x as c,y as p,l as m}from"../../../../../../@vue-runtime-core-lkGMyH8G.js";const u={name:"3d-vr",setup(n,{emit:r}){s((()=>{(()=>{const n=a(),s=new URL(""+new URL("../../../../../../../png/heishou-zOjRLByF.png",import.meta.url).href,import.meta.url).href,l=new URL(""+new URL("../../../../../../../jpg/heishou2-6K5oALWd.jpg",import.meta.url).href,import.meta.url).href,c={latitude:{start:-Math.PI/2,end:.2},longitude:{start:Math.PI,end:0},zoom:{start:0,end:50},fisheye:{start:2,end:0}},p={"360bg1":[{id:"custom-tooltip-0",data:{content:"标记custom-tooltip-0"},tooltip:{content:`\n                      <div class="custom-tooltip-content-wrap">\n                        <div class="custom-tooltip-content">提示：这里是黑手之山！</div>\n                        <img class="line-height-1 custom-tooltip-image" src='${s}'/>\n                      </div>\n                      `,toastContent:"toastContent1",className:"custom-tooltip custom-tooltip-0",position:"top",trigger:"click"},latitude:.11,longitude:-.35,image:n+"demo-static/360range/pin-blue.png",width:32,height:32,anchor:"bottom center"},{id:"custom-tooltip-1",data:{content:"标记custom-tooltip-1"},tooltip:{content:`\n                      <div class="custom-tooltip-content-wrap">\n                        <div class="custom-tooltip-content">哈哈！这里还是黑手之山！</div>\n                        <img class="line-height-1 display-block custom-tooltip-image" src='${l}'/>\n                      </div>\n                      `,toastContent:"toastContent2",className:"custom-tooltip custom-tooltip-1",position:"top",trigger:"click"},latitude:.11,longitude:2.55,image:n+"demo-static/360range/pin-blue.png",width:32,height:32,anchor:"bottom center"}],"360bg2":[{id:"custom-tooltip-2",data:{content:"标记custom-tooltip-2"},tooltip:{content:"场景2的content🥵🥵",toastContent:"toastContent3",className:"custom-tooltip custom-tooltip-2",position:"top",trigger:"click"},latitude:.31,longitude:-.15,image:n+"demo-static/360range/pin-blue.png",width:32,height:32,anchor:"bottom center"}],"360bg3":[{id:"custom-tooltip-3",data:{content:"标记custom-tooltip-3"},tooltip:{content:"场景3的content🥵🥵",toastContent:"toastContent4",className:"custom-tooltip custom-tooltip-3",position:"top",trigger:"click"},latitude:.31,longitude:-.25,image:n+"demo-static/360range/pin-blue.png",width:32,height:32,anchor:"bottom center"}]},m=new o.Viewer({container:document.querySelector("#viewer"),panorama:n+"demo-static/360range/360bg1.jpg",caption:"大风车啊转啊转~",defaultLat:c.latitude.start,defaultLong:c.longitude.start,defaultZoomLvl:c.zoom.start,fisheye:c.fisheye.start,navbar:["zoom","move","autorotate","markers","markersList","gallery",{title:"Change image",content:"🔄 奥利给，把握住了！！",onClick:(t,o,e)=>{d().then()}},"caption","fullscreen"],plugins:[[e.MarkersPlugin,{}],[i.GalleryPlugin,{visibleOnLoad:!0,items:[{id:"360bg1",name:"全景1",panorama:n+"demo-static/360range/360bg1.jpg",thumbnail:n+"demo-static/360range/preview/preview1.png",options:{caption:"大风车啊转啊转~"}},{id:"360bg2",name:"全景2",panorama:n+"demo-static/360range/360bg2.jpg",thumbnail:n+"demo-static/360range/preview/preview2.png",options:{caption:"caption2"}},{id:"360bg3",name:"全景3",panorama:n+"demo-static/360range/360bg3.jpg",thumbnail:n+"demo-static/360range/preview/preview3.png",options:{caption:"caption3"}}]}]]}),u=m.getPlugin(e.MarkersPlugin),d=()=>new Promise((t=>{m.stopAutorotate(),new o.utils.Animation({properties:c,duration:2500,easing:"inOutQuad",onTick:t=>{m.setOption("fisheye",t.fisheye),m.rotate({longitude:t.longitude,latitude:t.latitude}),m.zoom(t.zoom)}}).then((()=>{m.setOptions({autorotateLat:c.latitude.end,autorotateDelay:1e3,autorotateIdle:!0}),m.startAutorotate(),t()}))}));m.on("panorama-loaded",((t,o)=>{const e=o.panorama.split("/"),i=e[e.length-1].split(".")[0];u.clearMarkers(),p[i].forEach((t=>{u.addMarker(t)}))})),m.on("ready",(()=>{m.plugins.markers.on("select-marker",((t,o,e)=>{r("select-marker",{e:t,marker:o,data:e})})),t(".psv-gallery-item").click((t=>{u.clearMarkers()})),d().then((()=>{m.getPlugin(e.MarkersPlugin).showMarkerTooltip("custom-tooltip-0")}))}))})()}))}},d=t=>(c("data-v-4eaf5d14"),t=t(),p(),t),g={class:"width100 height100"},h=[d((()=>m("div",{id:"viewer",class:"width100 height100"},null,-1))),d((()=>m("div",{id:"custom-tooltip-0"},null,-1))),d((()=>m("div",{id:"custom-tooltip-1"},null,-1)))];const v=n(u,[["render",function(t,o,e,i,a,n){return r(),l("div",g,h)}],["__scopeId","data-v-4eaf5d14"]]);export{v};