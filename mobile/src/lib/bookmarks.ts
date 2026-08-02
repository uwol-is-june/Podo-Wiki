import AsyncStorage from '@react-native-async-storage/async-storage'

// 앱은 로그인이 없는 읽기 전용 구성(lib/supabase.ts)이라 북마크를 서버에 둘 수 없다.
// 이 기기에만 저장되며 웹과 동기화되지 않는다 — 화면 문구도 그렇게 안내할 것.
const STORAGE_KEY = 'podo-wiki:bookmarks:v1'

export type Bookmark = {
  slug: string
  /** 목록을 즉시 그리기 위한 제목 캐시. 문서 진입 시 최신 제목으로 갱신된다 */
  title: string
  /** 저장 시각 (ISO). 목록은 최신순 정렬 */
  savedAt: string
}

function isBookmark(value: unknown): value is Bookmark {
  if (typeof value !== 'object' || value === null) return false
  const b = value as Record<string, unknown>
  return typeof b.slug === 'string' && typeof b.title === 'string' && typeof b.savedAt === 'string'
}

/** 저장된 북마크를 최신순으로 반환. 값이 깨져 있으면 조용히 빈 목록으로 (읽기 실패로 화면이 죽지 않게) */
export async function loadBookmarks(): Promise<Bookmark[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isBookmark)
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  } catch {
    return []
  }
}

async function save(list: Bookmark[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

/** 이미 있으면 제목만 갱신하고 저장 시각은 유지한다 (목록 순서가 튀지 않도록) */
export async function addBookmark(slug: string, title: string): Promise<Bookmark[]> {
  const list = await loadBookmarks()
  const existing = list.find(b => b.slug === slug)
  const next = existing
    ? list.map(b => (b.slug === slug ? { ...b, title } : b))
    : [{ slug, title, savedAt: new Date().toISOString() }, ...list]
  await save(next)
  return next.sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export async function removeBookmark(slug: string): Promise<Bookmark[]> {
  const list = await loadBookmarks()
  const next = list.filter(b => b.slug !== slug)
  await save(next)
  return next
}

/** 문서 화면에서 이미 저장된 문서를 다시 열었을 때 제목이 바뀌었으면 맞춰둔다 */
export async function syncBookmarkTitle(slug: string, title: string): Promise<void> {
  const list = await loadBookmarks()
  const existing = list.find(b => b.slug === slug)
  if (!existing || existing.title === title) return
  await save(list.map(b => (b.slug === slug ? { ...b, title } : b)))
}
