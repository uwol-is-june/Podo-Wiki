'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/types'

export async function saveDocument(
  slug: string,
  title: string,
  content: string,
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=${encodeURIComponent(`/w/${encodeURIComponent(slug)}/edit`)}`)

  const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single()
  if (!profile || profile.status !== 'approved') redirect('/pending')

  const docRow: Database['public']['Tables']['documents']['Insert'] = {
    slug,
    title,
    content,
    author_id: user.id,
  }
  const { error } = await supabase.from('documents').upsert(docRow, { onConflict: 'slug' })
  if (error) return { error: error.message }

  const revRow: Database['public']['Tables']['revisions']['Insert'] = {
    document_slug: slug,
    content,
    editor_id: user.id,
  }
  const { error: revError } = await supabase.from('revisions').insert(revRow)
  if (revError) return { error: revError.message }

  revalidatePath(`/w/${slug}`)
  return { ok: true }
}
