// Keeps the app working offline. Online it always fetches the newest files; offline it uses the saved copy.
const CACHE = "gym-log-v4";
const SHELL = ["./", "index.html", "manifest.json", "apple-touch-icon.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.endsWith("/version.json")) {
    e.respondWith(fetch(url.href, { cache: "no-store" }).catch(() => new Response("{}", { headers: { "content-type": "application/json" } })));
    return;
  }
  e.respondWith(fetch(url.href, { cache: "no-cache", credentials: "same-origin" }).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
});
