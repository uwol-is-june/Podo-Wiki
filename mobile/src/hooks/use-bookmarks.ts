import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { Alert } from 'react-native'

import {
  loadBookmarks,
  removeBookmark,
  syncBookmarkTitle,
  toggleBookmark,
  type Bookmark,
  type MutationResult,
} from '@/lib/bookmarks'

const KEY = ['bookmarks'] as const

function alertFailure() {
  Alert.alert('북마크를 저장하지 못했어요', '기기 저장 공간을 확인한 뒤 다시 시도해 주세요.')
}

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

/** 성공했을 때만 캐시를 갱신한다. 실패를 성공인 척 반영하면 화면이 거짓말을 하게 됨 (TASK-069) */
function useApplyResult() {
  const queryClient = useQueryClient()
  return useCallback(
    (res: MutationResult) => {
      if (res.ok) queryClient.setQueryData(KEY, res.list)
      else alertFailure()
    },
    [queryClient]
  )
}

/** 문서 화면용 — 현재 문서의 저장 여부와 토글 */
export function useBookmarkToggle(slug: string, title: string | undefined) {
  const applyResult = useApplyResult()
  const { data } = useQuery({ queryKey: KEY, queryFn: loadBookmarks, staleTime: 0 })
  const isBookmarked = (data ?? []).some((b: Bookmark) => b.slug === slug)

  // 저장 여부 판단은 toggleBookmark가 쓰기 직전에 다시 읽는다.
  // 여기서 캡처한 isBookmarked로 분기하면 연타 시 두 번 다 같은 방향으로 동작함
  const { mutate, isPending } = useMutation({
    mutationFn: () => toggleBookmark(slug, title ?? slug),
    onSuccess: applyResult,
    onError: alertFailure,
  })

  return { isBookmarked, toggle: mutate, isPending }
}

/** 이미 저장된 문서를 열었을 때 바뀐 제목을 반영 */
export function useSyncBookmarkTitle() {
  const queryClient = useQueryClient()
  return useCallback(
    async (slug: string, title: string) => {
      // 실제로 바뀐 경우에만 무효화 — 문서를 열 때마다 헛도는 갱신을 막는다 (TASK-071)
      const changed = await syncBookmarkTitle(slug, title)
      if (changed) await queryClient.invalidateQueries({ queryKey: KEY })
    },
    [queryClient]
  )
}

export function useRemoveBookmark() {
  const applyResult = useApplyResult()
  const { mutate } = useMutation({
    mutationFn: (slug: string) => removeBookmark(slug),
    onSuccess: applyResult,
    onError: alertFailure,
  })
  return mutate
}
