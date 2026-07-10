// Copied from src/lib/wiki/faq.ts — keep in sync
import { slugify } from '@/lib/wiki/headings'

export type FaqItem = {
  id: string
  question: string
  answer: string
}

/**
 * FAQ 문서(포도위키:FAQ)를 `## 질문` 헤딩 단위로 분리한다.
 * 헤딩 텍스트 = 질문, 다음 `##` 전까지의 본문 = 답변(마크다운).
 * id는 문서 목차와 같은 slugify 규칙이라 /faq 딥링크 앵커로 사용한다.
 */
export function parseFaqItems(content: string): FaqItem[] {
  const items: FaqItem[] = []
  let current: { question: string; lines: string[] } | null = null

  const push = () => {
    if (!current) return
    items.push({
      id: slugify(current.question),
      question: current.question,
      answer: current.lines.join('\n').trim(),
    })
  }

  for (const line of content.split('\n')) {
    const match = line.match(/^##\s+(.+)$/)
    if (match) {
      push()
      const question = match[1]
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        .trim()
      current = { question, lines: [] }
    } else if (current) {
      current.lines.push(line)
    }
  }
  push()
  return items
}
