export {};

// Listen for incoming OS Web Push Notifications
addEventListener("push", (event: any) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || "Semestr — Pengingat Akademik";
    const options: any = {
      body: payload.body || "Ada agenda kuliah atau tugas yang perlu Anda periksa.",
      icon: payload.icon || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: payload.tag || "semestr-reminder",
      data: {
        url: payload.url || "/dashboard",
      },
    };

    event.waitUntil((self as any).registration.showNotification(title, options));
  } catch (err) {
    console.error("Push event handling error:", err);
    const text = event.data.text();
    event.waitUntil(
      (self as any).registration.showNotification("Semestr — Notifikasi", {
        body: text,
        icon: "/icons/icon-192.png",
        data: { url: "/dashboard" },
      })
    );
  }
});

// Listen for notification click to focus or open target URL
addEventListener("notificationclick", (event: any) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    (self as any).clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients: any[]) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if ((self as any).clients.openWindow) {
        return (self as any).clients.openWindow(targetUrl);
      }
    })
  );
});
