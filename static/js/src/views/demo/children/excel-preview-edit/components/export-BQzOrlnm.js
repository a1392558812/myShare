import{E as t}from"../../../../../../exceljs-C8OFqDwO.js";import{F as e}from"../../../../../../file-saver-HR8lLbwc.js";const o=function(o,a){const i=new t.Workbook;"[object Object]"===Object.prototype.toString.call(o)&&(o=[o]),o.forEach((function(t){if(0===t.data.length)return!0;const e=i.addWorksheet(t.name),o=t.config&&t.config.merge||{},a=t.config&&t.config.borderInfo||{};return l(t.data,e),r(o,e),n(a,e),!0}));return i.xlsx.writeBuffer().then((t=>{const o=new Blob([t],{type:"application/vnd.ms-excel;charset=utf-8"});e.saveAs(o,`${a}.xlsx`)}))},r=function(t={},e){Object.values(t).forEach((function(t){e.mergeCells(t.r+1,t.c+1,t.r+t.rs,t.c+t.cs)}))},n=function(t,e){Array.isArray(t)&&t.forEach((function(t){if("range"===t.rangeType){const o=s(t.borderType,t.style,t.color),r=t.range[0],n=r.row,l=r.column;for(let t=n[0]+1;t<n[1]+2;t++)for(let r=l[0]+1;r<l[1]+2;r++)e.getCell(t,r).border=o}if("cell"===t.rangeType){const{colIndex:o,rowIndex:r}=t.value,n=Object.assign({},t.value);delete n.colIndex,delete n.rowIndex;const l=function(t){const e={},o={type:{l:"left",r:"right",b:"bottom",t:"top"},style:{0:"none",1:"thin",2:"hair",3:"dotted",4:"dashDot",5:"dashDot",6:"dashDotDot",7:"double",8:"medium",9:"mediumDashed",10:"mediumDashDot",11:"mediumDashDotDot",12:"slantDashDot",13:"thick"}};for(const r in t)-1===t[r].color.indexOf("rgb")?e[o.type[r]]={style:o.style[t[r].style],color:{argb:t[r].color.replace("#","")}}:e[o.type[r]]={style:o.style[t[r].style],color:{argb:t[r].color}};return e}(n);e.getCell(r+1,o+1).border=l}}))},l=function(t,e){Array.isArray(t)&&t.forEach((function(t,o){t.every((function(t,r){if(!t)return!0;const n=a(t.bg),l=i(t.ff,t.fc,t.bl,t.it,t.fs,t.cl,t.ul),s=c(t.vt,t.ht,t.tb,t.tr);let f="";t.f?f={formula:t.f,result:t.v}:!t.v&&t.ct&&t.ct.s?t.ct.s.forEach((t=>{f+=t.v})):f=t.v;const u=function(t){const e="A".charCodeAt(0),o="Z".charCodeAt(0)-e+1;let r="";for(;t>=0;)r=String.fromCharCode(t%o+e)+r,t=Math.floor(t/o)-1;return r}(r),d=e.getCell(u+(o+1));return d.fill=n,d.font=l,d.alignment=s,d.value=f,!0}))}))},a=function(t){if(!t)return{};return{type:"pattern",pattern:"solid",fgColor:{argb:t.replace("#","")}}},i=function(t=0,e="#000000",o=0,r=0,n=10,l=0,a=0){const i={0:"微软雅黑",1:"宋体（Song）",2:"黑体（ST Heiti）",3:"楷体（ST Kaiti）",4:"仿宋（ST FangSong）",5:"新宋体（ST Song）",6:"华文新魏",7:"华文行楷",8:"华文隶书",9:"Arial",10:"Times New Roman ",11:"Tahoma ",12:"Verdana",num2bl:function(t){return 0!==t}};return{name:"number"==typeof t?i[t]:t,family:1,size:n,color:{argb:e.replace("#","")},bold:i.num2bl(o),italic:i.num2bl(r),underline:i.num2bl(a),strike:i.num2bl(l)}},c=function(t="default",e="default",o="default",r="default"){const n={vertical:{0:"middle",1:"top",2:"bottom",default:"top"},horizontal:{0:"center",1:"left",2:"right",default:"left"},wrapText:{0:!1,1:!1,2:!0,default:!1},textRotation:{0:0,1:45,2:-45,3:"vertical",4:90,5:-90,default:0}};return{vertical:n.vertical[t],horizontal:n.horizontal[e],wrapText:n.wrapText[o],textRotation:n.textRotation[r]}},s=function(t,e=1,o="#000"){if(!t)return{};const r={type:{"border-all":"all","border-top":"top","border-right":"right","border-bottom":"bottom","border-left":"left"},style:{0:"none",1:"thin",2:"hair",3:"dotted",4:"dashDot",5:"dashDot",6:"dashDotDot",7:"double",8:"medium",9:"mediumDashed",10:"mediumDashDot",11:"mediumDashDotDot",12:"slantDashDot",13:"thick"}},n={style:r.style[e],color:{argb:o.replace("#","")}},l={};return"all"===r.type[t]?(l.top=n,l.right=n,l.bottom=n,l.left=n):l[r.type[t]]=n,l};export{o as e};