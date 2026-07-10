// 웹 MarkdownContent.tsx와 동일한 remark/rehype 플러그인 구성으로 마크다운을 HTML로 변환.
// react-markdown 대신 rehype-stringify로 문자열을 만들어 WebView에 로컬 로딩한다.
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkCjkFriendly from 'remark-cjk-friendly'
import remarkCjkFriendlyGfmStrikethrough from 'remark-cjk-friendly-gfm-strikethrough'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import type { Element, Root } from 'hast'

import { processFootnotes, splitBlocks } from './structure'
import type { Block, FootnoteDef, H2Section, H3Item } from './structure'

// 웹 Img 컴포넌트의 `w=` 타이틀 규칙 포팅: title="w=300" → width:300px
function rehypeImgWidth() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return
      const title = node.properties?.title
      if (typeof title === 'string' && title.startsWith('w=')) {
        const width = title.slice(2)
        node.properties.style = `width:${width}px;height:auto;max-width:100%`
        delete node.properties.title
      }
    })
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkCjkFriendly)
  .use(remarkCjkFriendlyGfmStrikethrough)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeImgWidth)
  .use(rehypeStringify, { allowDangerousHtml: true })

async function mdToHtml(markdown: string): Promise<string> {
  if (!markdown) return ''
  const file = await processor.process(markdown)
  return String(file)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// 웹과 동일: 헤딩 표시 텍스트에서 마크다운 링크는 라벨만 남긴다
function headingText(heading: string): string {
  return escapeHtml(heading.replace(/\[(.+?)\]\(.+?\)/g, '$1'))
}

const CARET_SVG =
  '<svg class="caret" width="8" height="10" viewBox="0 0 8 10" aria-hidden="true"><path d="M1 0.5 L7.5 5 L1 9.5 Z" fill="currentColor"/></svg>'

function headingHtml(tag: 'h1' | 'h2', id: string, number: string, heading: string): string {
  return (
    `<${tag} id="${escapeHtml(id)}" class="collapsible">${CARET_SVG}` +
    `<span class="h-text"><span class="hnum">${escapeHtml(number)}.</span>${headingText(heading)}</span></${tag}>`
  )
}

async function h3Html(h: H3Item): Promise<string> {
  const body = await mdToHtml(h.body)
  return (
    `<section><h3 id="${escapeHtml(h.id)}"><span class="hnum">${escapeHtml(h.number)}.</span>${headingText(h.heading)}</h3>` +
    body +
    '</section>'
  )
}

async function h3ListHtml(h3s: H3Item[]): Promise<string> {
  const parts = await Promise.all(h3s.map(h3Html))
  return parts.join('')
}

async function h2SectionHtml(s: H2Section): Promise<string> {
  const [intro, h3s] = await Promise.all([mdToHtml(s.intro), h3ListHtml(s.h3s)])
  return `<section>${headingHtml('h2', s.id, s.number, s.heading)}<div class="sec-body">${intro}${h3s}</div></section>`
}

async function blockHtml(block: Block): Promise<string> {
  if (block.type === 'intro') {
    const [body, h3s] = await Promise.all([mdToHtml(block.body), h3ListHtml(block.h3s)])
    return body + h3s
  }
  if (block.type === 'h1') {
    const [intro, h3s, h2s] = await Promise.all([
      mdToHtml(block.intro),
      h3ListHtml(block.h3s),
      Promise.all(block.h2s.map(h2SectionHtml)).then(parts => parts.join('')),
    ])
    return `<section>${headingHtml('h1', block.id, block.number, block.heading)}<div class="sec-body">${intro}${h3s}${h2s}</div></section>`
  }
  const [intro, h3s] = await Promise.all([mdToHtml(block.intro), h3ListHtml(block.h3s)])
  return `<section>${headingHtml('h2', block.id, block.number, block.heading)}<div class="sec-body">${intro}${h3s}</div></section>`
}

async function footnoteListHtml(defs: FootnoteDef[]): Promise<string> {
  if (defs.length === 0) return ''
  const items = await Promise.all(
    defs.map(async ({ label, content, num }) => {
      const html = await mdToHtml(content)
      return (
        `<li id="fn-${escapeHtml(label)}" class="fn-item">` +
        `<a href="#fnref-${escapeHtml(label)}" class="fn-back">[${num}]</a>` +
        `<span class="fn-def">${html}</span></li>`
      )
    })
  )
  return `<div class="footnotes"><ol>${items.join('')}</ol></div>`
}

/** 위키 문서 마크다운 → 본문 HTML (템플릿 미포함, template.ts에서 감쌈) */
export async function renderWikiBodyHtml(content: string): Promise<string> {
  const { processed, defs } = processFootnotes(content)
  const blocks = splitBlocks(processed)
  const [body, footnotes] = await Promise.all([
    Promise.all(blocks.map(blockHtml)).then(parts => parts.join('')),
    footnoteListHtml(defs),
  ])
  return body + footnotes
}
