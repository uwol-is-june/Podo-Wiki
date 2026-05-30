export type Heading = {
  level: 1 | 2 | 3
  text: string
  id: string
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'heading'
  )
}

export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  for (const line of content.split('\n')) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (!match) continue
    const level = match[1].length as 1 | 2 | 3
    const text = match[2]
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .trim()
    headings.push({ level, text, id: slugify(text) })
  }
  return headings
}
