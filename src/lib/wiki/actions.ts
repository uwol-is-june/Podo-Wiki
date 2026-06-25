'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Database } from '@/lib/supabase/types'
import { slugToEditHref } from '@/lib/wiki/slug'

export async function saveDocument(
  slug: string,
  title: string,
  content: string,
  comment = '',
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?next=${encodeURIComponent(slugToEditHref(slug))}`)

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
    comment,
  }
  const { error: revError } = await supabase.from('revisions').insert(revRow)
  if (revError) return { error: revError.message }

  revalidatePath(`/w/${slug}`)
  revalidateTag(`document:${slug}`, 'max')
  return { ok: true }
}

export async function requestDocumentDeletion(
  slug: string,
  reason: string,
): Promise<{ error: string } | { ok: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요합니다.' }

  const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single()
  if (!profile || profile.status !== 'approved') return { error: '승인된 회원만 삭제 신청이 가능합니다.' }

  const { data: existing } = await supabase
    .from('deletion_requests')
    .select('id')
    .eq('document_slug', slug)
    .eq('status', 'pending')
    .maybeSingle()
  if (existing) return { error: '이미 삭제 신청이 접수된 문서입니다.' }

  const { error } = await supabase.from('deletion_requests').insert({
    document_slug: slug,
    requester_id: user.id,
    reason,
  })
  if (error) return { error: error.message }

  return { ok: true }
}
