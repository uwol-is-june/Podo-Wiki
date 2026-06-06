import type { Metadata } from 'next'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata: Metadata = { title: '비밀번호 재설정 — 포도위키' }

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-50px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-wiki-surface border border-wiki-border rounded-lg p-8">
        <h1 className="text-2xl font-bold text-wiki-text mb-6 text-center">비밀번호 재설정</h1>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
