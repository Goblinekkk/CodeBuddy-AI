// Jednoduchý Service Worker, který se okamžitě aktualizuje
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Nesnažíme se o cache, bereme vždy čerstvá data
    event.respondWith(fetch(event.request));
});
