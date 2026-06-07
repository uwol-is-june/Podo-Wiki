import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Document } from '@/lib/supabase/types'
import { extractHeadings } from '@/lib/wiki/headings'
import { slugToHref, slugToEditHref, slugToHistoryHref } from '@/lib/wiki/slug'
import MarkdownContent from '@/components/wiki/MarkdownContent'
import TableOfContents from '@/components/wiki/TableOfContents'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('revisions')
    .select('document_slug')
    .eq('id', id)
    .single()
  return { title: data ? `${data.document_slug} 역사 — 포도위키` : '역사 — 포도위키' }
}

export default async function RevisionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: revision } = await supabase
    .from('revisions')
    .select('id, content, edited_at, editor_id, document_slug')
    .eq('id', id)
    .single()

  if (!revision) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-10 text-center text-wiki-text-muted">
        해당 버전을 찾을 수 없습니다.
      </div>
    )
  }

  const slug = revision.document_slug

  const { data: document } = await supabase
    .from('documents')
    .select('title')
    .eq('slug', slug)
    .single() as { data: Pick<Document, 'title'> | null }

  const { data: profile } = revision.editor_id
    ? await createAdminClient()
        .from('profiles')
        .select('name, organization')
        .eq('id', revision.editor_id)
        .single()
    : { data: null }

  const title = document?.title ?? slug
  const headings = extractHeadings(revision.content)
  const editedAt = new Date(revision.edited_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
  const editorName = profile ? `${profile.name} (${profile.organization})` : '알 수 없는 사용자'

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="mb-0">
        <h1 className="text-2xl font-bold text-wiki-text mb-3">{title}</h1>
        <div className="flex items-center gap-0 border-b border-wiki-border">
          <Link
            href={slugToHref(slug)}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            보기
          </Link>
          <Link
            href={slugToEditHref(slug)}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            수정
          </Link>
          <Link
            href={slugToHistoryHref(slug)}
            className="px-4 py-2 text-sm font-medium text-wiki-accent border-b-2 border-wiki-accent -mb-px"
          >
            역사
          </Link>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm">
        <span className="text-amber-800">
          {editedAt} · {editorName}의 버전
        </span>
        <Link
          href={slugToHref(slug)}
          className="text-wiki-accent hover:underline font-medium shrink-0 ml-4"
        >
          최신 버전 보기 →
        </Link>
      </div>

      {headings.length > 0 && (
        <div className="lg:hidden mt-4">
          <TableOfContents headings={headings} variant="mobile" />
        </div>
      )}

      <div className="flex gap-6 mt-4">
        <article className="flex-1 min-w-0 sm:bg-wiki-surface sm:border sm:border-wiki-border sm:rounded-lg sm:p-6">
          <MarkdownContent content={revision.content} />
        </article>
        {headings.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <TableOfContents headings={headings} variant="desktop" />
          </aside>
        )}
      </div>
    </div>
  )
}
