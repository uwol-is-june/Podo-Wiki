'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { getMarkRange } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey, type Transaction } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import type { Node as PMNode } from 'prosemirror-model'
import { useRef, useState, useTransition, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import TurndownService from 'turndown'
import { saveDocument } from '@/lib/wiki/actions'
import { releaseLock, refreshLock } from '@/lib/wiki/lock-actions'
import { slugToHref } from '@/lib/wiki/slug'
import { createClient } from '@/lib/supabase/client'
import LinkInsertModal from './LinkInsertModal'
import FootnoteInsertModal from './FootnoteInsertModal'
import FootnoteRefPopover from './FootnoteRefPopover'
import FootnoteDeleteConfirmModal from './FootnoteDeleteConfirmModal'

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})

// GFM tables 플러그인 대신 raw HTML로 저장 — 셀 안에 리스트·단락이 있어도 깨지지 않음
td.addRule('html-table', {
  filter: 'table',
  replacement: (_content, node) => '\n\n' + (node as Element).outerHTML + '\n\n',
})

// 텍스트 색상 span은 HTML 그대로 보존 — rehype-raw가 읽기 모드에서 렌더링함
td.addRule('color-span', {
  filter: (node) => node.nodeName === 'SPAN' && !!(node as HTMLElement).style.color,
  replacement: (_content, node) => (node as HTMLElement).outerHTML,
})

// width가 있는 이미지는 title 필드에 "w=숫자" 형태로 너비를 인코딩해 저장
td.addRule('resizable-image', {
  filter: (node) => node.nodeName === 'IMG' && !!(node as Element).getAttribute('width'),
  replacement: (_content, node) => {
    const el = node as HTMLImageElement
    const src = el.getAttribute('src') ?? ''
    const alt = el.getAttribute('alt') ?? ''
    const width = el.getAttribute('width') ?? ''
    return `![${alt}](${src} "w=${width}")`
  },
})

// ── 각주 스캔 / 재넘버링 ─────────────────────────────────────────────

type FootnoteRef = { label: string; from: number; to: number }
type FootnoteDef = { label: string; content: string; pos: number; nodeSize: number; labelFrom: number; labelTo: number }

// 문서를 훑어서 각주 정의 단락([^N]: 내용)과 본문 참조([^N])의 위치를 수집
function collectFootnotes(doc: PMNode): { defs: FootnoteDef[]; refs: FootnoteRef[] } {
  const defs: FootnoteDef[] = []
  const refs: FootnoteRef[] = []

  doc.forEach((node, pos) => {
    if (node.type.name !== 'paragraph') return
    const text = node.textContent
    const defMatch = text.match(/^\[\^([^\]]+)\]:\s*([\s\S]*)$/)

    if (defMatch) {
      const label = defMatch[1]
      const labelFrom = pos + 3 // paragraph 내용 시작(pos+1) + "[^" 길이(2)
      defs.push({ label, content: defMatch[2], pos, nodeSize: node.nodeSize, labelFrom, labelTo: labelFrom + label.length })
    } else {
      node.descendants((child, relPos) => {
        if (child.isText && child.text) {
          for (const m of child.text.matchAll(/\[\^([^\]]+)\]/g)) {
            const from = pos + 1 + relPos + (m.index ?? 0)
            refs.push({ label: m[1], from, to: from + m[0].length })
          }
        }
      })
    }
  })

  return { defs, refs }
}

// 정의가 없는 참조·참조가 없는 정의를 정리하고, 남은 각주를 본문 등장 순서대로 1..n 재넘버링
function applyFootnoteRenumber(tr: Transaction, doc: PMNode): boolean {
  const { defs, refs } = collectFootnotes(doc)
  const defMap = new Map(defs.map((d) => [d.label, d]))
  const liveRefs = refs.filter((r) => defMap.has(r.label))
  const orphanRefs = refs.filter((r) => !defMap.has(r.label))

  const orderedLabels: string[] = []
  const seen = new Set<string>()
  for (const r of liveRefs) {
    if (!seen.has(r.label)) { seen.add(r.label); orderedLabels.push(r.label) }
  }
  const orphanDefs = defs.filter((d) => !seen.has(d.label))

  const relabelMap = new Map<string, string>()
  orderedLabels.forEach((label, i) => {
    const newLabel = String(i + 1)
    if (newLabel !== label) relabelMap.set(label, newLabel)
  })

  const edits: { from: number; to: number; text?: string }[] = []
  for (const r of orphanRefs) edits.push({ from: r.from, to: r.to })
  for (const d of orphanDefs) edits.push({ from: d.pos, to: d.pos + d.nodeSize })
  for (const r of liveRefs) {
    const newLabel = relabelMap.get(r.label)
    if (newLabel) edits.push({ from: r.from + 2, to: r.to - 1, text: newLabel })
  }
  for (const d of defMap.values()) {
    const newLabel = relabelMap.get(d.label)
    if (newLabel) edits.push({ from: d.labelFrom, to: d.labelTo, text: newLabel })
  }

  if (edits.length === 0) return false
  // 뒤쪽 위치부터 적용해야 앞쪽에 계산해둔 위치가 어긋나지 않음
  edits.sort((a, b) => b.from - a.from)
  for (const e of edits) {
    if (e.text !== undefined) tr.insertText(e.text, e.from, e.to)
    else tr.delete(e.from, e.to)
  }
  return true
}

// 리액트 컴포넌트로 이벤트를 흘려보내는 용도 — CustomEvent detail 타입
type FootnoteBlockDetail = { label: string; content: string }
type FootnoteRefClickDetail = { label: string; content: string; rect: DOMRect }

type FootnoteDecoratorOptions = {
  // FootnoteDecorator 플러그인이 리액트 state를 갱신할 수 있도록 이벤트를 쏘는 통로.
  // useRef 대신 컴포넌트에서 useMemo(() => new EventTarget())로 만든 안정된 인스턴스를 주입받음
  // ('footnote-block': 본문 참조만 직접 지워지려 할 때, 'footnote-ref-click': 참조 클릭 시)
  events: EventTarget
}

// 에디터 내 각주 정의 단락과 본문 내 [^n] 참조를 시각적으로 강조하고,
// 참조 클릭 시 팝오버를 띄우며, 참조/정의 삭제에 맞춰 확인 모달·재넘버링을 처리
const FootnoteDecorator = Extension.create<FootnoteDecoratorOptions>({
  name: 'footnoteDecorator',
  addOptions() {
    return { events: new EventTarget() }
  },
  addProseMirrorPlugins() {
    const { events } = this.options
    return [
      new Plugin({
        key: new PluginKey('footnoteDecorator'),
        filterTransaction(tr, state) {
          if (!tr.docChanged || tr.getMeta('footnoteBypass')) return true

          const before = collectFootnotes(state.doc)
          const after = collectFootnotes(tr.doc)
          const beforeDefLabels = new Set(before.defs.map((d) => d.label))
          const afterDefLabels = new Set(after.defs.map((d) => d.label))
          const afterRefLabels = new Set(after.refs.map((r) => r.label))

          for (const r of before.refs) {
            // 정의는 그대로인데 본문 참조만 사라지는 경우 → 직접 삭제 시도이므로 막고 확인 모달을 띄움
            if (!afterRefLabels.has(r.label) && beforeDefLabels.has(r.label) && afterDefLabels.has(r.label)) {
              const def = before.defs.find((d) => d.label === r.label)
              const detail: FootnoteBlockDetail = { label: r.label, content: def?.content ?? '' }
              events.dispatchEvent(new CustomEvent('footnote-block', { detail }))
              return false
            }
          }
          return true
        },
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((t) => t.docChanged)) return null
          if (transactions.some((t) => t.getMeta('footnoteSkipRenumber'))) return null
          const tr = newState.tr
          if (!applyFootnoteRenumber(tr, newState.doc)) return null
          tr.setMeta('footnoteBypass', true).setMeta('footnoteSkipRenumber', true)
          return tr
        },
        props: {
          decorations(state) {
            const decorations: Decoration[] = []
            let prevWasFootnoteDef = false

            state.doc.forEach((node, pos) => {
              if (node.type.name === 'paragraph') {
                const text = node.textContent
                const isDefPara = /^\[\^[^\]]+\]:/.test(text)

                if (isDefPara) {
                  const cls = prevWasFootnoteDef ? 'fn-def' : 'fn-def fn-def-first'
                  decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: cls }))
                  prevWasFootnoteDef = true
                } else {
                  prevWasFootnoteDef = false
                  node.descendants((child, relPos) => {
                    if (child.isText && child.text) {
                      for (const m of child.text.matchAll(/\[\^[^\]]+\]/g)) {
                        const from = pos + 1 + relPos + (m.index ?? 0)
                        decorations.push(Decoration.inline(from, from + m[0].length, { class: 'fn-ref' }))
                      }
                    }
                  })
                }
              } else {
                prevWasFootnoteDef = false
              }
            })

            return DecorationSet.create(state.doc, decorations)
          },
          handleClick(view, _pos, event) {
            const target = event.target instanceof HTMLElement ? event.target.closest('.fn-ref') : null
            if (!target) return false
            const m = (target.textContent ?? '').match(/^\[\^([^\]]+)\]$/)
            if (!m) return false
            const label = m[1]
            const { defs } = collectFootnotes(view.state.doc)
            const def = defs.find((d) => d.label === label)
            const detail: FootnoteRefClickDetail = { label, content: def?.content ?? '', rect: target.getBoundingClientRect() }
            events.dispatchEvent(new CustomEvent('footnote-ref-click', { detail }))
            return true
          },
        },
      }),
    ]
  },
})

type Props = {
  slug: string
  initialTitle: string
  initialHtml: string
}

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1 rounded text-sm transition-colors ${
        active
          ? 'bg-wiki-accent text-white'
          : 'text-wiki-text hover:bg-wiki-border/60'
      }`}
    >
      {children}
    </button>
  )
}

export default function WikiEditor({ slug, initialTitle, initialHtml }: Props) {
  const [title, setTitle] = useState(initialTitle)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [currentLinkHref, setCurrentLinkHref] = useState('')
  const [currentLinkText, setCurrentLinkText] = useState('')
  const [footnoteModalOpen, setFootnoteModalOpen] = useState(false)
  const [footnotePopover, setFootnotePopover] = useState<{ label: string; content: string; top: number; left: number } | null>(null)
  const [footnoteDeleteConfirm, setFootnoteDeleteConfirm] = useState<{ label: string; content: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // FootnoteDecorator 플러그인이 리액트 state를 갱신할 수 있도록 이벤트를 구독 — 안정된 EventTarget 인스턴스를 .configure()에 주입
  const footnoteEvents = useMemo(() => new EventTarget(), [])

  useEffect(() => {
    const onBlock = (e: Event) => {
      const { label, content } = (e as CustomEvent<{ label: string; content: string }>).detail
      setFootnotePopover(null)
      setFootnoteDeleteConfirm({ label, content })
    }
    const onRefClick = (e: Event) => {
      const { label, content, rect } = (e as CustomEvent<{ label: string; content: string; rect: DOMRect }>).detail
      setFootnotePopover({ label, content, top: rect.bottom + 4, left: rect.left })
    }
    footnoteEvents.addEventListener('footnote-block', onBlock)
    footnoteEvents.addEventListener('footnote-ref-click', onRefClick)
    return () => {
      footnoteEvents.removeEventListener('footnote-block', onBlock)
      footnoteEvents.removeEventListener('footnote-ref-click', onRefClick)
    }
  }, [footnoteEvents])

  // 편집 중 락 유지: 10분마다 갱신, 언마운트 시 해제
  useEffect(() => {
    const interval = setInterval(() => { refreshLock(slug) }, 10 * 60 * 1000)
    return () => {
      clearInterval(interval)
      releaseLock(slug)
    }
  }, [slug])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: false } }),
      Image.configure({ inline: false, resize: { enabled: true, alwaysPreserveAspectRatio: true, minWidth: 50 } }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      FootnoteDecorator.configure({ events: footnoteEvents }),
    ],
    content: initialHtml,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[200px] sm:min-h-[400px] p-5',
      },
    },
  })

  const openLinkModal = useCallback(() => {
    if (!editor) return
    const href = editor.getAttributes('link').href ?? ''
    setCurrentLinkHref(href)

    const { from, to } = editor.state.selection
    let text = editor.state.doc.textBetween(from, to)
    if (!text) {
      const markType = editor.schema.marks.link
      const range = getMarkRange(editor.state.doc.resolve(from), markType)
      if (range) text = editor.state.doc.textBetween(range.from, range.to)
    }
    setCurrentLinkText(text)
    setLinkModalOpen(true)
  }, [editor])

  const handleLinkConfirm = useCallback((href: string, text: string) => {
    if (!editor) return
    const { from } = editor.state.selection
    const markType = editor.schema.marks.link
    const markRange = getMarkRange(editor.state.doc.resolve(from), markType)
    const { from: selFrom, to: selTo } = editor.state.selection
    const finalFrom = markRange?.from ?? selFrom
    const finalTo = markRange?.to ?? selTo

    editor.chain()
      .focus()
      .deleteRange({ from: finalFrom, to: finalTo })
      .insertContentAt(finalFrom, { type: 'text', text, marks: [{ type: 'link', attrs: { href } }] })
      .run()
    setLinkModalOpen(false)
  }, [editor])

  const handleFootnoteConfirm = useCallback((content: string) => {
    if (!editor) return
    const text = editor.state.doc.textContent
    const existingNums = [...text.matchAll(/\[\^(\d+)\]:/g)].map(m => parseInt(m[1], 10))
    const N = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1
    // 참조([^N])와 정의(문서 맨 끝)를 한 트랜잭션에서 함께 삽입 — 두 트랜잭션으로 나누면
    // 정의가 아직 없는 순간에 FootnoteDecorator의 재넘버링이 참조를 고아로 보고 지워버림.
    // 참조를 먼저 넣어야 하는 이유: insertContentAt은 삽입 후 커서를 삽입된 내용 뒤로 옮기므로,
    // 정의를 먼저 넣으면 뒤이은 참조 삽입이 원래 커서 위치가 아니라 문서 맨 끝(정의 옆)에 들어가버림.
    // 정의는 참조 삽입 이후 시점의 문서 끝 위치(tr.doc.content.size)에 직접 삽입해 커서를 건드리지 않음.
    editor.chain()
      .focus()
      .insertContent(`[^${N}]`)
      .command(({ tr, dispatch }) => {
        if (dispatch) {
          const pos = tr.doc.content.size
          const defParagraph = editor.schema.nodes.paragraph.create(null, editor.schema.text(`[^${N}]: ${content}`))
          tr.insert(pos, defParagraph)
        }
        return true
      })
      .run()
    setFootnoteModalOpen(false)
  }, [editor])

  // 각주 삭제 확정 — 본문 참조와 정의 단락을 함께 제거. 이후 남은 각주 재넘버링은 FootnoteDecorator의 appendTransaction이 처리
  const deleteFootnote = useCallback((label: string) => {
    if (!editor) return
    const { state } = editor
    const { defs, refs } = collectFootnotes(state.doc)
    const targets: { from: number; to: number }[] = []
    const def = defs.find((d) => d.label === label)
    if (def) targets.push({ from: def.pos, to: def.pos + def.nodeSize })
    for (const r of refs.filter((r) => r.label === label)) targets.push({ from: r.from, to: r.to })
    if (targets.length === 0) return
    const tr = state.tr
    targets.sort((a, b) => b.from - a.from)
    for (const t of targets) tr.delete(t.from, t.to)
    tr.setMeta('footnoteBypass', true)
    editor.view.dispatch(tr)
  }, [editor])

  // 각주 내용만 수정 — 번호(label)는 그대로 두고 정의 단락의 내용만 교체
  const handleFootnoteEditSave = useCallback((label: string, newContent: string) => {
    if (!editor) return
    const { defs } = collectFootnotes(editor.state.doc)
    const def = defs.find((d) => d.label === label)
    if (!def) return
    const tr = editor.state.tr
    tr.insertText(`[^${label}]: ${newContent}`, def.pos + 1, def.pos + def.nodeSize - 1)
    editor.view.dispatch(tr)
  }, [editor])

  const handleLinkRemove = useCallback(() => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkModalOpen(false)
  }, [editor])

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    // 파일 초기화 (같은 파일 재선택 허용)
    e.target.value = ''

    const ext = file.name.split('.').pop() ?? 'png'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    setIsUploading(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: uploadError } = await supabase.storage
        .from('wiki-images')
        .upload(filename, file, { upsert: false })

      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from('wiki-images')
        .getPublicUrl(data.path)

      editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run()
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 업로드 실패')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = () => {
    if (!editor) return
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    setError('')
    startTransition(async () => {
      const html = editor.getHTML()
      const markdown = td.turndown(html).replace(/\\\[/g, '[').replace(/\\\]/g, ']').replace(/(\d+)\\\./g, '$1.')
      const result = await saveDocument(slug, title.trim(), markdown, comment.trim())
      if ('error' in result) {
        setError(result.error)
      } else {
        await releaseLock(slug)
        router.push(slugToHref(slug))
      }
    })
  }

  const inTable = editor?.isActive('table') ?? false

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6">
      {/* 페이지 헤더 */}
      <div className="mb-4">
        <div className="flex items-center gap-0 border-b border-wiki-border">
          <span className="px-4 py-2 text-sm font-medium text-wiki-accent border-b-2 border-wiki-accent -mb-px">
            수정
          </span>
        </div>
      </div>

      <div className="relative bg-wiki-surface border border-wiki-border rounded-lg overflow-clip">
        {isPending && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/20 backdrop-blur-[1px]">
            <div className="bg-wiki-surface rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-3">
              <svg className="animate-spin w-7 h-7 text-wiki-accent" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span className="text-sm font-medium text-wiki-text">저장 중…</span>
            </div>
          </div>
        )}
        {/* 제목 입력 */}
        <div className="border-b border-wiki-border px-4 py-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문서 제목"
            className="w-full text-xl font-bold bg-transparent text-wiki-text placeholder:text-wiki-text-muted outline-none"
          />
        </div>

        {/* 툴바 */}
        <div className="sticky top-[50px] z-20">
        <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap items-center gap-0.5 px-3 py-2 border-b border-wiki-border bg-wiki-surface">
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleBold().run()}
            active={editor?.isActive('bold')}
            title="굵게 (Ctrl+B)"
          >
            <strong>B</strong>
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            active={editor?.isActive('italic')}
            title="기울임 (Ctrl+I)"
          >
            <em>I</em>
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            active={editor?.isActive('strike')}
            title="취소선"
          >
            <s>S</s>
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleCode().run()}
            active={editor?.isActive('code')}
            title="인라인 코드"
          >
            {'<>'}
          </ToolbarBtn>

          <span className="w-px h-5 bg-wiki-border mx-1" />

          {([1, 2, 3] as const).map((level) => (
            <ToolbarBtn
              key={level}
              onClick={() => editor?.chain().focus().toggleHeading({ level }).run()}
              active={editor?.isActive('heading', { level })}
              title={`제목 ${level}`}
            >
              H{level}
            </ToolbarBtn>
          ))}

          <span className="w-px h-5 bg-wiki-border mx-1" />

          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            active={editor?.isActive('bulletList')}
            title="글머리 기호 목록"
          >
            • 목록
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            active={editor?.isActive('orderedList')}
            title="번호 매기기 목록"
          >
            1. 목록
          </ToolbarBtn>

          <span className="w-px h-5 bg-wiki-border mx-1" />

          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            active={editor?.isActive('codeBlock')}
            title="코드 블록"
          >
            {'```'}
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            active={editor?.isActive('blockquote')}
            title="인용"
          >
            &ldquo;&rdquo;
          </ToolbarBtn>
          <ToolbarBtn
            onClick={openLinkModal}
            active={editor?.isActive('link')}
            title="링크"
          >
            🔗
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            active={false}
            title="구분선"
          >
            ―
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => setFootnoteModalOpen(true)}
            active={false}
            title="각주 삽입"
          >
            각주[¹]
          </ToolbarBtn>

          <span className="w-px h-5 bg-wiki-border mx-1" />

          <ToolbarBtn
            onClick={handleImageClick}
            active={false}
            title="이미지 삽입"
          >
            {isUploading ? '⏳' : '🖼️'}
          </ToolbarBtn>

          <span className="w-px h-5 bg-wiki-border mx-1" />

          {[
            { color: '#e53e3e', label: '빨강' },
            { color: '#3182ce', label: '파랑' },
            { color: '#38a169', label: '초록' },
            { color: '#f59e0b', label: '주황' },
            { color: '#805ad5', label: '보라' },
          ].map(({ color, label }) => (
            <button
              key={color}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().setColor(color).run() }}
              title={`글자색: ${label}`}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                editor?.isActive('textStyle', { color }) ? 'border-wiki-text scale-110' : 'border-wiki-border/60 hover:border-wiki-text/60'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().unsetColor().run() }}
            title="글자색 초기화"
            className="w-5 h-5 rounded-full border-2 border-wiki-border/60 hover:border-wiki-text/60 bg-wiki-surface flex items-center justify-center text-[9px] text-wiki-text-muted transition-all"
          >
            ✕
          </button>

          <span className="w-px h-5 bg-wiki-border mx-1" />

          <ToolbarBtn
            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            active={false}
            title="표 삽입"
          >
            표
          </ToolbarBtn>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />
        </div>

        {/* 표 편집 툴바 - 커서가 표 안에 있을 때만 표시 */}
        {inTable && (
          <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap items-center gap-0.5 px-3 py-1.5 border-b border-wiki-border bg-wiki-surface text-xs">
            <span className="text-wiki-text-muted mr-0.5">행</span>
            <ToolbarBtn onClick={() => editor?.chain().focus().addRowBefore().run()} title="위에 행 추가">↑+</ToolbarBtn>
            <ToolbarBtn onClick={() => editor?.chain().focus().addRowAfter().run()} title="아래에 행 추가">↓+</ToolbarBtn>
            <ToolbarBtn onClick={() => editor?.chain().focus().deleteRow().run()} title="행 삭제">×</ToolbarBtn>
            <span className="w-px h-4 bg-wiki-border mx-1" />
            <span className="text-wiki-text-muted mr-0.5">열</span>
            <ToolbarBtn onClick={() => editor?.chain().focus().addColumnBefore().run()} title="왼쪽에 열 추가">←+</ToolbarBtn>
            <ToolbarBtn onClick={() => editor?.chain().focus().addColumnAfter().run()} title="오른쪽에 열 추가">+→</ToolbarBtn>
            <ToolbarBtn onClick={() => editor?.chain().focus().deleteColumn().run()} title="열 삭제">×</ToolbarBtn>
          </div>
        )}
        </div>

        {/* 에디터 본문 */}
        <div className="
          text-wiki-text
          [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:mb-3
          [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-2
          [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2
          [&_.ProseMirror_p]:my-2 [&_.ProseMirror_p]:leading-relaxed
          [&_.ProseMirror_a]:text-wiki-accent [&_.ProseMirror_a]:underline
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:my-2
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:my-2
          [&_.ProseMirror_li]:my-1
          [&_.ProseMirror_code]:bg-wiki-border/30 [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm [&_.ProseMirror_code]:font-mono
          [&_.ProseMirror_pre]:bg-wiki-bg [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-wiki-border [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:my-3 [&_.ProseMirror_pre]:overflow-x-auto
          [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0
          [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-wiki-accent [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-wiki-text-muted [&_.ProseMirror_blockquote]:my-3
          [&_.ProseMirror_hr]:border-wiki-border [&_.ProseMirror_hr]:my-4
          [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded [&_.ProseMirror_img]:my-3
          [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:my-3
          [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-wiki-border [&_.ProseMirror_th]:bg-wiki-border/20 [&_.ProseMirror_th]:px-3 [&_.ProseMirror_th]:py-2 [&_.ProseMirror_th]:text-left [&_.ProseMirror_th]:font-semibold
          [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-wiki-border [&_.ProseMirror_td]:px-3 [&_.ProseMirror_td]:py-2
          [&_.selectedCell]:bg-wiki-accent/10
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-wiki-text-muted [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
        ">
          <EditorContent editor={editor} />
        </div>
      </div>

      <FootnoteInsertModal
        open={footnoteModalOpen}
        onClose={() => setFootnoteModalOpen(false)}
        onConfirm={handleFootnoteConfirm}
      />
      {footnotePopover && (
        <FootnoteRefPopover
          key={footnotePopover.label}
          content={footnotePopover.content}
          top={footnotePopover.top}
          left={footnotePopover.left}
          onClose={() => setFootnotePopover(null)}
          onSave={(newContent) => {
            handleFootnoteEditSave(footnotePopover.label, newContent)
            setFootnotePopover(null)
          }}
          onDeleteRequest={() => {
            setFootnoteDeleteConfirm({ label: footnotePopover.label, content: footnotePopover.content })
            setFootnotePopover(null)
          }}
        />
      )}
      <FootnoteDeleteConfirmModal
        open={!!footnoteDeleteConfirm}
        content={footnoteDeleteConfirm?.content ?? ''}
        onCancel={() => setFootnoteDeleteConfirm(null)}
        onConfirm={() => {
          if (footnoteDeleteConfirm) deleteFootnote(footnoteDeleteConfirm.label)
          setFootnoteDeleteConfirm(null)
        }}
      />
      <LinkInsertModal
        open={linkModalOpen}
        initialHref={currentLinkHref}
        initialText={currentLinkText}
        onClose={() => setLinkModalOpen(false)}
        onConfirm={handleLinkConfirm}
        onRemove={handleLinkRemove}
      />

      {/* 편집 요약 */}
      <div className="mt-3">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={200}
          placeholder="편집 요약 (선택) — 무엇을 수정했나요?"
          className="w-full px-3 py-2 border border-wiki-border rounded text-sm bg-wiki-surface text-wiki-text placeholder:text-wiki-text-muted outline-none focus:border-wiki-accent transition-colors"
        />
      </div>

      {/* 하단 버튼 */}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || isUploading}
          className="px-5 py-2 bg-wiki-accent text-white rounded text-sm font-medium hover:bg-wiki-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '저장 중…' : '저장'}
        </button>
        <button
          type="button"
          onClick={async () => { await releaseLock(slug); router.push(slugToHref(slug)) }}
          disabled={isPending || isUploading}
          className="px-5 py-2 border border-wiki-border text-wiki-text rounded text-sm hover:border-wiki-accent hover:text-wiki-accent transition-colors disabled:opacity-50"
        >
          취소
        </button>
        {isUploading && <p className="text-sm text-wiki-text-muted">이미지 업로드 중…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}
