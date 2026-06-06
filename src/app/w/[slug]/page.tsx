import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Database, Document } from '@/lib/supabase/types'
import { extractHeadings } from '@/lib/wiki/headings'
import { slugToHref } from '@/lib/wiki/slug'
import MarkdownContent from '@/components/wiki/MarkdownContent'
import TableOfContents from '@/components/wiki/TableOfContents'

type Props = {
  params: Promise<{ slug: string }>
}

const fetchDocument = (slug: string) =>
  unstable_cache(
    async () => {
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data } = await supabase
        .from('documents')
        .select('slug, title, content, author_id, created_at, updated_at')
        .eq('slug', slug)
        .single()
      return (data as Document | null)
    },
    [`document`, slug],
    { revalidate: false, tags: [`document:${slug}`] }
  )()

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const document = await fetchDocument(decodedSlug)

  return {
    title: document ? `${document.title} — 포도위키` : `${decodedSlug} — 포도위키`,
  }
}

export default async function WikiPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const document = await fetchDocument(decodedSlug)

  if (!document) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="bg-wiki-surface border border-wiki-border rounded-lg p-10 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-wiki-text mb-3">
            {decodedSlug}
          </h1>
          <p className="text-wiki-text-muted mb-2">이 문서는 아직 없습니다.</p>
          <p className="text-wiki-text-muted text-sm mb-8">
            아직 작성된 내용이 없어요. 첫 번째로 문서를 만들어보세요.
          </p>
          <Link
            href={`${slugToHref(decodedSlug)}/edit`}
            className="inline-block px-5 py-2 bg-wiki-accent text-white rounded hover:bg-wiki-accent-hover transition-colors text-sm font-medium"
          >
            새 문서 만들기
          </Link>
        </div>
      </div>
    )
  }

  const headings = extractHeadings(document.content)

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* 문서 헤더 */}
      <div className="mb-0">
        <h1 className="text-2xl font-bold text-wiki-text mb-3">
          {document.title}
        </h1>
        <div className="flex items-center gap-0 border-b border-wiki-border">
          <Link
            href={slugToHref(decodedSlug)}
            className="px-4 py-2 text-sm font-medium text-wiki-accent border-b-2 border-wiki-accent -mb-px"
          >
            보기
          </Link>
          <Link
            href={`${slugToHref(decodedSlug)}/edit`}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            수정
          </Link>
          <Link
            href={`${slugToHref(decodedSlug)}/history`}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            역사
          </Link>
        </div>
      </div>

      {/* 모바일 TOC */}
      {headings.length > 0 && (
        <div className="lg:hidden mt-4">
          <TableOfContents headings={headings} variant="mobile" />
        </div>
      )}

      {/* 본문 영역 */}
      <div className="flex gap-6 mt-6">
        {/* 문서 본문 */}
        <article className="flex-1 min-w-0 sm:bg-wiki-surface sm:border sm:border-wiki-border sm:rounded-lg sm:p-6">
          <MarkdownContent content={document.content} />
        </article>

        {/* 데스크탑 TOC 사이드바 */}
        {headings.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <TableOfContents headings={headings} variant="desktop" />
          </aside>
        )}
      </div>

      {/* 문서 메타 정보 */}
      <div className="mt-4 text-xs text-wiki-text-muted">
        최종 수정: {new Date(document.updated_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
      </div>
    </div>
  )
}
