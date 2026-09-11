/* 兼职收入账本 Service Worker：离线可用 + 快速打开 */
'use strict';
const CACHE = 'jzjz-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest?v=3',
  './icons/icon-192.png?v=3',
  './icons/icon-512.png?v=3',
  './icons/icon-maskable-512.png?v=3',
  './icons/apple-touch-icon.png?v=3'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 同源资源：缓存优先，网络更新
  if (new URL(e.request.url).origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true }).then(cached => {
        const fetchPromise = fetch(e.request).then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, copy));
          }
          return res;
        }).catch(() => cached || caches.match('./index.html'));
        return cached || fetchPromise;
      })
    );
  }
});
