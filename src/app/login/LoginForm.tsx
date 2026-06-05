'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/lib/auth/actions'

const initialState = { error: '' }

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-wiki-text">
          이메일
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isPending}
          className="h-10 px-3 rounded border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors text-sm disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-wiki-text">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          disabled={isPending}
          className="h-10 px-3 rounded border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors text-sm disabled:opacity-50"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-10 bg-wiki-accent text-white rounded text-sm font-medium hover:bg-wiki-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {isPending ? '로그인 중…' : '로그인'}
      </button>

      <p className="text-center text-sm text-wiki-text-muted">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="text-wiki-accent hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  )
}
