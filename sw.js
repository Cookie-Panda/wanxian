const CACHE_NAME = 'wanxian-v4';
const ASSETS_TO_CACHE = [
    './',
    'index.html',
    'app.js',
    'sw.js',
    'jszip.min.js',
    'presets_data.js',
    'suggestions.js',
    'themes.js',
    'styles.css',
    'css2.css',
    'manifest.json',
    'icons/icon.svg',
    'icons/icon1.png',
    'icons/icon2.png',
    'icons/icon3.png',
    'icons/maskable.png',
    'sykg-zNym6YjUruM-QrEh7-nyTnjDwKNJ_190FjzaqkNCeE.woff2',
    'KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3KUBHMdazTgWw.woff2',
    'KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBHMdazQ.woff2',
    'KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMawCUBHMdazTgWw.woff2'
];

// 1. INSTALL: Cache the "Application Shell"
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching App Shell');
            // IMPORTANT: If any single URL here 404s, the entire installation fails.
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); 
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[SW] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

// 3. FETCH: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Optional: Ignore chrome-extension or non-http requests
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch((err) => {
                // If network fails, we rely on cache. 
                // We suppress the error here so it doesn't clutter console if we have a cache hit.
            });

            return cachedResponse || fetchPromise;
        })
    );
});
