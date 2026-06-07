import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Document } from '@/lib/supabase/types'
import { slugToHref, slugToEditHref } from '@/lib/wiki/slug'
import RevisionList from '@/components/wiki/RevisionList'

type Props = {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = slug.map(decodeURIComponent).join('/')
  return { title: `${decodedSlug} 역사 — 포도위키` }
}

export default async function HistoryPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = slug.map(decodeURIComponent).join('/')
  const supabase = await createClient()

  const { data: document } = await supabase
    .from('documents')
    .select('title')
    .eq('slug', decodedSlug)
    .single() as { data: Pick<Document, 'title'> | null }

  const { data: rawRevisions } = await supabase
    .from('revisions')
    .select('id, edited_at, editor_id, comment, content')
    .eq('document_slug', decodedSlug)
    .order('edited_at', { ascending: false })

  const editorIds = [...new Set(
    (rawRevisions ?? []).map((r) => r.editor_id).filter((id): id is string => id !== null)
  )]

  const { data: profiles } = editorIds.length > 0
    ? await createAdminClient().from('profiles').select('id, name, organization').in('id', editorIds)
    : { data: [] }

  // content는 클라이언트에 넘기지 않고 서버에서 바이트 수만 계산
  const contentBytes = (rawRevisions ?? []).map((r) =>
    Buffer.byteLength(r.content, 'utf8')
  )
  const revisions = (rawRevisions ?? []).map((r, i) => ({
    id: r.id,
    edited_at: r.edited_at,
    editor_id: r.editor_id,
    comment: r.comment,
    contentBytes: contentBytes[i],
    bytesDiff: contentBytes[i] - (contentBytes[i + 1] ?? 0),
  }))

  const title = document?.title ?? decodedSlug

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="mb-0">
        <h1 className="text-2xl font-bold text-wiki-text mb-3">{title}</h1>
        <div className="flex items-center gap-0 border-b border-wiki-border">
          <Link
            href={slugToHref(decodedSlug)}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            보기
          </Link>
          <Link
            href={slugToEditHref(decodedSlug)}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            수정
          </Link>
          <span className="px-4 py-2 text-sm font-medium text-wiki-accent border-b-2 border-wiki-accent -mb-px">
            역사
          </span>
        </div>
      </div>

      <div className="mt-6">
        <RevisionList
          revisions={revisions}
          profiles={profiles ?? []}
        />
      </div>
    </div>
  )
}
