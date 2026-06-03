import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '최근 변경 — 포도위키',
}

const PAGE_SIZE = 20

type RevisionRow = {
  id: string
  document_slug: string
  editor_id: string | null
  edited_at: string
  documents: { title: string } | null
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function RecentPage({ searchParams }: Props) {
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(String(page), 10))
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()

  const { data: revisions, count } = await supabase
    .from('revisions')
    .select('id, document_slug, editor_id, edited_at, documents(title)', { count: 'exact' })
    .order('edited_at', { ascending: false })
    .range(from, to) as { data: RevisionRow[] | null; count: number | null }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-wiki-text mb-1">최근 변경</h1>
      <p className="text-sm text-wiki-text-muted mb-6">
        최근 수정된 문서 목록입니다.
      </p>

      <div className="bg-wiki-surface border border-wiki-border rounded-lg overflow-hidden">
        {!revisions || revisions.length === 0 ? (
          <div className="py-16 text-center text-wiki-text-muted text-sm">
            아직 수정된 문서가 없습니다.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wiki-border bg-wiki-border/10">
                <th className="px-4 py-3 text-left font-semibold text-wiki-text">문서</th>
                <th className="px-4 py-3 text-left font-semibold text-wiki-text w-44">수정 시각</th>
                <th className="px-4 py-3 text-left font-semibold text-wiki-text w-32 hidden sm:table-cell">편집자</th>
              </tr>
            </thead>
            <tbody>
              {revisions.map((rev, i) => (
                <tr
                  key={rev.id}
                  className={`border-b border-wiki-border/50 hover:bg-wiki-border/10 transition-colors ${
                    i === revisions.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/w/${encodeURIComponent(rev.document_slug)}`}
                      className="text-wiki-accent hover:underline font-medium"
                    >
                      {rev.documents?.title ?? rev.document_slug}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-wiki-text-muted whitespace-nowrap">
                    {new Date(rev.edited_at).toLocaleString('ko-KR', {
                      timeZone: 'Asia/Seoul',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-wiki-text-muted hidden sm:table-cell">
                    {rev.editor_id ? rev.editor_id.slice(0, 8) + '…' : '익명'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {currentPage > 1 && (
            <Link
              href={`/recent?page=${currentPage - 1}`}
              className="px-4 py-2 text-sm border border-wiki-border rounded hover:border-wiki-accent hover:text-wiki-accent transition-colors"
            >
              ← 이전
            </Link>
          )}
          <span className="px-3 py-2 text-sm text-wiki-text-muted">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/recent?page=${currentPage + 1}`}
              className="px-4 py-2 text-sm border border-wiki-border rounded hover:border-wiki-accent hover:text-wiki-accent transition-colors"
            >
              다음 →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
