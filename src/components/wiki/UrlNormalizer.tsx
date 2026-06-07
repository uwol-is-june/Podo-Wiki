'use client'

import { useEffect } from 'react'

export default function UrlNormalizer() {
  useEffect(() => {
    const raw = window.location.href
    const decoded = decodeURI(raw)
    if (decoded !== raw) {
      history.replaceState(null, '', decoded)
    }
  }, [])
  return null
}
