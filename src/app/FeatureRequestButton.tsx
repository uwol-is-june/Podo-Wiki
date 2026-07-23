'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const MIN_LEN = 5
const MAX_LEN = 2000

export default function FeatureRequestButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 text-sm text-wiki-text hover:text-wiki-accent transition-colors py-1.5 text-left"
      >
        <span className="text-wiki-accent font-medium">›</span>
        기능 추가 요청
      </button>
      {open && <FeatureRequestModal onClose={() => setOpen(false)} />}
    </>
  )
}

function FeatureRequestModal({ onClose }: { onClose: () => void }) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle')
  const [error, setError] = useState('')

  // ESC 로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const trimmed = content.trim()
  const canSubmit = trimmed.length >= MIN_LEN && trimmed.length <= MAX_LEN && status !== 'submitting'

  const handleSubmit = async () => {
    if (!canSubmit) return
    setStatus('submitting')
    setError('')
    const supabase = createClient()
    const { error: insertError } = await supabase
      .from('feature_requests')
      .insert({ content: trimmed, source: 'web' })
    if (insertError) {
      setError('제출에 실패했습니다. 잠시 후 다시 시도해주세요.')
      setStatus('idle')
      return
    }
    setStatus('done')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="기능 추가 요청"
    >
      <div
        className="w-full max-w-md bg-wiki-surface border border-wiki-border rounded-lg p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {status === 'done' ? (
          <div className="text-center py-4">
            <p className="text-wiki-text font-medium mb-1">요청이 접수되었습니다 🙌</p>
            <p className="text-wiki-text-muted text-sm mb-5">
              소중한 의견 감사합니다. 검토 후 반영하겠습니다.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-wiki-accent text-white text-sm rounded hover:bg-wiki-accent/90 transition-colors"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-wiki-text">기능 추가 요청</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="닫기"
                className="text-wiki-text-muted hover:text-wiki-text transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-wiki-text-muted text-xs mb-3">
              추가되었으면 하는 기능이나 개선 아이디어를 자유롭게 남겨주세요. (익명)
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_LEN}
              rows={5}
              autoFocus
              placeholder="예: 문서에 즐겨찾기 기능이 있으면 좋겠어요."
              className="w-full resize-none rounded border border-wiki-border bg-wiki-bg px-3 py-2 text-sm text-wiki-text placeholder:text-wiki-text-muted/60 focus:outline-none focus:border-wiki-accent"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-wiki-text-muted">
                {error ? <span className="text-red-600">{error}</span> : `${trimmed.length} / ${MAX_LEN}`}
              </span>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-wiki-border text-wiki-text-muted text-sm rounded hover:bg-wiki-bg transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-4 py-2 bg-wiki-accent text-white text-sm rounded hover:bg-wiki-accent/90 transition-colors disabled:opacity-50"
              >
                {status === 'submitting' ? '제출 중…' : '제출'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
