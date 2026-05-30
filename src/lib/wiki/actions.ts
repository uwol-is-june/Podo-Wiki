'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/types'

export async function saveDocument(slug: string, title: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=${encodeURIComponent(`/w/${encodeURIComponent(slug)}/edit`)}`)

  const docRow: Database['public']['Tables']['documents']['Insert'] = {
    slug,
    title,
    content,
    author_id: user.id,
  }
  const { error } = await supabase.from('documents').upsert(docRow, { onConflict: 'slug' })

  if (error) throw new Error(error.message)

  const revRow: Database['public']['Tables']['revisions']['Insert'] = {
    document_slug: slug,
    content,
    editor_id: user.id,
  }
  const { error: revError } = await supabase.from('revisions').insert(revRow)

  if (revError) throw new Error(revError.message)

  revalidatePath(`/w/${slug}`)
  redirect(`/w/${encodeURIComponent(slug)}`)
}
