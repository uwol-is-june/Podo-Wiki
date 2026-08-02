'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  BOOKMARKS_CHANGED,
  addBookmark,
  loadBookmarks,
  removeBookmark,
  syncBookmarkTitle,
  type Bookmark,
} from '@/lib/bookmarks'

/**
 * localStorage의 북마크를 읽는다.
 *
 * 서버 렌더와 첫 클라이언트 렌더에서는 항상 빈 목록 + `ready: false`를 준다.
 * localStorage 값으로 곧장 그리면 서버 HTML과 달라져 하이드레이션 불일치가 나기 때문에,
 * 마운트 이후에만 실제 값을 반영한다. 호출부는 `ready`가 false인 동안 중립 상태를 그릴 것.
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => setBookmarks(loadBookmarks())
    sync()
    setReady(true)
    // 같은 탭의 다른 컴포넌트(커스텀 이벤트) + 다른 탭(storage 이벤트) 양쪽에 반응
    window.addEventListener(BOOKMARKS_CHANGED, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(BOOKMARKS_CHANGED, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const remove = useCallback((slug: string) => {
    setBookmarks(removeBookmark(slug))
  }, [])

  return { bookmarks, ready, remove }
}

/** 문서 페이지용 — 현재 문서의 저장 여부와 토글 */
export function useBookmarkToggle(slug: string, title: string) {
  const { bookmarks, ready } = useBookmarks()
  const isBookmarked = bookmarks.some(b => b.slug === slug)

  // 저장해둔 문서를 다시 열었을 때 그 사이 바뀐 제목을 반영
  useEffect(() => {
    if (ready) syncBookmarkTitle(slug, title)
  }, [ready, slug, title])

  const toggle = useCallback(() => {
    if (loadBookmarks().some(b => b.slug === slug)) removeBookmark(slug)
    else addBookmark(slug, title)
  }, [slug, title])

  return { isBookmarked, ready, toggle }
}
