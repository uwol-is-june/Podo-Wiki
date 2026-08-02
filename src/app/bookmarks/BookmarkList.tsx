'use client'

import Link from 'next/link'

import { useBookmarks } from '@/hooks/useBookmarks'
import { slugToHref } from '@/lib/wiki/slug'

export default function BookmarkList() {
  const { bookmarks, ready, remove } = useBookmarks()

  // 마운트 전에는 localStorage를 읽을 수 없어 목록을 알 수 없다.
  // 빈 상태 문구를 먼저 띄우면 잘못된 안내가 깜빡이므로 아무것도 그리지 않는다.
  if (!ready) {
    return <div className="py-16" aria-hidden />
  }

  if (bookmarks.length === 0) {
    return (
      <div className="py-16 px-6 text-center">
        <p className="text-wiki-text font-medium mb-2">저장한 문서가 없습니다</p>
        <p className="text-sm text-wiki-text-muted">
          문서 페이지 제목 옆의 북마크 버튼을 누르면 여기에 모입니다.
        </p>
      </div>
    )
  }

  return (
    <ul>
      {bookmarks.map((b, i) => (
        <li
          key={b.slug}
          className={`flex items-center gap-3 px-4 py-3 hover:bg-wiki-border/10 transition-colors ${
            i === bookmarks.length - 1 ? '' : 'border-b border-wiki-border/50'
          }`}
        >
          <div className="min-w-0 flex-1">
            <Link
              href={slugToHref(b.slug)}
              className="text-wiki-accent-text hover:underline font-medium block truncate"
            >
              {b.title}
            </Link>
            <p className="text-xs text-wiki-text-muted mt-0.5">
              {new Date(b.savedAt).toLocaleString('ko-KR', {
                timeZone: 'Asia/Seoul',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              저장
            </p>
          </div>
          <button
            type="button"
            onClick={() => remove(b.slug)}
            aria-label={`${b.title} 북마크에서 빼기`}
            title="북마크에서 빼기"
            className="shrink-0 p-2 rounded-md text-wiki-text-muted hover:text-wiki-text hover:bg-wiki-bg transition-colors focus:outline-none focus:ring-1 focus:ring-wiki-accent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
