'use client'

import { useBookmarkToggle } from '@/hooks/useBookmarks'

type Props = {
  slug: string
  title: string
}

export default function BookmarkButton({ slug, title }: Props) {
  const { isBookmarked, ready, error, toggle } = useBookmarkToggle(slug, title)

  // 마운트 전에는 저장 여부를 알 수 없다 (localStorage는 클라이언트에만 있음).
  // 서버 HTML과 같은 '안 저장됨' 모양으로 그려서 하이드레이션 불일치를 피한다.
  const active = ready && isBookmarked

  return (
    <div className="relative">
      {/* 저장이 막힌 환경에서 눌러도 아무 일이 없는 것처럼 보이지 않게 알린다 (TASK-069) */}
      {error && (
        <p
          role="alert"
          className="absolute right-0 top-full mt-1 z-50 w-56 text-xs leading-snug bg-wiki-surface border border-wiki-border rounded-lg shadow-lg p-2.5 text-wiki-text"
        >
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={active}
        aria-label={active ? '북마크에서 빼기' : '북마크에 저장'}
        title={active ? '북마크에서 빼기' : '북마크에 저장'}
        className={`flex items-center justify-center p-2 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-wiki-accent hover:bg-wiki-bg ${
          active
            ? 'text-wiki-accent-text'
            : 'text-wiki-text-muted hover:text-wiki-text'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={active ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  )
}
