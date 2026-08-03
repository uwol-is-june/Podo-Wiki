import AsyncStorage from '@react-native-async-storage/async-storage'

// 앱은 로그인이 없는 읽기 전용 구성(lib/supabase.ts)이라 북마크를 서버에 둘 수 없다.
// 이 기기에만 저장되며 웹과 동기화되지 않는다 — 화면 문구도 그렇게 안내할 것.
// 저장 형태와 실패 동작은 웹 src/lib/bookmarks.ts와 같게 유지 — keep in sync.
const STORAGE_KEY = 'podo-wiki:bookmarks:v1'

export type Bookmark = {
  slug: string
  /** 목록을 즉시 그리기 위한 제목 캐시. 문서 진입 시 최신 제목으로 갱신된다 */
  title: string
  /** 저장 시각 (ISO). 목록은 최신순 정렬 */
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

async function read(): Promise<ReadResult> {
  let raw: string | null
  try {
    raw = await AsyncStorage.getItem(STORAGE_KEY)
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
export async function loadBookmarks(): Promise<Bookmark[]> {
  const r = await read()
  return r.ok ? r.list : []
}

// 모든 변경은 읽고-고치고-쓰기라, 겹치면 나중 것이 앞의 것을 덮어쓴다.
// (예: 문서 진입 시 제목 동기화가 도는 중에 사용자가 북마크를 해제하면 해제가 사라짐)
// 한 줄로 세워서 하나씩 실행한다.
let queue: Promise<unknown> = Promise.resolve()

function serialize<T>(op: () => Promise<T>): Promise<T> {
  const run = queue.then(op, op)
  queue = run.then(
    () => undefined,
    () => undefined
  )
  return run
}

async function write(list: Bookmark[]): Promise<boolean> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

/**
 * 저장 여부를 뒤집는다.
 * 현재 상태를 쓰기 직전에 읽으므로, 화면이 들고 있던 낡은 값으로 판단하지 않는다
 * (연타해도 최종 상태가 뒤집히지 않음).
 */
export function toggleBookmark(slug: string, title: string): Promise<MutationResult> {
  return serialize(async () => {
    const r = await read()
    if (!r.ok) return { ok: false, reason: 'read' } as const
    const exists = r.list.some(b => b.slug === slug)
    const next = exists
      ? r.list.filter(b => b.slug !== slug)
      : [{ slug, title, savedAt: new Date().toISOString() }, ...r.list]
    if (!(await write(next))) return { ok: false, reason: 'write' } as const
    return { ok: true, list: next, bookmarked: !exists } as const
  })
}

export function removeBookmark(slug: string): Promise<MutationResult> {
  return serialize(async () => {
    const r = await read()
    if (!r.ok) return { ok: false, reason: 'read' } as const
    const next = r.list.filter(b => b.slug !== slug)
    if (!(await write(next))) return { ok: false, reason: 'write' } as const
    return { ok: true, list: next, bookmarked: false } as const
  })
}

/**
 * 이미 저장된 문서를 열었을 때 바뀐 제목을 반영.
 * 실제로 바꿨을 때만 true — 호출부가 불필요한 갱신을 건너뛸 수 있게 한다.
 */
export function syncBookmarkTitle(slug: string, title: string): Promise<boolean> {
  return serialize(async () => {
    const r = await read()
    if (!r.ok) return false
    const existing = r.list.find(b => b.slug === slug)
    if (!existing || existing.title === title) return false
    return write(r.list.map(b => (b.slug === slug ? { ...b, title } : b)))
  })
}
