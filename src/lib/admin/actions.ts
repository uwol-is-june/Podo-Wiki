'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Profile, ProfileRole, Troupe } from '@/lib/supabase/types'

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

export async function setProfileRole(userId: string, role: ProfileRole): Promise<AdminActionState> {
  // 권한 부여는 민감 작업이므로 서버 액션 호출 자체를 admin 세션으로 제한
  if (!(await checkAdminSession())) return { error: '관리자 인증이 필요합니다.' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { error: '', success: role === 'admin' ? '관리자로 지정했습니다.' : '관리자 권한을 해제했습니다.' }
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

// ── 기능 추가 요청 (TASK-059) ─────────────────────────────────────────
export type FeatureRequestRow = {
  id: string
  content: string
  source: 'app' | 'web'
  created_at: string
}

export async function getFeatureRequests(): Promise<FeatureRequestRow[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('feature_requests')
    .select('id, content, source, created_at')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as FeatureRequestRow[]
}

export async function deleteFeatureRequest(requestId: string): Promise<AdminActionState> {
  if (!(await checkAdminSession())) return { error: '관리자 인증이 필요합니다.' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('feature_requests')
    .delete()
    .eq('id', requestId)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { error: '', success: '요청을 삭제했습니다.' }
}

// ── 공연단체 (TASK-075) ───────────────────────────────────────────────
// 등록은 admin 세션으로만. 홈 화면(웹·앱)이 이 목록을 그대로 렌더한다.

const TROUPE_LOGO_BUCKET = 'troupe-logos'
const MAX_LOGO_BYTES = 2 * 1024 * 1024 // 2MB — 버킷 file_size_limit 과 동일
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']

type AdminClient = ReturnType<typeof createAdminClient>

// 업로드된 썸네일을 Storage 에 올리고 공개 URL 을 돌려준다. 파일이 안 왔으면 url: null.
async function uploadTroupeLogo(
  adminClient: AdminClient,
  logo: FormDataEntryValue | null
): Promise<{ url: string | null } | { error: string }> {
  if (!(logo instanceof File) || logo.size === 0) return { url: null }

  if (!ALLOWED_LOGO_TYPES.includes(logo.type)) {
    return { error: 'PNG · JPG · WebP · SVG 이미지만 올릴 수 있습니다.' }
  }
  if (logo.size > MAX_LOGO_BYTES) {
    return { error: '썸네일은 2MB 이하만 올릴 수 있습니다.' }
  }

  // 파일명에 한글·공백이 섞이면 공개 URL 인코딩이 번거로워져 UUID 로 저장
  const ext = logo.type === 'image/svg+xml' ? 'svg' : (logo.name.split('.').pop() ?? 'png').toLowerCase()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await adminClient.storage
    .from(TROUPE_LOGO_BUCKET)
    .upload(path, logo, { contentType: logo.type, upsert: false })
  if (uploadError) return { error: `썸네일 업로드 실패: ${uploadError.message}` }

  return { url: adminClient.storage.from(TROUPE_LOGO_BUCKET).getPublicUrl(path).data.publicUrl }
}

// 업로드했던 로고만 지운다. public/logos/ 에 커밋된 기존 로고(상대 경로)는 건드리지 않는다.
async function removeTroupeLogoObject(adminClient: AdminClient, logoUrl: string | null) {
  if (!logoUrl?.startsWith('http')) return
  const objectPath = logoUrl.split(`/${TROUPE_LOGO_BUCKET}/`)[1]
  if (objectPath) await adminClient.storage.from(TROUPE_LOGO_BUCKET).remove([objectPath])
}

export async function getTroupes(): Promise<Troupe[]> {
  const adminClient = createAdminClient()
  const { data, error } = await adminClient
    .from('troupes')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createTroupe(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!(await checkAdminSession())) return { error: '관리자 인증이 필요합니다.' }

  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { error: '단체 명칭을 입력해 주세요.' }
  if (name.length > 60) return { error: '단체 명칭이 너무 깁니다. (60자 이하)' }
  // slug 가 곧 문서 주소라 경로 구분자가 들어가면 /w/[...slug] 가 깨진다
  if (name.includes('/')) return { error: '단체 명칭에 / 는 쓸 수 없습니다.' }

  // 소속은 표시용(선택). slug 는 명칭에서만 만든다 — 소속이 바뀌어도 문서 주소는 그대로여야 함
  const affiliation = String(formData.get('affiliation') ?? '').trim()
  if (affiliation.length > 60) return { error: '소속이 너무 깁니다. (60자 이하)' }

  const slug = name // 결정: slug 는 단체 명칭 그대로 (기존 광운극예술연구회 방식)
  const adminClient = createAdminClient()

  const { data: existing } = await adminClient
    .from('troupes')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()
  if (existing) return { error: '이미 등록된 단체입니다.' }

  // 썸네일은 선택 — 없으면 홈에서 이니셜 플레이스홀더로 렌더된다
  const uploaded = await uploadTroupeLogo(adminClient, formData.get('logo'))
  if ('error' in uploaded) return { error: uploaded.error }
  const logoUrl = uploaded.url

  const { data: last } = await adminClient
    .from('troupes')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error: insertError } = await adminClient.from('troupes').insert({
    slug,
    name,
    affiliation: affiliation || null,
    logo_url: logoUrl,
    sort_order: (last?.sort_order ?? -1) + 1,
  })
  if (insertError) return { error: insertError.message }

  // 결정: 등록과 동시에 제목만 있는 빈 문서를 만들어 둔다 (카드가 "문서 없음"으로 빠지지 않도록).
  // 이미 같은 이름의 문서가 있으면 손대지 않는다 — 기존 본문을 덮으면 안 됨.
  // revisions 행은 만들지 않는다: 시드 문서들과 동일하게 "아직 편집 이력이 없는 문서" 상태로 시작.
  const { data: existingDoc } = await adminClient
    .from('documents')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!existingDoc) {
    const { error: docError } = await adminClient
      .from('documents')
      .insert({ slug, title: name, content: '' })
    if (docError) return { error: `단체는 등록됐지만 문서 생성에 실패했습니다: ${docError.message}` }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath(`/w/${slug}`)
  revalidateTag(`document:${slug}`, 'max')
  return { error: '', success: `${name} 단체를 등록했습니다.` }
}

export async function updateTroupe(
  prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  if (!(await checkAdminSession())) return { error: '관리자 인증이 필요합니다.' }

  const slug = String(formData.get('slug') ?? '')
  const name = String(formData.get('name') ?? '').trim()
  if (!name) return { error: '단체 명칭을 입력해 주세요.' }
  if (name.length > 60) return { error: '단체 명칭이 너무 깁니다. (60자 이하)' }

  const affiliation = String(formData.get('affiliation') ?? '').trim()
  if (affiliation.length > 60) return { error: '소속이 너무 깁니다. (60자 이하)' }

  const adminClient = createAdminClient()
  const { data: troupe } = await adminClient
    .from('troupes')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (!troupe) return { error: '단체를 찾을 수 없습니다.' }

  // 썸네일은 새로 올렸을 때만 교체. 안 올리면 기존 로고 유지
  const uploaded = await uploadTroupeLogo(adminClient, formData.get('logo'))
  if ('error' in uploaded) return { error: uploaded.error }

  const { error } = await adminClient
    .from('troupes')
    .update({
      name,
      affiliation: affiliation || null,
      ...(uploaded.url ? { logo_url: uploaded.url } : {}),
    })
    .eq('slug', slug)
  if (error) return { error: error.message }

  if (uploaded.url) await removeTroupeLogoObject(adminClient, troupe.logo_url)

  // 명칭이 바뀌면 문서 제목도 같이 맞춘다. **주소(slug)는 그대로** —
  // documents.slug 는 PK 이고 revisions 등이 FK 로 물려 있어 주소 변경은 문서 이전 작업이 따로 필요하다.
  if (name !== troupe.name) {
    const { error: docError } = await adminClient
      .from('documents')
      .update({ title: name })
      .eq('slug', slug)
    if (docError) return { error: `단체는 수정됐지만 문서 제목 갱신에 실패했습니다: ${docError.message}` }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath(`/w/${slug}`)
  revalidateTag(`document:${slug}`, 'max')
  return { error: '', success: `${name} 정보를 수정했습니다.` }
}

export async function deleteTroupe(slug: string): Promise<AdminActionState> {
  if (!(await checkAdminSession())) return { error: '관리자 인증이 필요합니다.' }

  const adminClient = createAdminClient()

  const { data: troupe } = await adminClient
    .from('troupes')
    .select('logo_url')
    .eq('slug', slug)
    .maybeSingle()

  const { error } = await adminClient.from('troupes').delete().eq('slug', slug)
  if (error) return { error: error.message }

  await removeTroupeLogoObject(adminClient, troupe?.logo_url ?? null)

  // 위키 문서는 남긴다 — 내용이 쌓였을 수 있고, 삭제는 기존 삭제 신청 흐름을 따른다.
  revalidatePath('/admin')
  revalidatePath('/')
  return { error: '', success: '단체를 목록에서 제거했습니다.' }
}
