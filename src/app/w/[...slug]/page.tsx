import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Database, Document } from '@/lib/supabase/types'
import { extractHeadings } from '@/lib/wiki/headings'
import { slugToHref, slugToEditHref, slugToHistoryHref } from '@/lib/wiki/slug'
import MarkdownContent from '@/components/wiki/MarkdownContent'
import TableOfContents from '@/components/wiki/TableOfContents'
import UrlNormalizer from '@/components/wiki/UrlNormalizer'
import Breadcrumb from '@/components/wiki/Breadcrumb'
import DeletionRequestButton from '@/components/wiki/DeletionRequestButton'
import ShareButton from '@/components/wiki/ShareButton'
import { createClient as createServerClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ slug: string[] }>
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
  const decodedSlug = slug.map(decodeURIComponent).join('/')
  const document = await fetchDocument(decodedSlug)
  const title = document ? `${document.title} — 포도위키` : `${decodedSlug} — 포도위키`

  return {
    title,
    openGraph: { title, siteName: '포도위키' },
  }
}

async function fetchExistingSlugs(slugs: string[]): Promise<Set<string>> {
  if (slugs.length === 0) return new Set()
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data } = await supabase
    .from('documents')
    .select('slug')
    .in('slug', slugs)
  return new Set((data ?? []).map((r) => r.slug))
}

export default async function WikiPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = slug.map(decodeURIComponent).join('/')

  const document = await fetchDocument(decodedSlug)

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  let isApprovedUser = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single()
    isApprovedUser = profile?.status === 'approved'
  }

  const segments = decodedSlug.split('/')
  const parentSlugs = segments.slice(0, -1).map((_, i) => segments.slice(0, i + 1).join('/'))
  const existingSlugs = await fetchExistingSlugs(parentSlugs)
  const breadcrumbs = parentSlugs
    .map((s, i) => ({ slug: s, label: segments[i], exists: existingSlugs.has(s) }))
    .filter((b) => b.exists)

  const ogUrl = `https://podo-wiki.vercel.app/w/${decodedSlug}`

  if (!document) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <link rel="canonical" href={ogUrl} />
        <meta property="og:url" content={ogUrl} />
        <UrlNormalizer />
        <div className="bg-wiki-surface border border-wiki-border rounded-lg p-10 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-wiki-text mb-3">
            {decodedSlug}
          </h1>
          <p className="text-wiki-text-muted mb-2">이 문서는 아직 없습니다.</p>
          <p className="text-wiki-text-muted text-sm mb-8">
            아직 작성된 내용이 없어요. 첫 번째로 문서를 만들어보세요.
          </p>
          <Link
            href={slugToEditHref(decodedSlug)}
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
      <link rel="canonical" href={ogUrl} />
      <meta property="og:url" content={ogUrl} />
      <UrlNormalizer />
      {/* 문서 헤더 */}
      <div className="mb-0">
        {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
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
            href={slugToEditHref(decodedSlug)}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            수정
          </Link>
          <Link
            href={slugToHistoryHref(decodedSlug)}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            역사
          </Link>
          <div className="ml-auto flex items-center">
            <ShareButton title={document.title} url={ogUrl} />
            {isApprovedUser && <DeletionRequestButton slug={decodedSlug} />}
          </div>
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
