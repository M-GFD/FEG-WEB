/* FEG — service worker para notificaciones push (PWA). */
self.addEventListener("push", (event) => {
  let payload = {
    title: "FEG",
    body: "",
    url: "/",
    icon: "",
    badge: "",
  };
  try {
    if (event.data) {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    }
  } catch {
    try {
      const t = event.data?.text();
      if (t) payload.body = t;
    } catch {
      /* ignore */
    }
  }

  const origin = self.location.origin;
  const icon = payload.icon || `${origin}/LOGO_FEG%201.svg`;
  const badge = payload.badge || icon;
  const tag = typeof payload.tag === "string" && payload.tag.length > 0 ? payload.tag : "feg-push";

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body || "Novedades en la Federación Entrerriana de Golf",
      icon,
      badge,
      data: { url: payload.url || "/" },
      vibrate: [120, 60, 120],
      tag,
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data && event.notification.data.url;
  let url = typeof raw === "string" && raw.length > 0 ? raw : "/";
  if (url.startsWith("/")) {
    url = `${self.location.origin}${url}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client && client.url === url) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
