'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  title: string
  url: string
}

export default function ShareButton({ title, url }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url })
      setOpen(false)
    } catch {
      // 사용자가 공유 시트를 취소한 경우 등 — 무시
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
      >
        공유
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-wiki-surface border border-wiki-border rounded-lg shadow-lg py-1">
          <button
            onClick={handleCopy}
            className="w-full text-left px-4 py-2 text-sm text-wiki-text hover:bg-wiki-bg transition-colors"
          >
            {copied ? '복사됨!' : '링크 복사'}
          </button>
          {canNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full text-left px-4 py-2 text-sm text-wiki-text hover:bg-wiki-bg transition-colors"
            >
              공유하기
            </button>
          )}
        </div>
      )}
    </div>
  )
}
