import { createClient } from '@/lib/supabase/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// 인증 메일의 링크가 향하는 곳.
// Supabase가 만들어주는 {{ .ConfirmationURL }}은 <프로젝트ref>.supabase.co를 가리켜서
// 메일 본문에 무작위 문자열 도메인이 노출됐고, 지메일이 이를 피싱 패턴으로 분류했음.
// 템플릿에서 {{ .TokenHash }}로 직접 링크를 만들어 이 라우트로 보내면
// 메일에 우리 도메인만 남는다. code 방식(/auth/callback)과 달리 code_verifier 쿠키가
// 필요 없어서, 메일을 다른 기기·브라우저에서 열어도 인증이 된다.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // 오픈 리다이렉트 방지 — 같은 출처의 경로만 허용
  const nextParam = searchParams.get('next') ?? '/'
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/'

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
