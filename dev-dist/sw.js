if (!self.define) {
  let e,
    t = {};
  const i = (i, o) => (
    (i = new URL(i + '.js', o).href),
    t[i] ||
      new Promise((t) => {
        if ('document' in self) {
          const e = document.createElement('script');
          (e.src = i), (e.onload = t), document.head.appendChild(e);
        } else {
          (e = i), importScripts(i), t();
        }
      }).then(() => {
        let e = t[i];
        if (!e) {
          throw new Error(`Module ${i} didn’t register its module`);
        }
        return e;
      })
  );
  self.define = (o, r) => {
    const n = e || ('document' in self ? document.currentScript.src : '') || location.href;
    if (t[n]) {
      return;
    }
    let s = {};
    const l = (e) => i(e, n),
      u = { module: { uri: n }, exports: s, require: l };
    t[n] = Promise.all(o.map((e) => u[e] || l(e))).then((e) => (r(...e), s));
  };
}
define(['./workbox-fa446783'], function (e) {
  'use strict';
  self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: 'd19e07c20f7e43ba94e5a5061055e790' },
        { url: 'index.html', revision: '0.tsrl1omb4ko' },
      ],
      {},
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL('index.html'), { allowlist: [/^\/$/] }));
});
