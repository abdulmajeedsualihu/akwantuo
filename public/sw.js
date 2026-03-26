const CACHE_NAME = 'shopsnap-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Bypass SW for Vite HMR and development-only resources to avoid dev-server conflicts
  if (event.request.url.includes('/@react-refresh') ||
    event.request.url.includes('/src/') ||
    event.request.url.includes('/@vite/client') ||
    event.request.url.includes('.supabase.co')) {
    return;
  }

  // Navigation fallback for SPAs
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch((err) => {
        // Silently catch fetch errors to avoid "Uncaught (in promise)" in console
        console.warn('[SW] Fetch failed for:', event.request.url, err);

        // We MUST return a Response object if we called respondWith
        return new Response('Network error or Offline', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});
