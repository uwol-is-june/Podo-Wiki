'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import { getMarkRange } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useRef, useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import TurndownService from 'turndown'
import { saveDocument } from '@/lib/wiki/actions'
import { slugToHref } from '@/lib/wiki/slug'
import { createClient } from '@/lib/supabase/client'
import LinkInsertModal from './LinkInsertModal'

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
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
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [currentLinkHref, setCurrentLinkHref] = useState('')
  const [currentLinkText, setCurrentLinkText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: false }),
      Image.configure({ inline: false, resize: { enabled: true, alwaysPreserveAspectRatio: true, minWidth: 50 } }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[400px] p-5',
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
      const result = await saveDocument(slug, title.trim(), markdown)
      if ('error' in result) {
        setError(result.error)
      } else {
        router.push(slugToHref(slug))
      }
    })
  }

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

      <div className="bg-wiki-surface border border-wiki-border rounded-lg overflow-hidden">
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
        <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-wiki-border bg-wiki-bg/50">
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

          <span className="w-px h-5 bg-wiki-border mx-1" />

          <ToolbarBtn
            onClick={handleImageClick}
            active={false}
            title="이미지 삽입"
          >
            {isUploading ? '⏳' : '🖼️'}
          </ToolbarBtn>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageFile}
          />
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
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-wiki-text-muted [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
        ">
          <EditorContent editor={editor} />
        </div>
      </div>

      <LinkInsertModal
        open={linkModalOpen}
        initialHref={currentLinkHref}
        initialText={currentLinkText}
        onClose={() => setLinkModalOpen(false)}
        onConfirm={handleLinkConfirm}
        onRemove={handleLinkRemove}
      />

      {/* 하단 버튼 */}
      <div className="mt-4 flex items-center gap-3">
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
          onClick={() => router.push(slugToHref(slug))}
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
