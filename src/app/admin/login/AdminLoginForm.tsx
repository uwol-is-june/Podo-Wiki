'use client'

import { useActionState } from 'react'
import { verifyAdminPasscode, type AdminActionState } from '@/lib/admin/actions'

const initialState: AdminActionState = { error: '' }

export default function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(verifyAdminPasscode, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="code" className="text-sm font-medium text-wiki-text">
          Admin Passcode
        </label>
        <input
          id="code"
          name="code"
          type="password"
          required
          autoComplete="off"
          placeholder="passcode 입력"
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
        {isPending ? '확인 중…' : '접속'}
      </button>
    </form>
  )
}
