'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile } from '@/lib/supabase/types'

export type DeletionRequestWithDetails = {
  id: string
  document_slug: string
  document_title: string
  requester_name: string
  requester_organization: string
  reason: string
  created_at: string
  backlink_count: number
}

export type AdminActionState = { error: string; success?: string }

const ADMIN_COOKIE = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24시간

export async function verifyAdminPasscode(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const code = String(formData.get('code') ?? '').trim()
  const adminCode = process.env.ADMIN_CODE

  if (!adminCode || code !== adminCode) {
    return { error: '잘못된 passcode입니다.' }
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, adminCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: COOKIE_MAX_AGE,
  })

  redirect('/admin')
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  const adminCode = process.env.ADMIN_CODE
  return !!adminCode && token === adminCode
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  redirect('/admin/login')
}

export async function getAllProfiles(): Promise<Profile[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPendingProfiles(): Promise<Profile[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('profiles')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function approveProfile(userId: string): Promise<AdminActionState> {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ status: 'approved' })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/')
  return { error: '', success: '승인 완료' }
}

export async function rejectProfile(userId: string): Promise<AdminActionState> {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ status: 'rejected' })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/')
  return { error: '', success: '거부 완료' }
}

export async function getDeletionRequests(): Promise<DeletionRequestWithDetails[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('deletion_requests')
    .select(`
      id, document_slug, reason, created_at,
      requester:profiles!requester_id(name, organization),
      document:documents!document_slug(title)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const requests = (data ?? []) as Array<{
    id: string
    document_slug: string
    reason: string
    created_at: string
    requester: { name: string; organization: string } | null
    document: { title: string } | null
  }>

  return Promise.all(
    requests.map(async (req) => {
      const { count } = await adminClient
        .from('documents')
        .select('slug', { count: 'exact', head: true })
        .ilike('content', `%/w/${req.document_slug}%`)
        .neq('slug', req.document_slug)
      return {
        id: req.id,
        document_slug: req.document_slug,
        document_title: req.document?.title ?? req.document_slug,
        requester_name: req.requester?.name ?? '알 수 없음',
        requester_organization: req.requester?.organization ?? '',
        reason: req.reason,
        created_at: req.created_at,
        backlink_count: count ?? 0,
      }
    })
  )
}

export async function approveDeletion(documentSlug: string): Promise<AdminActionState> {
  const adminClient = createAdminClient()
  // 문서 삭제 — CASCADE로 revisions, edit_locks, deletion_requests 모두 삭제됨
  const { error } = await adminClient
    .from('documents')
    .delete()
    .eq('slug', documentSlug)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath(`/w/${documentSlug}`)
  revalidateTag(`document:${documentSlug}`, 'max')
  return { error: '', success: '문서가 삭제되었습니다.' }
}

export async function rejectDeletion(requestId: string): Promise<AdminActionState> {
  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('deletion_requests')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', requestId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { error: '', success: '삭제 신청이 거부되었습니다.' }
}
