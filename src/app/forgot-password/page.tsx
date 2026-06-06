import type { Metadata } from 'next'
import ForgotPasswordForm from './ForgotPasswordForm'

export const metadata: Metadata = { title: '비밀번호 찾기 — 포도위키' }

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-50px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-wiki-surface border border-wiki-border rounded-lg p-8">
        <h1 className="text-2xl font-bold text-wiki-text mb-2 text-center">비밀번호 찾기</h1>
        <p className="text-sm text-wiki-text-muted text-center mb-6">
          가입한 이메일 주소를 입력하면 재설정 링크를 보내드립니다.
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
