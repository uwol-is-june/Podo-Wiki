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
        aria-label="공유"
        aria-haspopup="menu"
        aria-expanded={open}
        title="공유"
        className="flex items-center justify-center p-2 rounded-md text-wiki-text-muted hover:text-wiki-text hover:bg-wiki-bg transition-colors focus:outline-none focus:ring-1 focus:ring-wiki-accent"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
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
