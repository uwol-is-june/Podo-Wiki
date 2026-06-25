'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { approveDeletion, rejectDeletion } from '@/lib/admin/actions'
import type { DeletionRequestWithDetails } from '@/lib/admin/actions'
import { slugToHref } from '@/lib/wiki/slug'

type Props = { requests: DeletionRequestWithDetails[] }

export default function AdminDeletionTable({ requests }: Props) {
  if (requests.length === 0) {
    return <p className="text-wiki-text-muted text-sm py-8 text-center">대기 중인 삭제 신청이 없습니다.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-wiki-border text-wiki-text-muted text-left">
            <th className="py-3 pr-4 font-medium">문서</th>
            <th className="py-3 pr-4 font-medium">신청자</th>
            <th className="py-3 pr-4 font-medium">사유</th>
            <th className="py-3 pr-4 font-medium">역링크</th>
            <th className="py-3 pr-4 font-medium">신청일</th>
            <th className="py-3 font-medium">처리</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <DeletionRow key={req.id} req={req} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DeletionRow({ req }: { req: DeletionRequestWithDetails }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    const backlinkWarning = req.backlink_count > 0
      ? `\n\n⚠️ 이 문서로 연결된 링크가 ${req.backlink_count}개 있습니다. 해당 링크는 레드 링크가 됩니다.`
      : ''
    if (!confirm(`"${req.document_title}" 문서를 삭제하시겠습니까?${backlinkWarning}`)) return
    startTransition(async () => {
      await approveDeletion(req.document_slug)
    })
  }

  const handleReject = () => {
    if (!confirm(`"${req.document_title}" 삭제 신청을 거부하시겠습니까?`)) return
    startTransition(async () => {
      await rejectDeletion(req.id)
    })
  }

  const createdAt = new Date(req.created_at).toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return (
    <tr className="border-b border-wiki-border last:border-0">
      <td className="py-3 pr-4">
        <Link
          href={slugToHref(req.document_slug)}
          className="text-wiki-accent hover:underline font-medium"
          target="_blank"
        >
          {req.document_title}
        </Link>
      </td>
      <td className="py-3 pr-4 text-wiki-text">
        {req.requester_name}
        {req.requester_organization && (
          <span className="text-wiki-text-muted text-xs block">{req.requester_organization}</span>
        )}
      </td>
      <td className="py-3 pr-4 text-wiki-text max-w-48">
        <span className="line-clamp-2">{req.reason}</span>
      </td>
      <td className="py-3 pr-4">
        {req.backlink_count > 0 ? (
          <span className="text-yellow-600 font-medium">{req.backlink_count}개</span>
        ) : (
          <span className="text-wiki-text-muted">없음</span>
        )}
      </td>
      <td className="py-3 pr-4 text-wiki-text-muted">{createdAt}</td>
      <td className="py-3 flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          삭제
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="px-3 py-1 border border-wiki-border text-wiki-text-muted text-xs rounded hover:bg-wiki-bg transition-colors disabled:opacity-50"
        >
          거부
        </button>
      </td>
    </tr>
  )
}
