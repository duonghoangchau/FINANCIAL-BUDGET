'use client'

import { useEffect } from 'react'

export function PwaRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister())
      })

      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys
            .filter((key) => key.startsWith('budgetflow-shell'))
            .forEach((key) => caches.delete(key))
        })
      }

      return
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch (error) {
        console.error('PWA registration failed', error)
      }
    }

    register()
  }, [])

  return null
}
