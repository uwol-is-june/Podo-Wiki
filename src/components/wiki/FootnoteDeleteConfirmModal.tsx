'use client'

import { useEffect } from 'react'

type Props = {
  open: boolean
  content: string
  onCancel: () => void
  onConfirm: () => void
}

export default function FootnoteDeleteConfirmModal({ open, content, onCancel, onConfirm }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-sm bg-wiki-surface border border-wiki-border rounded-lg shadow-xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-4 py-3 border-b border-wiki-border">
            <p className="text-sm font-medium text-wiki-text">이 각주를 삭제할까요?</p>
          </div>
          <div className="p-4">
            <p className="text-sm text-wiki-text-muted bg-wiki-bg border border-wiki-border rounded px-3 py-2">
              {content}
            </p>
          </div>
          <div className="flex justify-end gap-2 px-4 pb-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-sm border border-wiki-border text-wiki-text rounded hover:border-wiki-accent hover:text-wiki-accent transition-colors"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              삭제하기
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
