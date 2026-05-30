'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile } from '@/lib/supabase/types'

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
  return { error: '', success: '거부 완료' }
}
