'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signup, type AuthState } from '@/lib/auth/actions'

const initialState: AuthState = { error: '' }

const inputClass =
  'h-10 px-3 rounded border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors text-sm'

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState)

  if (state.success) {
    return (
      <div className="text-center">
        <p className="text-wiki-accent font-medium mb-2">✓ 가입 신청 완료</p>
        <p className="text-sm text-wiki-text-muted mb-6">{state.success}</p>
        <Link href="/login" className="text-sm text-wiki-accent hover:underline">
          로그인 페이지로 이동
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-wiki-text">
          이름
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="홍길동"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="organization" className="text-sm font-medium text-wiki-text">
          소속 단체
        </label>
        <input
          id="organization"
          name="organization"
          type="text"
          required
          autoComplete="organization"
          placeholder="예) 포도극단"
          className={inputClass}
        />
      </div>

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
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-wiki-text">
          비밀번호 <span className="text-wiki-text-muted font-normal">(6자 이상)</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          className={inputClass}
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
        {isPending ? '가입 신청 중…' : '회원가입 신청'}
      </button>

      <p className="text-center text-sm text-wiki-text-muted">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-wiki-accent hover:underline">
          로그인
        </Link>
      </p>
    </form>
  )
}
