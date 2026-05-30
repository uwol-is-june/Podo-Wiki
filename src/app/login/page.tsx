import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: '로그인 — 포도위키' }

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next = '/' } = await searchParams
  const nextUrl = String(next)

  return (
    <div className="min-h-[calc(100vh-50px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-wiki-surface border border-wiki-border rounded-lg p-8">
        <h1 className="text-2xl font-bold text-wiki-text mb-6 text-center">로그인</h1>
        <LoginForm next={nextUrl} />
      </div>
    </div>
  )
}
