'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  BOOKMARKS_CHANGED,
  loadBookmarks,
  removeBookmark,
  syncBookmarkTitle,
  toggleBookmark,
  type Bookmark,
  type MutationResult,
} from '@/lib/bookmarks'

const FAIL_MESSAGE = '북마크를 저장하지 못했어요. 브라우저의 저장 공간·사생활 보호 설정을 확인해 주세요.'

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
  const [error, setError] = useState<string | null>(null)

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

  // 성공 시 목록 갱신은 write()가 쏘는 변경 이벤트에 맡긴다.
  // 여기서 낙관적으로 먼저 넣으면 저장이 실패했을 때 화면만 바뀌어 거짓말을 하게 됨 (TASK-069).
  const applyResult = useCallback((res: MutationResult) => {
    setError(res.ok ? null : FAIL_MESSAGE)
    return res.ok
  }, [])

  const remove = useCallback(
    (slug: string) => applyResult(removeBookmark(slug)),
    [applyResult]
  )

  return { bookmarks, ready, error, remove, dismissError: () => setError(null) }
}

/** 문서 페이지용 — 현재 문서의 저장 여부와 토글 */
export function useBookmarkToggle(slug: string, title: string) {
  const { bookmarks, ready } = useBookmarks()
  const [error, setError] = useState<string | null>(null)
  const isBookmarked = bookmarks.some(b => b.slug === slug)

  // 저장해둔 문서를 다시 열었을 때 그 사이 바뀐 제목을 반영.
  // 제목이 같으면 syncBookmarkTitle이 아무것도 하지 않으므로 재실행되지 않는다.
  useEffect(() => {
    if (ready) syncBookmarkTitle(slug, title)
  }, [ready, slug, title])

  const toggle = useCallback(() => {
    const res = toggleBookmark(slug, title)
    setError(res.ok ? null : FAIL_MESSAGE)
  }, [slug, title])

  return { isBookmarked, ready, error, toggle }
}
