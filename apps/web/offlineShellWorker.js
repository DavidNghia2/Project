/* global CACHE, ASSETS */
const staticPaths = new Set(ASSETS);
const appRoutes = new Set([
  '/', '/login', '/register', '/account', '/onboarding', '/onboarding/create-company',
  '/accept-invitation', '/dashboard', '/products', '/warehouses', '/categories', '/units',
  '/suppliers', '/stock-in', '/stock-out', '/stocktaking', '/reports', '/alerts', '/users',
  '/settings', '/design-system',
]);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) =>
    cache.addAll(ASSETS.map((path) => new Request(path, { cache: 'reload', credentials: 'omit' })))
  ));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('smart-inventory-shell-') && key !== CACHE)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('authorization')) return;

  // Network-First for HTML navigations so fresh deploys take effect immediately,
  // falling back to cached /index.html only when offline.
  if (request.mode === 'navigate') {
    const normalizedPath = url.pathname.replace(/\/$/, '') || '/';
    if (!appRoutes.has(normalizedPath)) return;
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            cache.put('/index.html', networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const cached = await cache.match('/index.html');
          if (cached) return cached;
          throw new Error('Offline and no cached shell available');
        }
      })
    );
    return;
  }

  // Cache-First for immutable hashed static assets
  if (!url.search && staticPaths.has(url.pathname)) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => (await cache.match(url.pathname)) ?? fetch(request))
    );
  }
});
