'use client'

import { useState, useEffect } from 'react'
import type { Heading } from '@/lib/wiki/headings'

function TocList({
  headings,
  activeId,
  onLinkClick,
}: {
  headings: Heading[]
  activeId: string
  onLinkClick?: () => void
}) {
  return (
    <ul className="space-y-0.5 text-sm">
      {headings.map(({ level, text, id }) => (
        <li key={id} style={{ paddingLeft: `${(level - 1) * 12}px` }}>
          <a
            href={`#${id}`}
            onClick={onLinkClick}
            className={`block py-0.5 leading-snug hover:text-wiki-accent transition-colors truncate ${
              activeId === id ? 'text-wiki-accent font-medium' : 'text-wiki-text-muted'
            }`}
          >
            {text}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function TableOfContents({
  headings,
  variant = 'desktop',
}: {
  headings: Heading[]
  variant?: 'mobile' | 'desktop'
}) {
  const [activeId, setActiveId] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (variant === 'mobile') {
    return (
      <div className="bg-wiki-surface border border-wiki-border rounded-lg overflow-hidden">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-wiki-text"
        >
          목차
          <span className="text-wiki-text-muted text-xs">{isOpen ? '▲' : '▼'}</span>
        </button>
        {isOpen && (
          <div className="px-4 pb-4">
            <TocList headings={headings} activeId={activeId} onLinkClick={() => setIsOpen(false)} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="sticky top-[66px] bg-wiki-surface border border-wiki-border rounded-lg p-4">
      <p className="text-xs font-semibold text-wiki-text mb-3 uppercase tracking-wide">목차</p>
      <div className="overflow-y-auto max-h-[calc(100vh-130px)]">
        <TocList headings={headings} activeId={activeId} />
      </div>
    </div>
  )
}
