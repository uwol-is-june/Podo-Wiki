'use client'

import { useState } from 'react'

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const decoded = decodeURI(window.location.href)
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(decoded)
      } else {
        const el = document.createElement('textarea')
        el.value = decoded
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
    >
      {copied ? '복사됨' : '링크 복사'}
    </button>
  )
}
