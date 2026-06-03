'use client'

import { useTransition } from 'react'
import { logout } from '@/lib/auth/actions'

type Props = {
  className?: string
}

export default function LogoutButton({ className }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className={className}
    >
      {isPending ? '로그아웃 중…' : '로그아웃'}
    </button>
  )
}
