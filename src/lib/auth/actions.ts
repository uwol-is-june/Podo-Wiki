'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
  const name = String(formData.get('name') ?? '').trim()
  const organization = String(formData.get('organization') ?? '').trim()

  if (!email || !password) return { error: '이메일과 비밀번호를 입력해주세요.' }
  if (!name) return { error: '이름을 입력해주세요.' }
  if (!organization) return { error: '소속 단체를 입력해주세요.' }
  if (password.length < 6) return { error: '비밀번호는 최소 6자 이상이어야 합니다.' }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) return { error: error.message }

  if (data.user) {
    const adminClient = createAdminClient()
    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({ id: data.user.id, name, organization, status: 'pending' })

    if (profileError) {
      console.error('Profile insert failed:', profileError)
      return { error: '프로필 저장 중 오류가 발생했습니다.' }
    }
  }

  return {
    error: '',
    success: '가입 확인 이메일을 발송했습니다. 이메일 인증 후 관리자 승인을 기다려주세요.',
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
