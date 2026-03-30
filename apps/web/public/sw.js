// Service Worker — ERP PDV
// Caches shell assets for offline use

const CACHE_NAME = 'erp-pdv-v1'
const SHELL_ASSETS = [
  '/',
  '/pdv',
  '/cardapio',
]

// Install: cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  )
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for same-origin
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith(self.location.origin)) return

  // Skip Vite HMR websocket
  if (event.request.url.includes('/@')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok && response.status < 400) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(event.request).then((cached) =>
          cached ?? caches.match('/').then((root) => root ?? new Response('Offline', { status: 503 }))
        )
      )
  )
})
