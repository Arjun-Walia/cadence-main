// Installability requires a fetch handler. Requests stay on the network
// so signed-in pages are never stored on the phone.
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).catch(
      () =>
        new Response("You are offline. Reconnect to open Proofline.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
    ),
  );
});
