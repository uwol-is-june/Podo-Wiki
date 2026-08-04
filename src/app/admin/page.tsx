import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { checkAdminSession, getAllProfiles, adminLogout, getDeletionRequests, getFeatureRequests, getTroupes } from '@/lib/admin/actions'
import type { Profile } from '@/lib/supabase/types'
import AdminUserTable from './AdminUserTable'
import AdminDeletionTable from './AdminDeletionTable'
import AdminFeatureRequestTable from './AdminFeatureRequestTable'
import AdminTroupeTable from './AdminTroupeTable'

export const metadata: Metadata = { title: '관리자 페이지 — 포도위키' }

type UserFilter = 'all' | 'pending' | 'approved' | 'rejected'
type Section = 'users' | 'deletions' | 'requests' | 'troupes'

const USER_TABS: { label: string; value: UserFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '대기', value: 'pending' },
  { label: '승인', value: 'approved' },
  { label: '거절', value: 'rejected' },
]

function filterProfiles(profiles: Profile[], filter: UserFilter): Profile[] {
  if (filter === 'all') return profiles
  return profiles.filter((p) => p.status === filter)
}

type Props = { searchParams: Promise<{ filter?: string; section?: string }> }

export default async function AdminPage({ searchParams }: Props) {
  const isAdmin = await checkAdminSession()
  if (!isAdmin) redirect('/admin/login')

  const { filter: rawFilter, section: rawSection } = await searchParams

  const section: Section =
    rawSection === 'deletions'
      ? 'deletions'
      : rawSection === 'requests'
        ? 'requests'
        : rawSection === 'troupes'
          ? 'troupes'
          : 'users'
  const filter: UserFilter =
    rawFilter === 'pending' || rawFilter === 'approved' || rawFilter === 'rejected'
      ? rawFilter
      : 'all'

  const [all, deletionRequests, featureRequests, troupes] = await Promise.all([
    getAllProfiles(),
    getDeletionRequests(),
    getFeatureRequests(),
    getTroupes(),
  ])

  const counts = {
    all: all.length,
    pending: all.filter((p) => p.status === 'pending').length,
    approved: all.filter((p) => p.status === 'approved').length,
    rejected: all.filter((p) => p.status === 'rejected').length,
  }
  const users = filterProfiles(all, filter)

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

      {/* 섹션 탭 */}
      <div className="flex items-center gap-0 border-b border-wiki-border mb-6">
        <Link
          href="/admin"
          className={[
            'px-4 py-2 text-sm font-medium transition-colors',
            section === 'users'
              ? 'text-wiki-accent-text border-b-2 border-wiki-accent-text -mb-px'
              : 'text-wiki-text-muted hover:text-wiki-text',
          ].join(' ')}
        >
          회원 관리
        </Link>
        <Link
          href="/admin?section=deletions"
          className={[
            'px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors',
            section === 'deletions'
              ? 'text-wiki-accent-text border-b-2 border-wiki-accent-text -mb-px'
              : 'text-wiki-text-muted hover:text-wiki-text',
          ].join(' ')}
        >
          삭제 신청
          {deletionRequests.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-wiki-accent text-wiki-on-accent">
              {deletionRequests.length}
            </span>
          )}
        </Link>
        <Link
          href="/admin?section=requests"
          className={[
            'px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors',
            section === 'requests'
              ? 'text-wiki-accent-text border-b-2 border-wiki-accent-text -mb-px'
              : 'text-wiki-text-muted hover:text-wiki-text',
          ].join(' ')}
        >
          기능 요청
          {featureRequests.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-wiki-accent text-wiki-on-accent">
              {featureRequests.length}
            </span>
          )}
        </Link>
        <Link
          href="/admin?section=troupes"
          className={[
            'px-4 py-2 text-sm font-medium transition-colors',
            section === 'troupes'
              ? 'text-wiki-accent-text border-b-2 border-wiki-accent-text -mb-px'
              : 'text-wiki-text-muted hover:text-wiki-text',
          ].join(' ')}
        >
          단체 관리
        </Link>
      </div>

      {section === 'users' && (
        <section>
          {/* 유저 필터 탭 */}
          <div className="flex items-center gap-0 border-b border-wiki-border mb-4">
            {USER_TABS.map((tab) => {
              const isActive = filter === tab.value
              return (
                <Link
                  key={tab.value}
                  href={tab.value === 'all' ? '/admin' : `/admin?filter=${tab.value}`}
                  className={[
                    'px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors',
                    isActive
                      ? 'text-wiki-accent-text border-b-2 border-wiki-accent-text -mb-px'
                      : 'text-wiki-text-muted hover:text-wiki-text',
                  ].join(' ')}
                >
                  {tab.label}
                  {counts[tab.value] > 0 && (
                    <span
                      className={[
                        'px-1.5 py-0.5 text-xs rounded-full',
                        tab.value === 'pending'
                          ? 'bg-wiki-accent text-wiki-on-accent'
                          : 'bg-wiki-border text-wiki-text-muted',
                      ].join(' ')}
                    >
                      {counts[tab.value]}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          <div className="bg-wiki-surface border border-wiki-border rounded-lg p-4">
            <AdminUserTable users={users} filter={filter} />
          </div>
        </section>
      )}

      {section === 'deletions' && (
        <section>
          <div className="bg-wiki-surface border border-wiki-border rounded-lg p-4">
            <AdminDeletionTable requests={deletionRequests} />
          </div>
        </section>
      )}

      {section === 'requests' && (
        <section>
          <div className="bg-wiki-surface border border-wiki-border rounded-lg p-4">
            <AdminFeatureRequestTable requests={featureRequests} />
          </div>
        </section>
      )}

      {section === 'troupes' && (
        <section>
          <div className="bg-wiki-surface border border-wiki-border rounded-lg p-4">
            <AdminTroupeTable troupes={troupes} />
          </div>
        </section>
      )}
    </main>
  )
}
