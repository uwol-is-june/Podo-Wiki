import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import {
  addBookmark,
  loadBookmarks,
  removeBookmark,
  syncBookmarkTitle,
  type Bookmark,
} from '@/lib/bookmarks'

const KEY = ['bookmarks'] as const

// 북마크는 AsyncStorage에만 있지만 react-query로 감싸서
// 문서 화면에서 토글한 결과가 북마크 탭에도 즉시 반영되게 한다.
export function useBookmarks() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: KEY,
    queryFn: loadBookmarks,
    staleTime: 0,
  })
  return { bookmarks: data ?? [], isLoading, refetch }
}

/** 문서 화면용 — 현재 문서의 저장 여부와 토글 */
export function useBookmarkToggle(slug: string, title: string | undefined) {
  const queryClient = useQueryClient()
  const { data } = useQuery({ queryKey: KEY, queryFn: loadBookmarks, staleTime: 0 })
  const isBookmarked = (data ?? []).some((b: Bookmark) => b.slug === slug)

  const { mutate, isPending } = useMutation({
    mutationFn: async () =>
      isBookmarked ? removeBookmark(slug) : addBookmark(slug, title ?? slug),
    onSuccess: next => queryClient.setQueryData(KEY, next),
  })

  return { isBookmarked, toggle: mutate, isPending }
}

/** 이미 저장된 문서를 열었을 때 바뀐 제목을 반영 */
export function useSyncBookmarkTitle() {
  const queryClient = useQueryClient()
  return useCallback(
    async (slug: string, title: string) => {
      await syncBookmarkTitle(slug, title)
      await queryClient.invalidateQueries({ queryKey: KEY })
    },
    [queryClient]
  )
}

export function useRemoveBookmark() {
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: (slug: string) => removeBookmark(slug),
    onSuccess: next => queryClient.setQueryData(KEY, next),
  })
  return mutate
}
