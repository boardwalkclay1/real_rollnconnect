// service-worker.js

const CACHE_NAME = "rollnconnect-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/find-spots.html",
  "/events.html",
  "/profile.html",
  "/css/app.css",
  "/js/app.js",
  "/js/map.js",
  "/js/spots.js",
  "/js/events.js",
  "/js/profile.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
