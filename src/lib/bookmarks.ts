// 웹 북마크는 localStorage에만 저장한다 (TASK-066).
// 앱도 로그인이 없어 기기 로컬(AsyncStorage) 저장이라, 두 플랫폼 모두 "이 기기에 저장" 모델로 맞춘 것.
// 저장 형태는 mobile/src/lib/bookmarks.ts와 동일하게 유지 — 나중에 서버 저장으로 올릴 때 편하도록.

const STORAGE_KEY = 'podo-wiki:bookmarks:v1'

/** 다른 탭/컴포넌트에 변경을 알리는 커스텀 이벤트 (storage 이벤트는 같은 탭에서 안 뜸) */
export const BOOKMARKS_CHANGED = 'podo-wiki:bookmarks-changed'

export type Bookmark = {
  slug: string
  /** 목록을 즉시 그리기 위한 제목 캐시 */
  title: string
  /** 저장 시각 (ISO). 목록은 최신순 */
  savedAt: string
}

function isBookmark(value: unknown): value is Bookmark {
  if (typeof value !== 'object' || value === null) return false
  const b = value as Record<string, unknown>
  return typeof b.slug === 'string' && typeof b.title === 'string' && typeof b.savedAt === 'string'
}

/** 서버 렌더 중에는 localStorage가 없으므로 항상 빈 목록. 값이 깨져 있어도 빈 목록으로 (읽기 실패로 화면이 죽지 않게) */
export function loadBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isBookmark).sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  } catch {
    return []
  }
}

function save(list: Bookmark[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // 사생활 보호 모드 등으로 쓰기가 막힌 경우 — 조용히 무시
  }
  window.dispatchEvent(new Event(BOOKMARKS_CHANGED))
}

/** 이미 있으면 제목만 갱신하고 저장 시각은 유지 (목록 순서가 튀지 않도록) */
export function addBookmark(slug: string, title: string): Bookmark[] {
  const list = loadBookmarks()
  const existing = list.find(b => b.slug === slug)
  const next = existing
    ? list.map(b => (b.slug === slug ? { ...b, title } : b))
    : [{ slug, title, savedAt: new Date().toISOString() }, ...list]
  save(next)
  return next
}

export function removeBookmark(slug: string): Bookmark[] {
  const next = loadBookmarks().filter(b => b.slug !== slug)
  save(next)
  return next
}

/** 저장해둔 문서를 다시 열었을 때 그 사이 바뀐 제목을 반영 */
export function syncBookmarkTitle(slug: string, title: string): void {
  const list = loadBookmarks()
  const existing = list.find(b => b.slug === slug)
  if (!existing || existing.title === title) return
  save(list.map(b => (b.slug === slug ? { ...b, title } : b)))
}
