// 1. Give the cache a versioned name
const CACHE_NAME = "quote-cache-v3"; // <—— bump this when you change files
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/images/tutorial.jpg",
  "/images/icon-192.png",
  "/images/icon-512.png"
];

// 2. Install: cache new assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // activate new SW immediately
});

// 3. Activate: delete old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // take control of all pages
});

// 4. Fetch: serve cache first, then network
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
