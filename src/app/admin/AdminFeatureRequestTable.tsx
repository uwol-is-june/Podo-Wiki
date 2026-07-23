'use client'

import { useTransition } from 'react'
import { deleteFeatureRequest } from '@/lib/admin/actions'
import type { FeatureRequestRow } from '@/lib/admin/actions'

type Props = { requests: FeatureRequestRow[] }

export default function AdminFeatureRequestTable({ requests }: Props) {
  if (requests.length === 0) {
    return <p className="text-wiki-text-muted text-sm py-8 text-center">접수된 기능 추가 요청이 없습니다.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-wiki-border text-wiki-text-muted text-left">
            <th className="py-3 pr-4 font-medium">내용</th>
            <th className="py-3 pr-4 font-medium">출처</th>
            <th className="py-3 pr-4 font-medium">접수일</th>
            <th className="py-3 font-medium">처리</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <FeatureRequestRowItem key={req.id} req={req} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FeatureRequestRowItem({ req }: { req: FeatureRequestRow }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm('이 요청을 삭제하시겠습니까?')) return
    startTransition(async () => {
      await deleteFeatureRequest(req.id)
    })
  }

  const createdAt = new Date(req.created_at).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <tr className="border-b border-wiki-border last:border-0 align-top">
      <td className="py-3 pr-4 text-wiki-text max-w-md">
        <span className="whitespace-pre-wrap break-words">{req.content}</span>
      </td>
      <td className="py-3 pr-4">
        <span className="text-xs px-1.5 py-0.5 rounded bg-wiki-border text-wiki-text-muted">
          {req.source === 'app' ? '앱' : '웹'}
        </span>
      </td>
      <td className="py-3 pr-4 text-wiki-text-muted whitespace-nowrap">{createdAt}</td>
      <td className="py-3">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          삭제
        </button>
      </td>
    </tr>
  )
}
