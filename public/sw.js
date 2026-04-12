self.addEventListener('push', (event) => {
  let data = { title: 'FLINCH', body: 'Time to reflect.', slot: 1 }

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: { slot: data.slot },
    tag: `awaken-slot-${data.slot}`,
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(data.title || 'FLINCH', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const slot = event.notification.data?.slot || 1
  const url = `/respond?slot=${slot}`

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes('/respond') && 'focus' in client) {
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
