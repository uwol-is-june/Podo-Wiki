import type { Metadata } from 'next'

import BookmarkList from './BookmarkList'

export const metadata: Metadata = {
  title: '북마크 — 포도위키',
}

export default function BookmarksPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-wiki-text mb-1">북마크</h1>
      <p className="text-sm text-wiki-text-muted mb-6">
        저장한 문서 목록입니다. 북마크는 <strong className="font-medium">이 브라우저에만</strong>{' '}
        저장되며, 다른 기기나 앱과 공유되지 않습니다.
      </p>

      <div className="bg-wiki-surface border border-wiki-border rounded-lg overflow-hidden">
        <BookmarkList />
      </div>
    </div>
  )
}
