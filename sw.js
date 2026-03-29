var CACHE_VERSION = 'vi-v3.0.0-beta';

// On install, clean up and activate immediately
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

// On activate, delete old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) { return name !== CACHE_VERSION; })
          .map(function(name) { return caches.delete(name); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Network-first with cache update: always try network, cache response, fallback to cache
self.addEventListener('fetch', function(e) {
  // Only cache GET requests for our own origin
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(function(response) {
      // Cache the fresh response
      if (response.ok) {
        var clone = response.clone();
        caches.open(CACHE_VERSION).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});

// ── Push Notifications ──────────────────────────────
self.addEventListener('push', function(event) {
  var data = { title: 'Void Invaders', body: 'New event awaits!', url: '/my-game/' };
  if (event.data) {
    try { data = Object.assign(data, event.data.json()); } catch(e) {}
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/my-game/icon-192.png',
      badge: '/my-game/icon-192.png',
      data: { url: data.url || '/my-game/' },
      vibrate: [100, 50, 100]
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var url = event.notification.data && event.notification.data.url || '/my-game/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf('/my-game/') !== -1 && 'focus' in list[i]) return list[i].focus();
      }
      return clients.openWindow(url);
    })
  );
});
