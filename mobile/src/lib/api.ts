// 웹 서버 컴포넌트들의 Supabase 쿼리를 미러링한 읽기 전용 데이터 레이어.
// 각 함수 주석에 원본 웹 코드 위치를 표기 — keep in sync
import { FAQ_SLUG } from './constants'
import { supabase } from './supabase'
import { parseFaqItems, type FaqItem } from './wiki/faq'
import type { Document } from './supabase/types'

export const PAGE_SIZE = 20

// 웹 /recent 등과 동일한 공개 화면용 편집자 표기 (profiles는 비공개 RLS라 이름 조회 불가)
export function editorLabel(editorId: string | null): string {
  return editorId ? editorId.slice(0, 8) + '…' : '익명'
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── 문서 ──────────────────────────────────────────────────────────────

// src/app/w/[...slug]/page.tsx fetchDocument
export async function getDocument(slug: string): Promise<Document | null> {
  const { data } = await supabase
    .from('documents')
    .select('slug, title, content, author_id, protected, created_at, updated_at')
    .eq('slug', slug)
    .maybeSingle()
  return data
}

// src/app/w/[...slug]/page.tsx fetchExistingSlugs (브레드크럼용)
export async function getExistingSlugs(slugs: string[]): Promise<Set<string>> {
  if (slugs.length === 0) return new Set()
  const { data } = await supabase.from('documents').select('slug').in('slug', slugs)
  return new Set((data ?? []).map(r => r.slug))
}

// src/app/random/page.tsx
export async function getRandomSlug(): Promise<string | null> {
  const { count } = await supabase.from('documents').select('slug', { count: 'exact', head: true })
  if (!count || count === 0) return null
  const randomOffset = Math.floor(Math.random() * count)
  const { data } = await supabase.from('documents').select('slug').range(randomOffset, randomOffset)
  return data?.[0]?.slug ?? null
}

// ── 검색 ──────────────────────────────────────────────────────────────

export type SearchSuggestion = { slug: string; title: string }

// src/app/api/wiki/search/route.ts (title/slug ilike 2회 병합)
export async function suggestDocuments(q: string): Promise<SearchSuggestion[]> {
  const query = q.trim()
  if (!query) return []
  const pattern = `%${query}%`
  const [{ data: byTitle }, { data: bySlug }] = await Promise.all([
    supabase.from('documents').select('slug, title').ilike('title', pattern).limit(8),
    supabase.from('documents').select('slug, title').ilike('slug', pattern).limit(8),
  ])
  const seen = new Set<string>()
  const results: SearchSuggestion[] = []
  for (const row of [...(byTitle ?? []), ...(bySlug ?? [])]) {
    if (!seen.has(row.slug)) {
      seen.add(row.slug)
      results.push(row)
    }
  }
  return results.slice(0, 8)
}

// src/app/search/page.tsx extractSnippet
export function extractSnippet(content: string, query: string, maxLen = 150): string {
  const plain = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const lower = plain.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return plain.slice(0, maxLen) + (plain.length > maxLen ? '…' : '')
  const start = Math.max(0, idx - 60)
  const end = Math.min(plain.length, idx + query.length + 90)
  return (start > 0 ? '…' : '') + plain.slice(start, end) + (end < plain.length ? '…' : '')
}

export type SearchResult = { slug: string; title: string; snippet: string; updated_at: string }

// src/app/search/page.tsx — 웹은 .or() 한 방이지만 쿼리에 ,·() 포함 시 PostgREST 문법이
// 깨지는 엣지가 있어 검색 API 라우트처럼 ilike 2회 병합으로 동일 결과를 얻는다
export async function searchDocuments(q: string): Promise<SearchResult[]> {
  const query = q.trim()
  if (!query) return []
  const pattern = `%${query}%`
  const select = 'slug, title, content, updated_at'
  const [{ data: byTitle }, { data: byContent }] = await Promise.all([
    supabase.from('documents').select(select).ilike('title', pattern).limit(30),
    supabase.from('documents').select(select).ilike('content', pattern).limit(30),
  ])
  const seen = new Set<string>()
  const merged: { slug: string; title: string; content: string; updated_at: string }[] = []
  for (const row of [...(byTitle ?? []), ...(byContent ?? [])]) {
    if (!seen.has(row.slug)) {
      seen.add(row.slug)
      merged.push(row)
    }
  }
  merged.sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  return merged.slice(0, 30).map(({ slug, title, content, updated_at }) => ({
    slug,
    title,
    updated_at,
    snippet: extractSnippet(content, query),
  }))
}

// ── 최근 변경 ─────────────────────────────────────────────────────────

export type RecentRevision = {
  id: string
  document_slug: string
  editor_id: string | null
  edited_at: string
  documents: { title: string } | null
}

// src/app/recent/page.tsx (page는 1부터)
export async function getRecentRevisions(
  page: number
): Promise<{ rows: RecentRevision[]; count: number }> {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { data, count } = await supabase
    .from('revisions')
    .select('id, document_slug, editor_id, edited_at, documents(title)', { count: 'exact' })
    .order('edited_at', { ascending: false })
    .range(from, to)
  return { rows: (data as RecentRevision[] | null) ?? [], count: count ?? 0 }
}

// ── 역사 / 리비전 / diff ──────────────────────────────────────────────

export type HistoryEntry = {
  id: string
  edited_at: string
  editor_id: string | null
  comment: string
  contentBytes: number
  bytesDiff: number
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length
}

// src/app/history/[...slug]/page.tsx (편집자 이름 조회는 service role 필요라 제외)
export async function getHistory(
  slug: string
): Promise<{ title: string; revisions: HistoryEntry[] }> {
  const [{ data: document }, { data: rawRevisions }] = await Promise.all([
    supabase.from('documents').select('title').eq('slug', slug).maybeSingle(),
    supabase
      .from('revisions')
      .select('id, edited_at, editor_id, comment, content')
      .eq('document_slug', slug)
      .order('edited_at', { ascending: false }),
  ])
  const contentBytes = (rawRevisions ?? []).map(r => byteLength(r.content))
  const revisions = (rawRevisions ?? []).map((r, i) => ({
    id: r.id,
    edited_at: r.edited_at,
    editor_id: r.editor_id,
    comment: r.comment,
    contentBytes: contentBytes[i],
    bytesDiff: contentBytes[i] - (contentBytes[i + 1] ?? 0),
  }))
  return { title: document?.title ?? slug, revisions }
}

export type RevisionDetail = {
  id: string
  document_slug: string
  content: string
  editor_id: string | null
  edited_at: string
  comment: string
  documents: { title: string } | null
}

export async function getRevision(id: string): Promise<RevisionDetail | null> {
  const { data } = await supabase
    .from('revisions')
    .select('id, document_slug, content, editor_id, edited_at, comment, documents(title)')
    .eq('id', id)
    .maybeSingle()
  return data as RevisionDetail | null
}

// src/app/diff/page.tsx — edited_at 기준으로 [older, newer] 정렬해 반환
export async function getRevisionPair(
  fromId: string,
  toId: string
): Promise<[RevisionDetail, RevisionDetail] | null> {
  const { data } = await supabase
    .from('revisions')
    .select('id, document_slug, content, editor_id, edited_at, comment, documents(title)')
    .in('id', [fromId, toId])
  const rows = (data as RevisionDetail[] | null) ?? []
  if (rows.length !== 2) return null
  rows.sort((a, b) => a.edited_at.localeCompare(b.edited_at))
  return [rows[0], rows[1]]
}

// ── FAQ / 홈 ──────────────────────────────────────────────────────────

// src/app/faq/page.tsx
export async function getFaqItems(): Promise<FaqItem[]> {
  const { data } = await supabase
    .from('documents')
    .select('content')
    .eq('slug', FAQ_SLUG)
    .maybeSingle()
  return data?.content ? parseFaqItems(data.content) : []
}

export type HomeData = {
  docCount: number
  recent: RecentRevision[]
  faqPreview: FaqItem[]
}

// src/app/page.tsx (승인 회원 수는 service role 필요라 문서 수만 표시)
export async function getHomeData(): Promise<HomeData> {
  const [{ count }, { data: recent }, faqItems] = await Promise.all([
    supabase.from('documents').select('slug', { count: 'exact', head: true }),
    supabase
      .from('revisions')
      .select('id, document_slug, editor_id, edited_at, documents(title)')
      .order('edited_at', { ascending: false })
      .limit(5),
    getFaqItems(),
  ])
  return {
    docCount: count ?? 0,
    recent: (recent as RecentRevision[] | null) ?? [],
    faqPreview: faqItems.slice(0, 4),
  }
}
