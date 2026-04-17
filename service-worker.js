const CACHE = 'writing-v1';

const LOCAL_ASSETS = [
  './',
  './index.html',
  './Markdown.Converter.js',
  './Markdown.Sanitizer.js',
  './Markdown.Editor.js',
  './Markdown.Extra.js',
  './mathjax-editing_writing.js',
  './cmunrm.otf',
  './cmunrb.otf',
  './favicon.ico',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(LOCAL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache CDN assets (MathJax, jQuery) on first fetch
        if (response.ok && (event.request.url.includes('cdnjs.cloudflare.com') || event.request.url.includes('googleapis.com'))) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
