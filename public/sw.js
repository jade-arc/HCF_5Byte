const CACHE_NAME = 'wealth-platform-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

const API_CACHE = 'wealth-platform-api-v1';
const DYNAMIC_CACHE = 'wealth-platform-dynamic-v1';

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Error caching static assets:', err);
      });
    })
  );
  
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && !cacheName.includes('google-fonts')) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch Event - Network First for API, Cache First for Static
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - Network First
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // HTML pages - Network First
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - Cache First
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirst(request));
});

// Cache First Strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    console.log('[ServiceWorker] Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (err) {
    console.warn('[ServiceWorker] Fetch failed:', request.url, err);
    
    // Return offline fallback
    return caches.match('/') || new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(
        request.url.includes('/api/') ? API_CACHE : DYNAMIC_CACHE
      );
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (err) {
    console.log('[ServiceWorker] Network request failed, checking cache:', request.url);
    
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline page for navigation
    if (request.mode === 'navigate') {
      return caches.match('/') || new Response(
        'Offline - Page not in cache. Please try again when online.',
        {
          status: 503,
          statusText: 'Service Unavailable',
        }
      );
    }

    // Return generic error response
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable',
    });
  }
}

// Handle Background Sync for offline transactions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Sync pending transactions when coming back online
async function syncTransactions() {
  try {
    const db = await openIndexedDB();
    const pending = await getPendingTransactions(db);
    
    if (pending.length > 0) {
      console.log('[ServiceWorker] Syncing', pending.length, 'pending transactions');
      
      const results = await Promise.allSettled(
        pending.map((tx) => fetch('/api/transactions/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tx),
        }))
      );
      
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      console.log('[ServiceWorker] Synced', successful, 'transactions');
      
      // Notify clients about sync status
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          synced: successful,
          failed: pending.length - successful,
        });
      });
    }
  } catch (err) {
    console.error('[ServiceWorker] Sync error:', err);
  }
}

// Simple IndexedDB helpers
async function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('WealthPlatform', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingTransactions')) {
        db.createObjectStore('pendingTransactions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

async function getPendingTransactions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingTransactions'], 'readonly');
    const store = transaction.objectStore('pendingTransactions');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Push Notifications for portfolio alerts
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'wealth-notification',
      data: data.data || {},
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Wealth Platform', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if page is already open
      for (let client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
