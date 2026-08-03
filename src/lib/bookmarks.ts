// 웹 북마크는 localStorage에만 저장한다 (TASK-066).
// 앱도 로그인이 없어 기기 로컬(AsyncStorage) 저장이라, 두 플랫폼 모두 "이 기기에 저장" 모델로 맞춘 것.
// 저장 형태와 실패 동작은 mobile/src/lib/bookmarks.ts와 같게 유지 — keep in sync.

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

export type MutationResult =
  | { ok: true; list: Bookmark[]; bookmarked: boolean }
  | { ok: false; reason: 'read' | 'write' }

function isBookmark(value: unknown): value is Bookmark {
  if (typeof value !== 'object' || value === null) return false
  const b = value as Record<string, unknown>
  return (
    typeof b.slug === 'string' &&
    typeof b.title === 'string' &&
    typeof b.savedAt === 'string' &&
    !Number.isNaN(Date.parse(b.savedAt))
  )
}

const byNewest = (a: Bookmark, b: Bookmark) => b.savedAt.localeCompare(a.savedAt)

/**
 * 읽기 성공과 실패를 구분한다 (TASK-069).
 *
 * 실패를 빈 목록으로 뭉개면 뒤이은 쓰기가 저장돼 있던 북마크를 통째로 지운다.
 * 읽지 못했을 때는 아무것도 쓰지 않는 게 원칙.
 */
type ReadResult = { ok: true; list: Bookmark[] } | { ok: false }

function read(): ReadResult {
  if (typeof window === 'undefined') return { ok: false }
  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return { ok: false }
  }
  if (!raw) return { ok: true, list: [] }
  try {
    const parsed: unknown = JSON.parse(raw)
    // 형태가 아예 다르면 손상으로 보고 덮어쓰지 않는다
    if (!Array.isArray(parsed)) return { ok: false }
    return { ok: true, list: parsed.filter(isBookmark).sort(byNewest) }
  } catch {
    return { ok: false }
  }
}

/** 표시용 — 읽기에 실패해도 빈 목록으로 떨어뜨려 화면이 죽지 않게 한다 */
export function loadBookmarks(): Bookmark[] {
  const r = read()
  return r.ok ? r.list : []
}

/** 성공했을 때만 변경 이벤트를 쏜다. 실패를 성공인 척 알리면 UI가 거짓말을 하게 됨 */
function write(list: Bookmark[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    return false
  }
  window.dispatchEvent(new Event(BOOKMARKS_CHANGED))
  return true
}

/**
 * 저장 여부를 뒤집는다.
 * 현재 상태를 쓰기 직전에 읽으므로, 화면이 들고 있던 낡은 값으로 판단하지 않는다
 * (연타해도 최종 상태가 뒤집히지 않음).
 */
export function toggleBookmark(slug: string, title: string): MutationResult {
  const r = read()
  if (!r.ok) return { ok: false, reason: 'read' }
  const exists = r.list.some(b => b.slug === slug)
  const next = exists
    ? r.list.filter(b => b.slug !== slug)
    : [{ slug, title, savedAt: new Date().toISOString() }, ...r.list]
  if (!write(next)) return { ok: false, reason: 'write' }
  return { ok: true, list: next, bookmarked: !exists }
}

export function removeBookmark(slug: string): MutationResult {
  const r = read()
  if (!r.ok) return { ok: false, reason: 'read' }
  const next = r.list.filter(b => b.slug !== slug)
  if (!write(next)) return { ok: false, reason: 'write' }
  return { ok: true, list: next, bookmarked: false }
}

/**
 * 저장해둔 문서를 다시 열었을 때 그 사이 바뀐 제목을 반영.
 * 실제로 바꿨을 때만 true — 호출부가 불필요한 갱신을 건너뛸 수 있게 한다.
 */
export function syncBookmarkTitle(slug: string, title: string): boolean {
  const r = read()
  if (!r.ok) return false
  const existing = r.list.find(b => b.slug === slug)
  if (!existing || existing.title === title) return false
  return write(r.list.map(b => (b.slug === slug ? { ...b, title } : b)))
}
