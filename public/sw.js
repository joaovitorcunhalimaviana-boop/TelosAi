// Service Worker for Sistema Pós-Operatório
// Version 1.0.0

const CACHE_NAME = 'pos-op-v2';
const RUNTIME_CACHE = 'pos-op-runtime-v2';
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
  '/icons/vigia-logo.svg',
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


// ============================================
// PUSH NOTIFICATIONS
// ============================================

/**
 * Recebe notificação push do servidor
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);

  // Dados padrão caso o push venha vazio
  let notificationData = {
    title: 'Sistema Pós-Operatório',
    body: 'Você tem uma nova notificação',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: {
      url: '/dashboard',
    },
  };

  // Tentar extrair dados do push
  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload,
      };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  // Configurações da notificação
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon || '/icons/icon-192.png',
    badge: notificationData.badge || '/icons/icon-192.png',
    tag: notificationData.tag || 'default-notification',
    data: notificationData.data || { url: '/dashboard' },
    vibrate: notificationData.vibrate || [200, 100, 200], // Padrão de vibração
    requireInteraction: notificationData.requireInteraction || false,
    actions: notificationData.actions || [],
    // Configurações adicionais
    silent: notificationData.silent || false,
    renotify: notificationData.renotify || false,
    timestamp: notificationData.timestamp || Date.now(),
  };

  // Exibir notificação
  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationOptions
    )
  );
});

/**
 * Quando o usuário clica na notificação
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification);

  const notification = event.notification;
  const data = notification.data || {};
  const action = event.action;

  notification.close();

  // URL para abrir (padrão: dashboard)
  let urlToOpen = data.url || '/dashboard';

  // Se clicar em uma ação específica
  if (action && data.actions) {
    const actionData = data.actions.find(a => a.action === action);
    if (actionData && actionData.url) {
      urlToOpen = actionData.url;
    }
  }

  // Abrir ou focar na janela do app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Tentar encontrar uma janela já aberta no domínio
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          const clientUrl = new URL(client.url);
          const targetUrl = new URL(urlToOpen, self.location.origin);

          // Se já existe uma janela aberta, focar nela e navegar
          if (clientUrl.origin === targetUrl.origin && 'focus' in client) {
            return client.focus().then(() => {
              if ('navigate' in client) {
                return client.navigate(targetUrl.href);
              }
            });
          }
        }

        // Se não houver janela aberta, abrir uma nova
        if (clients.openWindow) {
          const fullUrl = new URL(urlToOpen, self.location.origin).href;
          return clients.openWindow(fullUrl);
        }
      })
  );
});

/**
 * Quando o usuário fecha a notificação sem clicar
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification);

  // Opcional: registrar analytics ou métricas
  const data = event.notification.data;
  if (data && data.trackClose) {
    event.waitUntil(
      fetch('/api/notifications/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'close',
          notificationId: data.id,
          timestamp: Date.now(),
        }),
      }).catch(err => console.error('[SW] Error tracking notification close:', err))
    );
  }
});

console.log('[SW] Service Worker loaded');
