export function slugToHref(slug: string): string {
  return `/w/${slug
    .replace(/%/g, '%25')
    .replace(/\//g, '%2F')
    .replace(/\?/g, '%3F')
    .replace(/#/g, '%23')
    .replace(/ /g, '%20')}`
}
