import{r as e}from"./@vue-reactivity-mdokXGQ5.js";import{o as t,w as n}from"./@vue-runtime-core-lkGMyH8G.js";const o=new Set,i=new WeakMap,r=new WeakMap,a=new WeakMap,s=new WeakMap,l=new WeakMap,c=new WeakMap,d=new WeakMap,u=new WeakSet;let f,p=0,h=0;const m="__aa_tgt",g="__aa_del",w="__aa_new",v=e=>{const t=function(e){const t=e.reduce(((e,t)=>[...e,...Array.from(t.addedNodes),...Array.from(t.removedNodes)]),[]);return!t.every((e=>"#comment"===e.nodeName))&&e.reduce(((e,t)=>{if(!1===e)return!1;if(t.target instanceof Element){if(T(t.target),!e.has(t.target)){e.add(t.target);for(let n=0;n<t.target.children.length;n++){const o=t.target.children.item(n);if(o){if(g in o)return!1;T(t.target,o),e.add(o)}}}if(t.removedNodes.length)for(let n=0;n<t.removedNodes.length;n++){const o=t.removedNodes[n];if(g in o)return!1;o instanceof Element&&(e.add(o),T(t.target,o),r.set(o,[t.previousSibling,t.nextSibling]))}}return e}),new Set)}(e);t&&t.forEach((e=>function(e){var t;const n=e.isConnected,o=i.has(e);n&&r.has(e)&&r.delete(e);a.has(e)&&(null===(t=a.get(e))||void 0===t||t.cancel());w in e?B(e):o&&n?function(e){const t=i.get(e),n=O(e);if(!k(e))return i.set(e,n);let o;if(!t)return;const r=j(e);if("function"!=typeof r){const i=t.left-n.left,a=t.top-n.top,[s,l,c,d]=N(e,t,n),u={transform:`translate(${i}px, ${a}px)`},f={transform:"translate(0, 0)"};s!==l&&(u.width=`${s}px`,f.width=`${l}px`),c!==d&&(u.height=`${c}px`,f.height=`${d}px`),o=e.animate([u,f],{duration:r.duration,easing:r.easing})}else{const[i]=$(r(e,"remain",t,n));o=new Animation(i),o.play()}a.set(e,o),i.set(e,n),o.addEventListener("finish",b.bind(null,e))}(e):o&&!n?function(e){var t;if(!r.has(e)||!i.has(e))return;const[n,o]=r.get(e);Object.defineProperty(e,g,{value:!0,configurable:!0});const s=window.scrollX,l=window.scrollY;o&&o.parentNode&&o.parentNode instanceof Element?o.parentNode.insertBefore(e,o):n&&n.parentNode?n.parentNode.appendChild(e):null===(t=C(e))||void 0===t||t.appendChild(e);if(!k(e))return _(e);const[c,d,u,m]=function(e){const t=i.get(e),[n,,o]=N(e,t,O(e));let r=e.parentElement;for(;r&&("static"===getComputedStyle(r).position||r instanceof HTMLBodyElement);)r=r.parentElement;r||(r=document.body);const a=getComputedStyle(r),s=i.get(r)||O(r),l=Math.round(t.top-s.top)-L(a.borderTopWidth),c=Math.round(t.left-s.left)-L(a.borderLeftWidth);return[l,c,n,o]}(e),w=j(e),v=i.get(e);s===p&&l===h||function(e,t,n,o){const i=p-t,r=h-n,a=document.documentElement.style.scrollBehavior;"smooth"===getComputedStyle(f).scrollBehavior&&(document.documentElement.style.scrollBehavior="auto");if(window.scrollTo(window.scrollX+i,window.scrollY+r),!e.parentElement)return;const s=e.parentElement;let l=s.clientHeight,c=s.clientWidth;const d=performance.now();function u(){requestAnimationFrame((()=>{if(!A(o)){const e=l-s.clientHeight,t=c-s.clientWidth;d+o.duration>performance.now()?(window.scrollTo({left:window.scrollX-t,top:window.scrollY-e}),l=s.clientHeight,c=s.clientWidth,u()):document.documentElement.style.scrollBehavior=a}}))}u()}(e,s,l,w);let y,b={position:"absolute",top:`${c}px`,left:`${d}px`,width:`${u}px`,height:`${m}px`,margin:"0",pointerEvents:"none",transformOrigin:"center",zIndex:"100"};if(A(w)){const[t,n]=$(w(e,"remove",v));!1!==(null==n?void 0:n.styleReset)&&(b=(null==n?void 0:n.styleReset)||b,Object.assign(e.style,b)),y=new Animation(t),y.play()}else Object.assign(e.style,b),y=e.animate([{transform:"scale(1)",opacity:1},{transform:"scale(.98)",opacity:0}],{duration:w.duration,easing:"ease-out"});a.set(e,y),y.addEventListener("finish",_.bind(null,e,b))}(e):B(e)}(e)))},y=e=>{e.forEach((e=>{e.target===f&&(clearTimeout(d.get(f)),d.set(f,setTimeout((()=>{o.forEach((e=>S(e,(e=>M((()=>b(e)))))))}),100))),i.has(e.target)&&b(e.target)}))};function b(e){clearTimeout(d.get(e));const t=j(e),n=A(t)?500:t.duration;d.set(e,setTimeout((async()=>{const t=a.get(e);try{await(null==t?void 0:t.finished),i.set(e,O(e)),function(e){const t=s.get(e);null==t||t.disconnect();let n=i.get(e),o=0;n||(n=O(e),i.set(e,n));const{offsetWidth:r,offsetHeight:a}=f,l=[n.top-5,r-(n.left+5+n.width),a-(n.top+5+n.height),n.left-5].map((e=>-1*Math.floor(e)+"px")).join(" "),c=new IntersectionObserver((()=>{++o>1&&b(e)}),{root:f,threshold:1,rootMargin:l});c.observe(e),s.set(e,c)}(e)}catch{}}),n))}function E(e){setTimeout((()=>{l.set(e,setInterval((()=>M(b.bind(null,e))),2e3))}),Math.round(2e3*Math.random()))}function M(e){"function"==typeof requestIdleCallback?requestIdleCallback((()=>e())):requestAnimationFrame((()=>e()))}let x,W;function T(e,t){t||m in e?t&&!(m in t)&&Object.defineProperty(t,m,{value:e}):Object.defineProperty(e,m,{value:e})}function L(e){return Number(e.replace(/[^0-9.\-]/g,""))}function O(e){const t=e.getBoundingClientRect(),{x:n,y:o}=function(e){let t=e.parentElement;for(;t;){if(t.scrollLeft||t.scrollTop)return{x:t.scrollLeft,y:t.scrollTop};t=t.parentElement}return{x:0,y:0}}(e);return{top:t.top+o,left:t.left+n,width:t.width,height:t.height}}function N(e,t,n){let o=t.width,i=t.height,r=n.width,a=n.height;const s=getComputedStyle(e);if("content-box"===s.getPropertyValue("box-sizing")){const e=L(s.paddingTop)+L(s.paddingBottom)+L(s.borderTopWidth)+L(s.borderBottomWidth),t=L(s.paddingLeft)+L(s.paddingRight)+L(s.borderRightWidth)+L(s.borderLeftWidth);o-=t,r-=t,i-=e,a-=e}return[o,r,i,a].map(Math.round)}function j(e){return m in e&&c.has(e[m])?c.get(e[m]):{duration:250,easing:"ease-in-out"}}function C(e){if(m in e)return e[m]}function k(e){const t=C(e);return!!t&&u.has(t)}function S(e,...t){t.forEach((t=>t(e,c.has(e))));for(let n=0;n<e.children.length;n++){const o=e.children.item(n);o&&t.forEach((e=>e(o,c.has(o))))}}function $(e){return Array.isArray(e)?e:[e]}function A(e){return"function"==typeof e}function B(e){w in e&&delete e[w];const t=O(e);i.set(e,t);const n=j(e);if(!k(e))return;let o;if("function"!=typeof n)o=e.animate([{transform:"scale(.98)",opacity:0},{transform:"scale(0.98)",opacity:0,offset:.5},{transform:"scale(1)",opacity:1}],{duration:1.5*n.duration,easing:"ease-in"});else{const[i]=$(n(e,"add",t));o=new Animation(i),o.play()}a.set(e,o),o.addEventListener("finish",b.bind(null,e))}function _(e,t){var n;e.remove(),i.delete(e),r.delete(e),a.delete(e),null===(n=s.get(e))||void 0===n||n.disconnect(),setTimeout((()=>{if(g in e&&delete e[g],Object.defineProperty(e,w,{value:!0,configurable:!0}),t&&e instanceof HTMLElement)for(const n in t)e.style[n]=""}),0)}function H(i){const r=e();let a;return t((()=>{n((()=>{r.value instanceof HTMLElement&&(a=function(e,t={}){x&&W&&(window.matchMedia("(prefers-reduced-motion: reduce)").matches&&!A(t)&&!t.disrespectUserMotionPreference||(u.add(e),"static"===getComputedStyle(e).position&&Object.assign(e.style,{position:"relative"}),S(e,b,E,(e=>null==W?void 0:W.observe(e))),A(t)?c.set(e,t):c.set(e,{duration:250,easing:"ease-in-out",...t}),x.observe(e,{childList:!0}),o.add(e)));return Object.freeze({parent:e,enable:()=>{u.add(e)},disable:()=>{u.delete(e)},isEnabled:()=>u.has(e)})}(r.value,i||{}))}))})),[r,function(e){a&&(e?a.enable():a.disable())}]}"undefined"!=typeof window&&"ResizeObserver"in window&&(f=document.documentElement,x=new MutationObserver(v),W=new ResizeObserver(y),window.addEventListener("scroll",(()=>{h=window.scrollY,p=window.scrollX})),W.observe(f));export{N as g,H as u};