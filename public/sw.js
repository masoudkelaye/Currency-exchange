const CACHE_NAME = "currency-converter-v4";
const STATIC_ASSETS = [
  ".",
  "./index.html",
  "./manifest.json",
];
const FONT_CACHE = "fonts-v1";
const API_CACHE = "api-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== FONT_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // API نرخ: همیشه Network First (کش کهنه نشانگر زنده را خراب نکند)
  if (url.pathname === "/api/rates.json" || url.pathname.endsWith("/rates.json")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => res)
        .catch(() => caches.match(e.request).then((c) => c || Response.error()))
    );
    return;
  }

  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    e.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(e.request).then(
          (cached) =>
            cached ||
            fetch(e.request).then((res) => {
              cache.put(e.request, res.clone());
              return res;
            })
        )
      )
    );
    return;
  }

  if (
    url.hostname === "cdn.jsdelivr.net" ||
    url.hostname === "raw.githubusercontent.com" ||
    url.hostname === "open.er-api.com" ||
    url.hostname === "baha24.com" ||
    url.hostname === "api.allorigins.win" ||
    url.hostname === "api.codetabs.com"
  ) {
    e.respondWith(
      caches.open(API_CACHE).then((cache) =>
        fetch(e.request)
          .then((res) => {
            cache.put(e.request, res.clone());
            return res;
          })
          .catch(() =>
            cache.match(e.request).then((cached) => {
              if (cached) return cached;
              return new Response(JSON.stringify({ error: "offline" }), {
                status: 503,
                headers: { "Content-Type": "application/json" },
              });
            })
          )
      )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).catch(() => caches.match("./index.html"));
    })
  );
});
