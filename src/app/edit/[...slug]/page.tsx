import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { marked } from 'marked'
import type { Metadata } from 'next'
import type { Document } from '@/lib/supabase/types'
import { slugToHref, slugToEditHref } from '@/lib/wiki/slug'
import WikiEditor from '@/components/wiki/WikiEditor'
import Link from 'next/link'

const LOCK_MINUTES = 30

type Props = {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = slug.map(decodeURIComponent).join('/')
  return { title: `${decodedSlug} 편집 — 포도위키` }
}

export default async function EditPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = slug.map(decodeURIComponent).join('/')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(slugToEditHref(decodedSlug))}`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single()
  if (!profile || profile.status !== 'approved') redirect('/pending')

  // 편집 락 체크
  const now = new Date().toISOString()
  const { data: existingLock } = await supabase
    .from('edit_locks')
    .select('user_id, expires_at')
    .eq('document_slug', decodedSlug)
    .single()

  if (existingLock && existingLock.expires_at > now && existingLock.user_id !== user.id) {
    const { data: editorProfile } = await supabase
      .from('profiles')
      .select('name, organization')
      .eq('id', existingLock.user_id)
      .single()
    const editorName = editorProfile
      ? `${editorProfile.name} (${editorProfile.organization})`
      : '다른 사용자'

    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-wiki-border/30 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-wiki-text-muted">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-wiki-text">현재 편집 중인 문서입니다</h1>
        <p className="text-sm text-wiki-text-muted max-w-xs">
          <span className="font-medium text-wiki-text">{editorName}</span>님이 편집 중입니다.
          <br />
          저장 또는 취소하거나 {LOCK_MINUTES}분이 지나면 잠금이 해제됩니다.
        </p>
        <Link
          href={slugToHref(decodedSlug)}
          className="mt-2 px-4 py-2 border border-wiki-border rounded text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent transition-colors"
        >
          문서로 돌아가기
        </Link>
      </div>
    )
  }

  // 락 획득 (자신의 락이거나 없는 경우 upsert)
  const expiresAt = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
  await supabase.from('edit_locks').upsert({
    document_slug: decodedSlug,
    user_id: user.id,
    acquired_at: now,
    expires_at: expiresAt,
  })

  const { data: document } = await supabase
    .from('documents')
    .select('slug, title, content, author_id, created_at, updated_at')
    .eq('slug', decodedSlug)
    .single() as { data: Document | null }

  // [^N] 패턴이 marked의 reference-style 링크로 잘못 파싱되는 것을 방지
  const safeContent = (document?.content ?? '').replace(/\[\^/g, '&#91;^')
  const initialHtml = safeContent
    ? (marked.parse(safeContent) as string)
        .replace(/<img([^>]*?)\stitle="w=(\d+)"([^>]*)>/g, '<img$1 width="$2"$3>')
    : ''

  return (
    <WikiEditor
      slug={decodedSlug}
      initialTitle={document?.title ?? decodedSlug}
      initialHtml={initialHtml}
    />
  )
}
