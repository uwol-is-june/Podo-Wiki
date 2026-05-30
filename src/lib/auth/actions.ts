'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type AuthState = { error: string; success?: string }

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/') || '/'

  if (!email || !password) return { error: '이메일과 비밀번호를 입력해주세요.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  redirect(next)
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) return { error: '이메일과 비밀번호를 입력해주세요.' }
  if (password.length < 6) return { error: '비밀번호는 최소 6자 이상이어야 합니다.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }

  return { error: '', success: '가입 확인 이메일을 발송했습니다. 이메일을 확인해주세요.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
