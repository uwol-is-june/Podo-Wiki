import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import ThemeProvider from '@/components/layout/ThemeProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import type { ProfileStatus } from '@/lib/supabase/types'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '포도위키',
  description: '공연단체 인수인계 위키 플랫폼',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profileStatus: ProfileStatus | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('status').eq('id', user.id).single()
    profileStatus = (data?.status as ProfileStatus) ?? null
  }

  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-wiki-bg text-wiki-text antialiased">
        <ThemeProvider>
          {/* Header는 레이아웃에 있어 페이지를 옮겨도 언마운트되지 않는다. 내부 useState 초기값이
              최초 마운트에서만 반영되므로, 로그인/로그아웃으로 사용자가 바뀌면 key를 바꿔
              새로 마운트시켜 서버가 조회한 값이 즉시 반영되게 한다. */}
          <Header
            key={user?.id ?? 'anon'}
            initialUser={user ?? null}
            initialProfileStatus={profileStatus}
          />
          <main className="flex-1 pt-[50px]">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
