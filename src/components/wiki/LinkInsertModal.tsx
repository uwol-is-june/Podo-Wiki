'use client'

import { useState, useEffect, useRef } from 'react'
import { searchDocuments } from '@/lib/wiki/search-actions'
import { slugToHref } from '@/lib/wiki/slug'

type Tab = 'internal' | 'external'
type DocResult = { slug: string; title: string }

type Props = {
  open: boolean
  initialHref: string
  initialText: string
  onClose: () => void
  onConfirm: (href: string, text: string) => void
  onRemove: () => void
}

export default function LinkInsertModal({ open, initialHref, initialText, onClose, onConfirm, onRemove }: Props) {
  const isInitiallyInternal = initialHref.startsWith('/w/')
  const [tab, setTab] = useState<Tab>(isInitiallyInternal ? 'internal' : initialHref ? 'external' : 'internal')
  const [linkText, setLinkText] = useState(initialText)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<DocResult[]>([])
  const [selected, setSelected] = useState<DocResult | null>(null)
  const [externalUrl, setExternalUrl] = useState('')

  const linkTextRef = useRef<HTMLInputElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const externalRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const isInternal = initialHref.startsWith('/w/')
    setTab(isInternal ? 'internal' : initialHref ? 'external' : 'internal')
    setLinkText(initialText)
    setSearch('')
    setResults([])
    setExternalUrl(isInternal ? '' : initialHref)
    if (isInternal) {
      const slug = decodeURIComponent(initialHref.slice(3))
      searchDocuments(slug).then((data) => {
        const match = data.find((d) => d.slug === slug)
        setSelected(match ?? null)
      })
    } else {
      setSelected(null)
    }
  }, [open, initialHref, initialText])

  useEffect(() => {
    if (!open) return
    setTimeout(() => {
      if (tab === 'internal') searchRef.current?.focus()
      else linkTextRef.current?.focus()
    }, 0)
  }, [open, tab])

  useEffect(() => {
    if (tab !== 'internal' || !search.trim()) { setResults([]); return }
    let cancelled = false
    searchDocuments(search.trim()).then((data) => {
      if (!cancelled) setResults(data)
    })
    return () => { cancelled = true }
  }, [search, tab])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleConfirm = () => {
    if (tab === 'internal') {
      if (!selected) return
      const href = slugToHref(selected.slug)
      const finalText = linkText.trim() || selected.title
      onConfirm(href, finalText)
    } else {
      const raw = externalUrl.trim()
      if (!raw) return
      const href = /^[a-z][a-z\d+\-.]*:/i.test(raw) ? raw : `https://${raw}`
      const finalText = linkText.trim() || href
      onConfirm(href, finalText)
    }
  }

  const canConfirm = tab === 'internal' ? !!selected : !!externalUrl.trim()

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-sm bg-wiki-surface border border-wiki-border rounded-lg shadow-xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 탭 헤더 */}
          <div className="flex border-b border-wiki-border">
            {(['internal', 'external'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'text-wiki-accent border-b-2 border-wiki-accent -mb-px'
                    : 'text-wiki-text-muted hover:text-wiki-text'
                }`}
              >
                {t === 'internal' ? '내부 문서' : '외부 링크'}
              </button>
            ))}
          </div>

          {/* 내용 */}
          <div className="p-4 space-y-3 min-h-[120px]">
            <input
              ref={linkTextRef}
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') tab === 'internal' ? searchRef.current?.focus() : externalRef.current?.focus() }}
              placeholder="링크로 표시할 텍스트"
              className="w-full h-9 px-3 rounded text-sm border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors"
            />
            {tab === 'internal' ? (
              <div className="space-y-2">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelected(null) }}
                  placeholder="문서 제목으로 검색..."
                  className="w-full h-9 px-3 rounded text-sm border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors"
                />
                {selected && !search && (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-wiki-accent/10 border border-wiki-accent/30">
                    <span className="text-wiki-accent font-medium">{selected.title}</span>
                    <span className="text-wiki-text-muted text-xs">{selected.slug}</span>
                  </div>
                )}
                {results.length > 0 && (
                  <ul className="border border-wiki-border rounded overflow-hidden">
                    {results.map((doc) => (
                      <li key={doc.slug}>
                        <button
                          type="button"
                          onClick={() => { setSelected(doc); setSearch('') }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-wiki-border/30 transition-colors"
                        >
                          <span className="text-wiki-text">{doc.title}</span>
                          <span className="ml-2 text-xs text-wiki-text-muted">{doc.slug}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {search && results.length === 0 && (
                  <p className="text-sm text-wiki-text-muted px-1">검색 결과가 없어요.</p>
                )}
              </div>
            ) : (
              <input
                ref={externalRef}
                type="text"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && canConfirm) handleConfirm() }}
                placeholder="https://example.com"
                className="w-full h-9 px-3 rounded text-sm border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors"
              />
            )}
          </div>

          {/* 하단 버튼 */}
          <div className="flex items-center justify-between gap-2 px-4 pb-4">
            {initialHref ? (
              <button
                type="button"
                onClick={onRemove}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                링크 제거
              </button>
            ) : <span />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-sm border border-wiki-border text-wiki-text rounded hover:border-wiki-accent hover:text-wiki-accent transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm}
                className="px-3 py-1.5 text-sm bg-wiki-accent text-white rounded hover:bg-wiki-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
