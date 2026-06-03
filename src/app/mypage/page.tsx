import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/auth/actions'
import type { ProfileStatus } from '@/lib/supabase/types'

export const metadata: Metadata = { title: '내 정보 — 포도위키' }

const statusLabel: Record<ProfileStatus, string> = {
  pending: '승인 대기',
  approved: '승인됨',
  rejected: '거부됨',
}

const statusClass: Record<ProfileStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/mypage')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, organization, status, created_at')
    .eq('id', user.id)
    .single()

  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-wiki-text mb-8">내 정보</h1>

      <div className="bg-wiki-surface border border-wiki-border rounded-lg divide-y divide-wiki-border">
        <Row label="이름" value={profile?.name ?? '—'} />
        <Row label="소속 단체" value={profile?.organization ?? '—'} />
        <Row label="이메일" value={user.email ?? '—'} />
        <Row label="가입일" value={joinedAt ?? '—'} />
        <div className="flex items-center px-4 py-3 gap-4">
          <span className="w-24 text-sm text-wiki-text-muted shrink-0">상태</span>
          {profile?.status ? (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClass[profile.status as ProfileStatus]}`}>
              {statusLabel[profile.status as ProfileStatus]}
            </span>
          ) : (
            <span className="text-sm text-wiki-text">—</span>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            로그아웃
          </button>
        </form>
      </div>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center px-4 py-3 gap-4">
      <span className="w-24 text-sm text-wiki-text-muted shrink-0">{label}</span>
      <span className="text-sm text-wiki-text">{value}</span>
    </div>
  )
}
