import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Document } from '@/lib/supabase/types'
import { slugToHref, slugToEditHref } from '@/lib/wiki/slug'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q = '' } = await searchParams
  return {
    title: q ? `"${q}" 검색 결과 — 포도위키` : '검색 — 포도위키',
  }
}

function extractSnippet(content: string, query: string, maxLen = 150): string {
  const plain = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const lower = plain.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return plain.slice(0, maxLen) + (plain.length > maxLen ? '…' : '')
  const start = Math.max(0, idx - 60)
  const end = Math.min(plain.length, idx + query.length + 90)
  return (start > 0 ? '…' : '') + plain.slice(start, end) + (end < plain.length ? '…' : '')
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams
  const query = String(q).trim()

  let results: Document[] = []

  if (query) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('documents')
      .select('slug, title, content, author_id, created_at, updated_at')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
      .limit(30) as { data: Document[] | null }

    results = data ?? []
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-wiki-text mb-1">
        {query ? `"${query}" 검색 결과` : '검색'}
      </h1>
      {query && (
        <p className="text-sm text-wiki-text-muted mb-6">
          {results.length > 0 ? `${results.length}개의 문서를 찾았습니다.` : '검색 결과가 없습니다.'}
        </p>
      )}

      {!query && (
        <p className="text-sm text-wiki-text-muted mb-6">
          헤더 검색창에 검색어를 입력하세요.
        </p>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-3">
          {results.map((doc) => (
            <div
              key={doc.slug}
              className="bg-wiki-surface border border-wiki-border rounded-lg px-5 py-4 hover:border-wiki-accent/50 transition-colors"
            >
              <Link
                href={slugToHref(doc.slug)}
                className="text-wiki-accent font-semibold text-base hover:underline"
              >
                {doc.title}
              </Link>
              <p className="mt-1 text-sm text-wiki-text-muted leading-relaxed line-clamp-2">
                {extractSnippet(doc.content, query)}
              </p>
            </div>
          ))}
        </div>
      )}

      {query && results.length === 0 && (
        <div className="bg-wiki-surface border border-wiki-border rounded-lg p-10 text-center">
          <p className="text-wiki-text-muted mb-4">
            <strong className="text-wiki-text">&ldquo;{query}&rdquo;</strong>와 일치하는 문서가 없습니다.
          </p>
          <Link
            href={slugToEditHref(query)}
            className="inline-block px-4 py-2 bg-wiki-accent text-white rounded text-sm hover:bg-wiki-accent-hover transition-colors"
          >
            &ldquo;{query}&rdquo; 문서 만들기
          </Link>
        </div>
      )}
    </div>
  )
}
