'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  content: string
  top: number
  left: number
  onClose: () => void
  onSave: (newContent: string) => void
  onDeleteRequest: () => void
}

// 부모가 key={label}로 렌더링해 다른 각주를 클릭하면 새로 마운트되어 mode/draft가 초기화됨
export default function FootnoteRefPopover({ content, top, left, onClose, onSave, onDeleteRequest }: Props) {
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [draft, setDraft] = useState(content)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode === 'edit') setTimeout(() => inputRef.current?.focus(), 0)
  }, [mode])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('mousedown', onDocClick)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDocClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const handleSave = () => {
    if (draft.trim()) onSave(draft.trim())
  }

  return (
    <div
      ref={rootRef}
      style={{ position: 'fixed', top, left }}
      className="z-50 w-64 bg-wiki-surface border border-wiki-border rounded-lg shadow-lg"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {mode === 'view' ? (
        <>
          <div className="px-3 py-2 text-sm text-wiki-text whitespace-normal leading-relaxed max-h-32 overflow-y-auto">
            {content}
          </div>
          <div className="flex justify-end gap-2 px-3 pb-2">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className="px-2 py-1 text-xs border border-wiki-border text-wiki-text rounded hover:border-wiki-accent hover:text-wiki-accent transition-colors"
            >
              수정
            </button>
            <button
              type="button"
              onClick={onDeleteRequest}
              className="px-2 py-1 text-xs border border-wiki-border text-red-500 rounded hover:border-red-400 hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              className="w-full h-9 px-3 rounded text-sm border border-wiki-border bg-wiki-bg text-wiki-text focus:outline-none focus:border-wiki-accent transition-colors"
            />
          </div>
          <div className="flex justify-end gap-2 px-3 pb-2">
            <button
              type="button"
              onClick={() => setMode('view')}
              className="px-2 py-1 text-xs border border-wiki-border text-wiki-text rounded hover:border-wiki-accent hover:text-wiki-accent transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft.trim()}
              className="px-2 py-1 text-xs bg-wiki-accent text-white rounded hover:bg-wiki-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              저장
            </button>
          </div>
        </>
      )}
    </div>
  )
}
