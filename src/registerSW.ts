// Service Worker registration with inline SW via Blob
// Works even when the app is served as a single file

const SW_CODE = `
const CACHE_NAME = "currency-v4";
const API_CACHE = "api-v1";
const FONT_CACHE = "fonts-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== API_CACHE && k !== FONT_CACHE)
            .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Fonts: Cache First
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(e.request).then((c) =>
          c || fetch(e.request).then((r) => { cache.put(e.request, r.clone()); return r; })
        )
      )
    );
    return;
  }

  // API: Network First + cache fallback
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
          .then((r) => { cache.put(e.request, r.clone()); return r; })
          .catch(() => cache.match(e.request).then((c) =>
            c || new Response(JSON.stringify({error:"offline"}), {status:503, headers:{"Content-Type":"application/json"}})
          ))
      )
    );
    return;
  }

  // Same-origin: Cache First
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(e.request).then((c) => {
          const fetchPromise = fetch(e.request).then((r) => {
            cache.put(e.request, r.clone());
            return r;
          }).catch(() => c);
          return c || fetchPromise;
        })
      )
    );
    return;
  }
});
`;

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js").catch(() => null);
      if (reg) {
        console.log("SW registered from file");
        return;
      }

      const blob = new Blob([SW_CODE], { type: "application/javascript" });
      const swUrl = URL.createObjectURL(blob);
      await navigator.serviceWorker.register(swUrl, { scope: "/" }).catch(() => {
        return navigator.serviceWorker.register(swUrl);
      });
      console.log("SW registered from blob");
    } catch (err) {
      console.log("SW registration failed:", err);
    }
  });
}
