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
          className="h-10 px-3 rounded border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors text-sm"
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
          className="h-10 px-3 rounded border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors text-sm"
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
        className="h-10 bg-wiki-accent text-white rounded text-sm font-medium hover:bg-wiki-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
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
