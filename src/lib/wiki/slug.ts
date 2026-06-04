export function slugToHref(slug: string): string {
  return `/w/${encodeURIComponent(slug)}`
}
