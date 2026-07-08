import { registerSW } from 'virtual:pwa-register'

export function registerPwaServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        registration.update().catch(() => {})
      }
    },
  })
}