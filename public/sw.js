const CACHE_NAME = "currency-exchange-v1";
const STATIC_ASSETS = [
  ".",
  "./index.html",
  "./icon-192.png",
  "./icon-512.png",
  "./manifest.json",
];
const FONT_CACHE = "fonts-v1";
const API_CACHE = "api-v1";
const API_MAX_AGE = 5 * 60 * 1000; // 5 min

// ── Install: cache static assets ──
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──
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

// ── Fetch: strategy per request type ──
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Google Fonts → Cache First (long-lived)
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

  // API calls → Network First with cache fallback
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
            // Store with timestamp header
            const headers = new Headers(res.headers);
            headers.set("sw-cached-at", Date.now().toString());
            const cachedRes = new Response(res.clone().body, {
              status: res.status,
              statusText: res.statusText,
              headers,
            });
            cache.put(e.request, cachedRes);
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

  // Everything else → Cache First with network fallback (SPA)
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).catch(() => caches.match("./index.html"));
    })
  );
});
