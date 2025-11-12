// Service Worker for Sistema Pós-Operatório
// Version 1.0.0

const CACHE_NAME = 'pos-op-v1';
const RUNTIME_CACHE = 'pos-op-runtime-v1';
const OFFLINE_QUEUE = 'pos-op-offline-queue-v1';

// Essential pages and assets to cache
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/cadastro',
  '/offline',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching essential resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests
          if (request.method === 'GET' && response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // If offline and POST/PUT/DELETE, queue for later
          if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
            await queueRequest(request);
            return new Response(
              JSON.stringify({
                offline: true,
                message: 'Requisição salva. Será enviada quando online.'
              }),
              {
                status: 202,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          }

          // Try to return cached response for GET requests
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline response
          return new Response(
            JSON.stringify({
              error: 'Você está offline',
              offline: true
            }),
            {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Page requests - cache first, network fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version and update in background
            fetch(request).then((response) => {
              if (response.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, response);
                });
              }
            }).catch(() => {});
            return cachedResponse;
          }

          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, responseClone);
                });
              }
              return response;
            })
            .catch(() => {
              return caches.match('/offline') || new Response('Offline');
            });
        })
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
  );
});

// Queue failed requests for background sync
async function queueRequest(request) {
  try {
    const requestData = {
      url: request.url,
      method: request.method,
      headers: {},
      body: null,
      timestamp: Date.now(),
    };

    // Extract headers
    request.headers.forEach((value, key) => {
      requestData.headers[key] = value;
    });

    // Extract body for POST/PUT requests
    if (request.method === 'POST' || request.method === 'PUT') {
      const clonedRequest = request.clone();
      requestData.body = await clonedRequest.text();
    }

    // Store in IndexedDB
    const db = await openDatabase();
    const tx = db.transaction('offline-queue', 'readwrite');
    const store = tx.objectStore('offline-queue');
    await store.add(requestData);

    console.log('[SW] Request queued for sync:', requestData.url);

    // Register background sync
    if ('sync' in self.registration) {
      await self.registration.sync.register('sync-offline-queue');
    }
  } catch (error) {
    console.error('[SW] Error queueing request:', error);
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

// Sync offline queue
async function syncOfflineQueue() {
  try {
    const db = await openDatabase();
    const tx = db.transaction('offline-queue', 'readonly');
    const store = tx.objectStore('offline-queue');
    const requests = await store.getAll();

    console.log('[SW] Syncing', requests.length, 'offline requests');

    for (const reqData of requests) {
      try {
        const response = await fetch(reqData.url, {
          method: reqData.method,
          headers: reqData.headers,
          body: reqData.body,
        });

        if (response.ok) {
          // Remove from queue
          const deleteTx = db.transaction('offline-queue', 'readwrite');
          const deleteStore = deleteTx.objectStore('offline-queue');
          await deleteStore.delete(reqData.timestamp);
          console.log('[SW] Synced request:', reqData.url);

          // Notify clients
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              url: reqData.url,
            });
          });
        }
      } catch (error) {
        console.error('[SW] Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Error syncing offline queue:', error);
  }
}

// Open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pos-op-db', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('offline-queue')) {
        const store = db.createObjectStore('offline-queue', { keyPath: 'timestamp' });
        store.createIndex('url', 'url', { unique: false });
      }

      if (!db.objectStoreNames.contains('pending-patients')) {
        db.createObjectStore('pending-patients', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'SYNC_NOW') {
    syncOfflineQueue();
  }

  if (event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(syncOfflineQueue());
  }
});

console.log('[SW] Service Worker loaded');
