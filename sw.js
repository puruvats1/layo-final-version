/* Layo: a small service worker so the app opens from the home screen and keeps working without a connection.
   The page itself is fetched from the network first; everything else is kept as it is used. */
const CACHE = 'layo-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  const keep = (res) => { if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then((k) => k.put(r, c)); } return res; };
  if (r.mode === 'navigate') { e.respondWith(fetch(r).then(keep).catch(() => caches.match(r).then((m) => m || caches.match('./')))); return; }
  e.respondWith(caches.match(r).then((m) => m || fetch(r).then(keep)));
});
