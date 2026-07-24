import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  // 옛 도메인(podo-wiki.vercel.app) → 새 커스텀 도메인으로 canonical 308 리다이렉트.
  // matcher가 이미지 등 정적자산을 제외하므로 구버전 앱의 이미지 요청은 옛 도메인에서 그대로 서빙됨.
  if (request.headers.get('host') === 'podo-wiki.vercel.app') {
    const { pathname, search } = request.nextUrl
    return NextResponse.redirect(`https://wiki.podo-store.com${pathname}${search}`, 308)
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 세션 토큰 갱신 트리거
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
