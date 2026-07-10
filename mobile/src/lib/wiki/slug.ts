// Copied from src/lib/wiki/slug.ts — keep in sync
// (모바일 내비게이션은 params 객체 방식이라 주로 마크다운 링크 href 해석에 사용)
function encodeSlug(slug: string): string {
  return slug.replace(/%/g, '%25').replace(/\?/g, '%3F').replace(/#/g, '%23').replace(/ /g, '%20')
}

export function slugToHref(slug: string): string {
  return `/w/${encodeSlug(slug)}`
}

export function slugToHistoryHref(slug: string): string {
  return `/history/${encodeSlug(slug)}`
}
