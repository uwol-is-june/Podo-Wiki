'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  onConfirm: (content: string) => void
}

export default function FootnoteInsertModal({ open, onClose, onConfirm }: Props) {
  const [content, setContent] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setContent('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleConfirm = () => {
    if (content.trim()) onConfirm(content.trim())
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-sm bg-wiki-surface border border-wiki-border rounded-lg shadow-xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-wiki-border">
            <p className="text-sm font-medium text-wiki-text">각주 삽입</p>
          </div>
          <div className="p-4">
            <input
              ref={inputRef}
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
              placeholder="각주 내용"
              className="w-full h-9 px-3 rounded text-sm border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors"
            />
          </div>
          <div className="flex justify-end gap-2 px-4 pb-4">
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
              disabled={!content.trim()}
              className="px-3 py-1.5 text-sm bg-wiki-accent text-white rounded hover:bg-wiki-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              삽입
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
