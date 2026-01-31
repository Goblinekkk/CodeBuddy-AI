const CACHE_NAME = 'buddy-v2';
const ASSETS = ['./', './index.html', './style.css', './script.js', './CodeBuddy-AI-Logo.png', './manifest.json'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
