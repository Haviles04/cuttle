if(!self.define){let e,t={};const i=(i,r)=>(i=new URL(i+".js",r).href,t[i]||new Promise((t=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=t,document.head.appendChild(e)}else e=i,importScripts(i),t()})).then((()=>{let e=t[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(t[o])return;let s={};const l=e=>i(e,o),c={module:{uri:o},exports:s,require:l};t[o]=Promise.all(r.map((e=>c[e]||l(e)))).then((e=>(n(...e),s)))}}define(["./workbox-fa446783"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"registerSW.js",revision:"a66c3c2b547339efea2b71c5e229bb37"},{url:"index.html",revision:"0.097jn01s4r8"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"),{allowlist:[/^\/$/]}))}));
