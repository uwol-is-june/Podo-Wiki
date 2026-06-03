import type { Metadata } from 'next'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'

export const metadata: Metadata = { title: '승인 대기 중 — 포도위키' }

export default function PendingPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-full bg-wiki-border flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-wiki-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-wiki-text mb-2">승인 대기 중</h1>
        <p className="text-sm text-wiki-text-muted mb-6">
          가입 신청이 접수되었습니다.<br />
          관리자 승인 후 문서를 수정하실 수 있습니다.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <Link
            href="/"
            className="text-sm text-wiki-accent hover:underline"
          >
            홈으로 이동
          </Link>
          <LogoutButton className="text-sm text-wiki-text-muted hover:text-wiki-text transition-colors disabled:opacity-50" />
        </div>
      </div>
    </main>
  )
}
