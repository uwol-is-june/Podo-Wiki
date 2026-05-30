import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { checkAdminSession, getPendingProfiles, adminLogout } from '@/lib/admin/actions'
import AdminUserTable from './AdminUserTable'

export const metadata: Metadata = { title: '관리자 페이지 — 포도위키' }

export default async function AdminPage() {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) redirect('/admin/login')

  const pending = await getPendingProfiles()

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-wiki-text">관리자 페이지</h1>
        <form action={adminLogout}>
          <button
            type="submit"
            className="text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            로그아웃
          </button>
        </form>
      </div>

      <section>
        <h2 className="text-base font-semibold text-wiki-text mb-4">
          가입 신청 대기{' '}
          {pending.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-wiki-accent text-white text-xs rounded-full">
              {pending.length}
            </span>
          )}
        </h2>
        <div className="bg-wiki-surface border border-wiki-border rounded-lg p-4">
          <AdminUserTable users={pending} />
        </div>
      </section>
    </main>
  )
}
