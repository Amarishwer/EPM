'use client'

import { useEffect } from 'react'

export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // The website remains usable if service-worker registration is unavailable.
    })
  }, [])

  return null
}
