const CACHE_NAME = "inventory-pwa-v4";

const STATIC_FILES = [
  "./",
  "./index.html",
  "./sales.html",
  "./inventory.html",

  "./app.js",
  "./sales.js",
  "./inventory.js",

  "./style.css",
  "./manifest.json"
];

// =====================
// INSTALL EVENT
// =====================
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_FILES);
    })
  );

  self.skipWaiting();
});

// =====================
// ACTIVATE EVENT (IMPORTANT FOR UPDATES)
// =====================
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// =====================
// FETCH EVENT (FIXED FOR PWA + 404 ISSUE)
// =====================
self.addEventListener("fetch", event => {

  // Handle navigation (THIS FIXES 404 AFTER INSTALL)
// Handle HTML pages
if (event.request.mode === "navigate") {

    event.respondWith(
        fetch(event.request)
        .catch(() => caches.match(event.request))
    );

    return;
}
  // API requests → always network (IMPORTANT for Supabase)
  if (event.request.url.includes("/rest/v1/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Static assets → cache first with update
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});