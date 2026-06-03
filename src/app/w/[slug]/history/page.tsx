import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Document } from '@/lib/supabase/types'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `${decodeURIComponent(slug)} 역사 — 포도위키` }
}

export default async function HistoryPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  const supabase = await createClient()

  const { data: document } = await supabase
    .from('documents')
    .select('title')
    .eq('slug', decodedSlug)
    .single() as { data: Pick<Document, 'title'> | null }

  const { data: revisions } = await supabase
    .from('revisions')
    .select('id, edited_at, editor_id')
    .eq('document_slug', decodedSlug)
    .order('edited_at', { ascending: false })

  const editorIds = [...new Set(
    (revisions ?? []).map((r) => r.editor_id).filter((id): id is string => id !== null)
  )]

  const { data: profiles } = editorIds.length > 0
    ? await supabase.from('profiles').select('id, name, organization').in('id', editorIds)
    : { data: [] }

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const title = document?.title ?? decodedSlug

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="mb-0">
        <h1 className="text-2xl font-bold text-wiki-text mb-3">{title}</h1>
        <div className="flex items-center gap-0 border-b border-wiki-border">
          <Link
            href={`/w/${encodeURIComponent(decodedSlug)}`}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            보기
          </Link>
          <Link
            href={`/w/${encodeURIComponent(decodedSlug)}/edit`}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            수정
          </Link>
          <span className="px-4 py-2 text-sm font-medium text-wiki-accent border-b-2 border-wiki-accent -mb-px">
            역사
          </span>
        </div>
      </div>

      <div className="mt-6 bg-wiki-surface border border-wiki-border rounded-lg divide-y divide-wiki-border">
        {(revisions ?? []).length === 0 ? (
          <p className="p-6 text-sm text-wiki-text-muted text-center">수정 역사가 없습니다.</p>
        ) : (
          (revisions ?? []).map((rev, index) => {
            const profile = rev.editor_id ? profileMap.get(rev.editor_id) : null
            const isLatest = index === 0
            return (
              <div key={rev.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <span className="text-wiki-text-muted w-36 shrink-0">
                  {new Date(rev.edited_at).toLocaleString('ko-KR')}
                </span>
                <span className="text-wiki-text">
                  {profile ? `${profile.name} (${profile.organization})` : '알 수 없는 사용자'}
                </span>
                {isLatest && (
                  <span className="ml-auto text-xs text-wiki-accent font-medium">최신</span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
