// The service worker of the app: everything it needs is kept here, so it also starts without internet, and
// the whole set is swapped for the next build at once. The build writes VERSION and FILES in
// (vite.config.js); the page asks for a new one at start, every hour and whenever it comes back into view.
const VERSION = '__VERSION__';
const FILES = __FILES__;
const CACHE = `scoutingtechnieken-${VERSION}`;
const inScope = (path) => new URL(path, self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // past the HTTP cache: a host may keep files for minutes, and these have to be the new build
    await cache.addAll(FILES.map((file) => new Request(inScope(file), { cache: 'reload' })));
    await self.skipWaiting();                                      // the page offers to start again with it
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('scoutingtechnieken-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

// only the app's own files are answered from here; anything else (a link to another site) goes to the network
const OWN = new Set(FILES.map(inScope));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url); url.search = ''; url.hash = '';
  // the app lives on one page: any navigation inside the scope gets it
  const key = event.request.mode === 'navigate' && url.href.startsWith(self.registration.scope) ? inScope('./') : url.href;
  if (!OWN.has(key)) return;
  event.respondWith((async () => (await (await caches.open(CACHE)).match(key)) ?? fetch(event.request))());
});
