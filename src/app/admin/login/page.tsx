import type { Metadata } from 'next'
import AdminLoginForm from './AdminLoginForm'

export const metadata: Metadata = { title: '관리자 로그인 — 포도위키' }

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-wiki-bg px-4">
      <div className="w-full max-w-sm bg-wiki-surface border border-wiki-border rounded-lg p-8 shadow-sm">
        <h1 className="text-xl font-bold text-wiki-text mb-6 text-center">관리자 접속</h1>
        <AdminLoginForm />
      </div>
    </main>
  )
}
