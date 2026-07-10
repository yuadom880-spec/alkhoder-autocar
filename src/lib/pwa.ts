import { registerSW } from 'virtual:pwa-register'

const RELOAD_KEY = 'alkhoder_pwa_reload'

async function clearPwaCaches() {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  }
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }
}

export function recoverFromStaleAssets() {
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault()
    const alreadyReloaded = sessionStorage.getItem(RELOAD_KEY) === '1'
    if (!alreadyReloaded) {
      sessionStorage.setItem(RELOAD_KEY, '1')
      window.location.reload()
      return
    }
    sessionStorage.removeItem(RELOAD_KEY)
    void clearPwaCaches().finally(() => window.location.reload())
  })
}

export function registerPwaServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      registration?.update().catch(() => {})
    },
  })
}