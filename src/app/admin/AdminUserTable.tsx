'use client'

import { useTransition } from 'react'
import { approveProfile, rejectProfile } from '@/lib/admin/actions'
import type { Profile } from '@/lib/supabase/types'

type Filter = 'all' | 'pending' | 'approved' | 'rejected'
type Props = { users: Profile[]; filter: Filter }

const STATUS_LABEL: Record<string, string> = {
  pending: '대기',
  approved: '승인',
  rejected: '거절',
}

const STATUS_CLASS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export default function AdminUserTable({ users, filter }: Props) {
  if (users.length === 0) {
    const emptyMsg =
      filter === 'pending'
        ? '승인 대기 중인 신청이 없습니다.'
        : filter === 'approved'
          ? '승인된 사용자가 없습니다.'
          : filter === 'rejected'
            ? '거절된 사용자가 없습니다.'
            : '등록된 사용자가 없습니다.'
    return <p className="text-wiki-text-muted text-sm py-8 text-center">{emptyMsg}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-wiki-border text-wiki-text-muted text-left">
            <th className="py-3 pr-4 font-medium">이름</th>
            <th className="py-3 pr-4 font-medium">소속 단체</th>
            <th className="py-3 pr-4 font-medium">상태</th>
            <th className="py-3 pr-4 font-medium">가입일</th>
            <th className="py-3 font-medium">처리</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserRow({ user }: { user: Profile }) {
  const [isPending, startTransition] = useTransition()

  const handleApprove = () => {
    startTransition(async () => {
      await approveProfile(user.id)
    })
  }

  const handleReject = () => {
    if (!confirm(`${user.name}님의 가입 신청을 거부하시겠습니까?`)) return
    startTransition(async () => {
      await rejectProfile(user.id)
    })
  }

  const createdAt = new Date(user.created_at).toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return (
    <tr className="border-b border-wiki-border last:border-0">
      <td className="py-3 pr-4 text-wiki-text font-medium">{user.name}</td>
      <td className="py-3 pr-4 text-wiki-text">{user.organization}</td>
      <td className="py-3 pr-4">
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_CLASS[user.status] ?? ''}`}
        >
          {STATUS_LABEL[user.status] ?? user.status}
        </span>
      </td>
      <td className="py-3 pr-4 text-wiki-text-muted">{createdAt}</td>
      <td className="py-3 flex gap-2">
        {user.status !== 'approved' && (
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="px-3 py-1 bg-wiki-accent text-white text-xs rounded hover:bg-wiki-accent-hover transition-colors disabled:opacity-50"
          >
            승인
          </button>
        )}
        {user.status !== 'rejected' && (
          <button
            onClick={handleReject}
            disabled={isPending}
            className="px-3 py-1 border border-wiki-border text-wiki-text-muted text-xs rounded hover:bg-wiki-bg transition-colors disabled:opacity-50"
          >
            거부
          </button>
        )}
      </td>
    </tr>
  )
}
