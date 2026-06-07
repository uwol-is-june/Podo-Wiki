import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q) return NextResponse.json([])

  const supabase = await createClient()
  const pattern = `%${q}%`
  const [{ data: byTitle, error: e1 }, { data: bySlug, error: e2 }] = await Promise.all([
    supabase.from('documents').select('slug, title').ilike('title', pattern).limit(8),
    supabase.from('documents').select('slug, title').ilike('slug', pattern).limit(8),
  ])

  if (e1 || e2) {
    console.error('[/api/wiki/search] Supabase error:', e1 ?? e2)
    return NextResponse.json({ error: 'search failed' }, { status: 500 })
  }

  const seen = new Set<string>()
  const results: { slug: string; title: string }[] = []
  for (const row of [...(byTitle ?? []), ...(bySlug ?? [])]) {
    if (!seen.has(row.slug)) { seen.add(row.slug); results.push(row) }
  }
  return NextResponse.json(results.slice(0, 8))
}
