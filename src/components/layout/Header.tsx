'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from './ThemeProvider'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { ProfileStatus } from '@/lib/supabase/types'
import LogoutButton from '@/components/auth/LogoutButton'

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function ShuffleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
      <path d="m18 2 4 4-4 4" />
      <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
      <path d="m18 22 4-4-4-4" />
      <path d="M21.8 16.1c-.7 1.1-2 1.9-3.8 1.9h-2.5l-1.3-1.9" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

type HeaderProps = {
  initialUser: User | null
  initialProfileStatus: ProfileStatus | null
}

export default function Header({ initialUser, initialProfileStatus }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(initialUser)
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(initialProfileStatus)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (!u) { setProfileStatus(null); return }
      const { data } = await supabase.from('profiles').select('status').eq('id', u.id).single()
      setProfileStatus((data?.status as ProfileStatus) ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (!user) { setProfileStatus(null); return }
      const { data } = await supabase.from('profiles').select('status').eq('id', user.id).single()
      setProfileStatus((data?.status as ProfileStatus) ?? null)
    })
  }, [pathname, supabase])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-[50px] bg-wiki-header-bg border-b border-wiki-border/30">
        <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-4 gap-4">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity">
            <Image src="/wiki_logo.png" alt="포도위키" width={32} height={32} />
            <span className="text-wiki-header-text font-bold text-lg">포도위키</span>
          </Link>

          {/* 데스크탑 검색창 */}
          <form action="/search" method="GET" className="hidden sm:block flex-1 max-w-[500px]">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="문서 검색..."
                className="w-full h-8 pl-3 pr-9 rounded text-sm border border-wiki-header-text/20 bg-wiki-header-text/10 text-wiki-header-text placeholder:text-wiki-header-text/50 focus:outline-none focus:border-wiki-header-text/40 focus:bg-wiki-header-text/15 transition-colors"
              />
              <button type="submit" aria-label="검색" className="absolute right-2 top-1/2 -translate-y-1/2 text-wiki-header-text/60 hover:text-wiki-header-text transition-colors">
                <SearchIcon />
              </button>
            </div>
          </form>

          {/* 데스크탑 우측 네비게이션 */}
          <nav className="hidden sm:flex items-center gap-1 shrink-0">
            <Link href="/recent" className="px-2 py-1 text-sm text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors">
              최근변경
            </Link>
            <Link href="/random" className="flex items-center gap-1 px-2 py-1 text-sm text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors">
              <ShuffleIcon />
              임의문서
            </Link>
            {user ? (
              <div className="ml-1 flex items-center gap-1">
                <Link href="/mypage" className="px-2 py-1 text-xs text-wiki-header-text/70 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors">
                  내 정보
                </Link>
                {profileStatus === 'pending' && (
                  <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                    승인 대기
                  </span>
                )}
                <LogoutButton className="px-3 py-1 text-sm rounded border border-wiki-header-text/30 text-wiki-header-text hover:bg-wiki-header-text/10 transition-colors disabled:opacity-50" />
              </div>
            ) : (
              <Link href="/login" className="ml-1 px-3 py-1 text-sm rounded border border-wiki-header-text/30 text-wiki-header-text hover:bg-wiki-header-text/10 transition-colors">
                로그인
              </Link>
            )}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="테마 전환"
              className="ml-1 w-8 h-8 flex items-center justify-center rounded text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 transition-colors"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>

          {/* 모바일 버튼 */}
          <div className="flex sm:hidden items-center gap-0.5">
            <button
              onClick={() => { setSearchOpen((v) => !v); setMenuOpen(false) }}
              aria-label="검색"
              className="w-11 h-11 flex items-center justify-center rounded text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 transition-colors"
            >
              <SearchIcon />
            </button>
            <button
              onClick={() => { setMenuOpen((v) => !v); setSearchOpen(false) }}
              aria-label="메뉴"
              className="w-11 h-11 flex items-center justify-center rounded text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 transition-colors"
            >
              {menuOpen ? <XIcon /> : <HamburgerIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 검색 오버레이 */}
      {searchOpen && (
        <div className="fixed top-[50px] left-0 right-0 z-40 sm:hidden bg-wiki-header-bg border-b border-wiki-border/30 px-4 py-2.5 shadow-md">
          <form action="/search" method="GET">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="문서 검색..."
                autoFocus
                className="w-full h-9 pl-3 pr-10 rounded text-sm border border-wiki-header-text/20 bg-wiki-header-text/10 text-wiki-header-text placeholder:text-wiki-header-text/50 focus:outline-none focus:border-wiki-header-text/40 transition-colors"
              />
              <button type="submit" aria-label="검색" className="absolute right-2 top-1/2 -translate-y-1/2 text-wiki-header-text/60 hover:text-wiki-header-text transition-colors">
                <SearchIcon />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 모바일 메뉴 드롭다운 */}
      {menuOpen && (
        <>
          {/* 백드롭 */}
          <div
            className="fixed inset-0 top-[50px] z-30 sm:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="fixed top-[50px] left-0 right-0 z-40 sm:hidden bg-wiki-header-bg border-b border-wiki-border/30 shadow-md">
            <div className="max-w-[1200px] mx-auto px-2 py-1.5 flex flex-col">
              <Link href="/recent" className="px-3 py-2.5 text-sm text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors">
                최근변경
              </Link>
              <Link href="/random" className="flex items-center gap-2 px-3 py-2.5 text-sm text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors">
                <ShuffleIcon />
                임의문서
              </Link>
              <div className="h-px bg-wiki-border/30 my-1" />
              {user ? (
                <>
                  <Link href="/mypage" className="px-3 py-2.5 text-sm text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors">
                    내 정보
                  </Link>
                  {profileStatus === 'pending' && (
                    <div className="px-3 py-1.5">
                      <span className="px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-300 rounded">
                        승인 대기 중
                      </span>
                    </div>
                  )}
                  <LogoutButton className="text-left px-3 py-2.5 text-sm text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors disabled:opacity-50" />
                </>
              ) : (
                <Link href="/login" className="px-3 py-2.5 text-sm text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors">
                  로그인
                </Link>
              )}
              <div className="h-px bg-wiki-border/30 my-1" />
              <button
                onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setMenuOpen(false) }}
                className="text-left px-3 py-2.5 text-sm text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors"
              >
                {theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
              </button>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
