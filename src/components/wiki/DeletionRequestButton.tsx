'use client'

import { useState, useTransition } from 'react'
import { requestDocumentDeletion } from '@/lib/wiki/actions'

type Props = { slug: string }

export default function DeletionRequestButton({ slug }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!reason.trim()) { setErrorMsg('사유를 입력해주세요.'); return }
    startTransition(async () => {
      const result = await requestDocumentDeletion(slug, reason.trim())
      if ('error' in result) {
        setErrorMsg(result.error)
      } else {
        setOpen(false)
        setReason('')
        setErrorMsg('')
        alert('삭제 신청이 접수되었습니다. 관리자 검토 후 처리됩니다.')
      }
    })
  }

  const handleClose = () => {
    setOpen(false)
    setReason('')
    setErrorMsg('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 text-sm text-wiki-text-muted hover:text-red-600 transition-colors"
      >
        삭제 신청
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
          onClick={handleClose}
        >
          <div
            className="bg-wiki-surface border border-wiki-border rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-wiki-text mb-2">문서 삭제 신청</h2>
            <p className="text-sm text-wiki-text-muted mb-4">
              삭제 사유를 입력해주세요. 관리자 검토 후 처리됩니다.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="삭제 사유를 입력해주세요..."
              rows={4}
              className="w-full border border-wiki-border rounded px-3 py-2 text-sm text-wiki-text bg-wiki-bg resize-none focus:outline-none focus:ring-1 focus:ring-wiki-accent"
            />
            {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isPending ? '신청 중...' : '삭제 신청'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
