import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { TROUPES } from '@/data/troupes'
import { slugToHref } from '@/lib/wiki/slug'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '포도위키 — 공연단체 인수인계 위키',
}

type RevisionRow = {
  id: string
  document_slug: string
  edited_at: string
  documents: { title: string } | null
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ count: docCount }, { count: memberCount }, { data: recentRevisions }] =
    await Promise.all([
      supabase.from('documents').select('slug', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase
        .from('revisions')
        .select('id, document_slug, edited_at, documents(title)')
        .order('edited_at', { ascending: false })
        .limit(5) as unknown as Promise<{ data: RevisionRow[] | null }>,
    ])

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* 환영 배너 */}
      <div className="bg-wiki-accent text-white rounded-lg px-8 py-7 mb-5">
        <h1 className="text-2xl font-bold mb-1">포도위키</h1>
        <p className="text-white/80 text-sm">
          공연단체의 인수인계 문서를 함께 만들어가는 위키 플랫폼
        </p>
      </div>

      {/* 공연단체 바로가기 */}
      {TROUPES.length > 0 && (
        <section className="bg-wiki-surface border border-wiki-border rounded-lg p-5 mb-5">
          <h2 className="text-sm font-semibold text-wiki-text uppercase tracking-wide mb-4 pb-2 border-b border-wiki-border">
            공연단체
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {TROUPES.map((troupe) => (
              <Link
                key={troupe.slug}
                href={slugToHref(troupe.slug)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-wiki-bg transition-colors group"
              >
                {troupe.logo ? (
                  <Image
                    src={troupe.logo}
                    alt={troupe.name}
                    width={56}
                    height={56}
                    className="rounded-lg object-cover w-14 h-14"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-wiki-accent/10 flex items-center justify-center text-wiki-accent text-xl font-bold">
                    {troupe.name[0]}
                  </div>
                )}
                <span className="text-xs text-wiki-text group-hover:text-wiki-accent transition-colors text-center leading-tight">
                  {troupe.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 메인 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4">
        {/* 왼쪽 컬럼 */}
        <div className="flex flex-col gap-4">
          {/* 공지사항 */}
          <section className="bg-wiki-surface border border-wiki-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-wiki-text uppercase tracking-wide mb-3 pb-2 border-b border-wiki-border">
              공지사항
            </h2>
            <div className="text-sm text-wiki-text leading-relaxed space-y-2">
              <p>
                포도위키에 오신 것을 환영합니다. 공연단체들이 인수인계 문서를 공유하기 위한 위키 플랫폼입니다.
              </p>
              <p>
                문서 편집은 <strong>승인된 회원</strong>만 가능합니다.
                가입 후 관리자 승인을 받으면 문서를 자유롭게 작성하고 수정할 수 있습니다.
              </p>
              <p className="text-wiki-text-muted text-xs pt-1">
                처음이시라면{' '}
                <Link href="/w/포도위키:도움말" className="text-wiki-accent hover:underline">
                  도움말
                </Link>
                을 먼저 읽어보세요.
              </p>
            </div>
          </section>

          {/* 최근 변경 */}
          <section className="bg-wiki-surface border border-wiki-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-wiki-border">
              <h2 className="text-sm font-semibold text-wiki-text uppercase tracking-wide">최근 변경</h2>
              <Link href="/recent" className="text-xs text-wiki-accent hover:underline">
                전체 보기
              </Link>
            </div>
            {!recentRevisions || recentRevisions.length === 0 ? (
              <p className="text-sm text-wiki-text-muted py-4 text-center">
                아직 편집된 문서가 없습니다.
              </p>
            ) : (
              <ul className="divide-y divide-wiki-border/50">
                {recentRevisions.map((rev) => (
                  <li key={rev.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <Link
                      href={slugToHref(rev.document_slug)}
                      className="text-wiki-accent hover:underline truncate"
                    >
                      {rev.documents?.title ?? rev.document_slug}
                    </Link>
                    <span className="text-wiki-text-muted whitespace-nowrap text-xs shrink-0">
                      {new Date(rev.edited_at).toLocaleString('ko-KR', {
                        timeZone: 'Asia/Seoul',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* 오른쪽 컬럼 */}
        <div className="flex flex-col gap-4">
          {/* 통계 */}
          <section className="bg-wiki-surface border border-wiki-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-wiki-text uppercase tracking-wide mb-3 pb-2 border-b border-wiki-border">
              위키 현황
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-wiki-bg rounded-lg">
                <div className="text-3xl font-bold text-wiki-accent">{docCount ?? 0}</div>
                <div className="text-xs text-wiki-text-muted mt-1">총 문서</div>
              </div>
              <div className="text-center p-3 bg-wiki-bg rounded-lg">
                <div className="text-3xl font-bold text-wiki-accent">{memberCount ?? 0}</div>
                <div className="text-xs text-wiki-text-muted mt-1">승인 회원</div>
              </div>
            </div>
          </section>

          {/* 빠른 링크 */}
          <section className="bg-wiki-surface border border-wiki-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-wiki-text uppercase tracking-wide mb-3 pb-2 border-b border-wiki-border">
              빠른 링크
            </h2>
            <nav className="space-y-0.5">
              {[
                { href: '/w/포도위키:규칙', label: '편집 규칙' },
                { href: '/w/포도위키:편집방침', label: '편집방침' },
                { href: '/w/포도위키:도움말', label: '도움말' },
                { href: '/w/포도상점', label: '포도상점' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-sm text-wiki-text hover:text-wiki-accent transition-colors py-1.5"
                >
                  <span className="text-wiki-accent font-medium">›</span>
                  {label}
                </Link>
              ))}
            </nav>
          </section>
        </div>
      </div>
    </div>
  )
}
