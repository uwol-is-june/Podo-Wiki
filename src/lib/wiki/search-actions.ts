'use server'

import { createClient } from '@/lib/supabase/server'

export async function searchDocuments(query: string): Promise<{ slug: string; title: string }[]> {
  const supabase = await createClient()
  const [{ data: byTitle, error: e1 }, { data: bySlug, error: e2 }] = await Promise.all([
    supabase.from('documents').select('slug, title').ilike('title', `%${query}%`).limit(8),
    supabase.from('documents').select('slug, title').ilike('slug', `%${query}%`).limit(8),
  ])
  if (e1) console.error('[searchDocuments] title query error:', e1)
  if (e2) console.error('[searchDocuments] slug query error:', e2)
  const seen = new Set<string>()
  const merged: { slug: string; title: string }[] = []
  for (const row of [...(byTitle ?? []), ...(bySlug ?? [])]) {
    if (!seen.has(row.slug)) { seen.add(row.slug); merged.push(row) }
  }
  return merged.slice(0, 8)
}
