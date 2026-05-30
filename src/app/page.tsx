import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-16">
      <div className="bg-wiki-surface border border-wiki-border rounded-lg p-10 max-w-2xl mx-auto text-center shadow-sm">
        <h1 className="text-3xl font-bold text-wiki-text mb-3">포도위키에 오신 것을 환영합니다</h1>
        <p className="text-wiki-text-muted mb-8 leading-relaxed">
          공연단체들이 인수인계 문서를 공유하는 위키 플랫폼입니다.
          <br />
          문서를 검색하거나 로그인하여 기여해 보세요.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/recent"
            className="px-5 py-2 bg-wiki-accent text-white rounded hover:bg-wiki-accent-hover transition-colors text-sm font-medium"
          >
            최근 변경
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 border border-wiki-border text-wiki-text rounded hover:border-wiki-accent hover:text-wiki-accent transition-colors text-sm font-medium"
          >
            로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
