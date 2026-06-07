function encodeSlug(slug: string): string {
  return slug.replace(/%/g, '%25').replace(/\?/g, '%3F').replace(/#/g, '%23').replace(/ /g, '%20')
}

export function slugToHref(slug: string): string {
  return `/w/${encodeSlug(slug)}`
}

export function slugToEditHref(slug: string): string {
  return `/edit/${encodeSlug(slug)}`
}

export function slugToHistoryHref(slug: string): string {
  return `/history/${encodeSlug(slug)}`
}
