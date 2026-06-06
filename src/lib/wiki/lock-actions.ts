'use server'

import { createClient } from '@/lib/supabase/server'

const LOCK_MINUTES = 30

export async function releaseLock(slug: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('edit_locks')
    .delete()
    .eq('document_slug', slug)
    .eq('user_id', user.id)
}

export async function refreshLock(slug: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const expiresAt = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString()
  await supabase
    .from('edit_locks')
    .update({ expires_at: expiresAt })
    .eq('document_slug', slug)
    .eq('user_id', user.id)
}
