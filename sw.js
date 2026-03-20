self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).catch(function() {
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
