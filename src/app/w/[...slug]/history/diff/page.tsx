import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Document } from '@/lib/supabase/types'
import { diffLines } from 'diff'
import { slugToHref } from '@/lib/wiki/slug'

type Props = {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{ from?: string; to?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `${slug.join('/')} 버전 비교 — 포도위키` }
}

export default async function DiffPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { from, to } = await searchParams
  const decodedSlug = slug.join('/')
  const supabase = await createClient()

  if (!from || !to) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-10 text-center text-wiki-text-muted">
        비교할 버전이 지정되지 않았습니다.
      </div>
    )
  }

  const { data: document } = await supabase
    .from('documents')
    .select('title')
    .eq('slug', decodedSlug)
    .single() as { data: Pick<Document, 'title'> | null }

  const { data: revA } = await supabase
    .from('revisions')
    .select('id, content, edited_at, editor_id')
    .eq('id', from)
    .eq('document_slug', decodedSlug)
    .single()

  const { data: revB } = await supabase
    .from('revisions')
    .select('id, content, edited_at, editor_id')
    .eq('id', to)
    .eq('document_slug', decodedSlug)
    .single()

  if (!revA || !revB) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-10 text-center text-wiki-text-muted">
        버전을 찾을 수 없습니다.
      </div>
    )
  }

  // 시간순 정렬: older → newer
  const [older, newer] = new Date(revA.edited_at) <= new Date(revB.edited_at)
    ? [revA, revB]
    : [revB, revA]

  const editorIds = [...new Set([older.editor_id, newer.editor_id].filter((id): id is string => id !== null))]
  const { data: profiles } = editorIds.length > 0
    ? await supabase.from('profiles').select('id, name, organization').in('id', editorIds)
    : { data: [] }
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const olderEditor = older.editor_id ? profileMap.get(older.editor_id) : null
  const newerEditor = newer.editor_id ? profileMap.get(newer.editor_id) : null

  const fmt = (dateStr: string) =>
    new Date(dateStr).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })

  const changes = diffLines(older.content, newer.content)
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
            href={`${slugToHref(decodedSlug)}/edit`}
            className="px-4 py-2 text-sm text-wiki-text-muted hover:text-wiki-text transition-colors"
          >
            수정
          </Link>
          <Link
            href={`${slugToHref(decodedSlug)}/history`}
            className="px-4 py-2 text-sm font-medium text-wiki-accent border-b-2 border-wiki-accent -mb-px"
          >
            역사
          </Link>
        </div>
      </div>

      {/* 비교 대상 요약 */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
          <p className="text-red-700 font-medium text-xs mb-0.5">이전 버전</p>
          <p className="text-red-800">{fmt(older.edited_at)}</p>
          <p className="text-red-700 text-xs">
            {olderEditor ? `${olderEditor.name} (${olderEditor.organization})` : '알 수 없는 사용자'}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
          <p className="text-green-700 font-medium text-xs mb-0.5">새 버전</p>
          <p className="text-green-800">{fmt(newer.edited_at)}</p>
          <p className="text-green-700 text-xs">
            {newerEditor ? `${newerEditor.name} (${newerEditor.organization})` : '알 수 없는 사용자'}
          </p>
        </div>
      </div>

      {/* diff 본문 */}
      <div className="mt-4 bg-wiki-surface border border-wiki-border rounded-lg overflow-hidden">
        <pre className="text-sm font-mono overflow-x-auto p-0">
          {changes.length === 0 || changes.every((c) => !c.added && !c.removed) ? (
            <p className="p-6 text-wiki-text-muted text-center font-sans">두 버전이 동일합니다.</p>
          ) : (
            changes.map((change, i) => {
              const lines = change.value.replace(/\n$/, '').split('\n')
              if (change.added) {
                return lines.map((line, j) => (
                  <div key={`${i}-${j}`} className="flex bg-green-50 hover:bg-green-100">
                    <span className="select-none w-6 text-center text-green-500 shrink-0 border-r border-green-200 px-1">+</span>
                    <span className="px-3 py-0.5 text-green-900 whitespace-pre">{line}</span>
                  </div>
                ))
              }
              if (change.removed) {
                return lines.map((line, j) => (
                  <div key={`${i}-${j}`} className="flex bg-red-50 hover:bg-red-100">
                    <span className="select-none w-6 text-center text-red-500 shrink-0 border-r border-red-200 px-1">−</span>
                    <span className="px-3 py-0.5 text-red-900 whitespace-pre line-through decoration-red-400">{line}</span>
                  </div>
                ))
              }
              return lines.map((line, j) => (
                <div key={`${i}-${j}`} className="flex hover:bg-wiki-border/10">
                  <span className="select-none w-6 text-center text-wiki-text-muted shrink-0 border-r border-wiki-border/50 px-1"> </span>
                  <span className="px-3 py-0.5 text-wiki-text whitespace-pre">{line}</span>
                </div>
              ))
            })
          )}
        </pre>
      </div>
    </div>
  )
}
