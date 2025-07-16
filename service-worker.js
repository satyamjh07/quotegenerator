self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("quote-cache").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js",
        "/manifest.json",
        "/images/tutorial.jpg",
        "/images/icon-192.png",
        "/images/icon-512.png"
        // Add any other images used
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});