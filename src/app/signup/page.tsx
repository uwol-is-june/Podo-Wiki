import type { Metadata } from 'next'
import SignupForm from './SignupForm'

export const metadata: Metadata = { title: '회원가입 — 포도위키' }

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-50px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-wiki-surface border border-wiki-border rounded-lg p-8">
        <h1 className="text-2xl font-bold text-wiki-text mb-6 text-center">회원가입</h1>
        <SignupForm />
      </div>
    </div>
  )
}
