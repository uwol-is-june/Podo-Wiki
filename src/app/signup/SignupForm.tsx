'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signup, type AuthState } from '@/lib/auth/actions'

const initialState: AuthState = { error: '' }

const inputClass =
  'h-10 px-3 rounded border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors text-sm'

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword

  if (state.success) {
    return (
      <div className="text-center">
        <p className="text-wiki-accent-text font-medium mb-2">✓ 가입 신청 완료</p>
        <p className="text-sm text-wiki-text-muted mb-6">{state.success}</p>
        <Link href="/login" className="text-sm text-wiki-accent-text hover:underline">
          로그인 페이지로 이동
        </Link>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      onSubmit={(e) => { if (passwordMismatch) e.preventDefault() }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-wiki-text">
          이름
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={isPending}
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
          disabled={isPending}
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
          disabled={isPending}
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
          disabled={isPending}
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirm-password" className="text-sm font-medium text-wiki-text">
          비밀번호 확인
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          disabled={isPending}
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={`${inputClass} ${passwordMismatch ? 'border-red-400 focus:border-red-400' : ''}`}
        />
        {passwordMismatch && (
          <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
        )}
      </div>

      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="h-10 bg-wiki-accent text-wiki-on-accent rounded text-sm font-medium hover:bg-wiki-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {isPending ? '가입 신청 중…' : '회원가입 신청'}
      </button>

      {/* 인증 메일 발송이 서버 액션 안에서 동기로 일어나 몇 초 걸림 — 멈춘 것처럼 보이지 않게 안내 */}
      {isPending && (
        <p className="text-center text-xs text-wiki-text-muted -mt-2">
          인증 메일을 보내는 중이라 몇 초 걸릴 수 있어요.
        </p>
      )}

      <p className="text-center text-sm text-wiki-text-muted">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-wiki-accent-text hover:underline">
          로그인
        </Link>
      </p>
    </form>
  )
}
