export type Heading = {
  level: 1 | 2 | 3
  text: string
  id: string
  number: string
}

/**
 * 각 항목에 나무위키 스타일 계층 번호(1 / 1.1 / 1.1.1)를 매긴다.
 * 상위 레벨이 중간에 생략돼도(예: h1 다음 바로 h3) 번호는 부모의 실제 자식 순번을
 * 그대로 이어받는다 (1.0.1이 아닌 1.1처럼 표시).
 */
export function numberHeadings<T extends { level: number }>(items: T[]): (T & { number: string })[] {
  const stack: { level: number; count: number; prefix: string }[] = [{ level: 0, count: 0, prefix: '' }]
  return items.map((item) => {
    while (stack.length > 1 && stack[stack.length - 1].level >= item.level) stack.pop()
    const parent = stack[stack.length - 1]
    parent.count++
    const number = parent.prefix ? `${parent.prefix}.${parent.count}` : `${parent.count}`
    stack.push({ level: item.level, count: 0, prefix: number })
    return { ...item, number }
  })
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

/** 제목 줄에서 인라인 마크다운 표기(굵게·기울임·코드·링크)를 걷어낸 표시용 텍스트 */
export function headingText(raw: string): string {
  return raw
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim()
}

/**
 * 제목 줄 → 앵커 id.
 *
 * 목차와 본문 렌더러가 **반드시 이 함수를 함께** 써야 한다.
 * 한쪽만 원본 줄을 그대로 slugify하면 링크가 든 제목에서 id가 어긋나
 * 목차를 눌러도 아무 일이 없는 상태가 된다 (TASK-070).
 */
export function headingId(raw: string): string {
  return slugify(headingText(raw))
}

export function extractHeadings(content: string): Heading[] {
  const raw: { level: 1 | 2 | 3; text: string; id: string }[] = []
  for (const line of content.split('\n')) {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (!match) continue
    const level = match[1].length as 1 | 2 | 3
    const text = headingText(match[2])
    raw.push({ level, text, id: slugify(text) })
  }
  return numberHeadings(raw)
}
