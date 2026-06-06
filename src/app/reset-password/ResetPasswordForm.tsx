'use client'

import { useActionState, useState } from 'react'
import { updatePassword, type AuthState } from '@/lib/auth/actions'

const initialState: AuthState = { error: '' }

const inputClass =
  'h-10 px-3 rounded border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors text-sm'

export default function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm

  return (
    <form
      action={formAction}
      onSubmit={(e) => { if (passwordMismatch) e.preventDefault() }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-wiki-text">
          새 비밀번호 <span className="text-wiki-text-muted font-normal">(6자 이상)</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={isPending}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} disabled:opacity-50`}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="passwordConfirm" className="text-sm font-medium text-wiki-text">
          비밀번호 확인
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          placeholder="••••••••"
          disabled={isPending}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          className={`${inputClass} disabled:opacity-50 ${passwordMismatch ? 'border-red-400 focus:border-red-400' : ''}`}
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
        className="h-10 bg-wiki-accent text-white rounded text-sm font-medium hover:bg-wiki-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPending && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {isPending ? '변경 중…' : '비밀번호 변경'}
      </button>
    </form>
  )
}
