'use client'

import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/lib/auth/actions'

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

export default function Header() {
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[50px] bg-wiki-header-bg border-b border-wiki-border/30">
      <div className="max-w-[1200px] mx-auto h-full flex items-center justify-between px-4 gap-4">
        {/* 로고 */}
        <Link
          href="/"
          className="text-wiki-header-text font-bold text-lg shrink-0 hover:opacity-80 transition-opacity"
        >
          포도위키
        </Link>

        {/* 검색창 */}
        <form action="/search" method="GET" className="flex-1 max-w-[500px]">
          <div className="relative">
            <input
              type="text"
              name="q"
              placeholder="문서 검색..."
              className="w-full h-8 pl-3 pr-9 rounded text-sm border border-wiki-header-text/20 bg-wiki-header-text/10 text-wiki-header-text placeholder:text-wiki-header-text/50 focus:outline-none focus:border-wiki-header-text/40 focus:bg-wiki-header-text/15 transition-colors"
            />
            <button
              type="submit"
              aria-label="검색"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-wiki-header-text/60 hover:text-wiki-header-text transition-colors"
            >
              <SearchIcon />
            </button>
          </div>
        </form>

        {/* 우측 네비게이션 */}
        <nav className="flex items-center gap-1 shrink-0">
          <Link
            href="/recent"
            className="px-2 py-1 text-sm text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors"
          >
            최근변경
          </Link>
          <Link
            href="/random"
            className="px-2 py-1 text-sm text-wiki-header-text/80 hover:text-wiki-header-text hover:bg-wiki-header-text/10 rounded transition-colors"
          >
            임의문서
          </Link>
          {user ? (
            <div className="ml-1 flex items-center gap-1">
              <span className="px-2 py-1 text-xs text-wiki-header-text/70 max-w-[120px] truncate hidden sm:block">
                {user.email}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="px-3 py-1 text-sm rounded border border-wiki-header-text/30 text-wiki-header-text hover:bg-wiki-header-text/10 transition-colors"
                >
                  로그아웃
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-1 px-3 py-1 text-sm rounded border border-wiki-header-text/30 text-wiki-header-text hover:bg-wiki-header-text/10 transition-colors"
            >
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
      </div>
    </header>
  )
}
