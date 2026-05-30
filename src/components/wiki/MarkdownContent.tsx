'use client'

import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { slugify } from '@/lib/wiki/headings'

function headingId(children: React.ReactNode): string {
  const text = (function extract(node: React.ReactNode): string {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.map(extract).join('')
    if (node && typeof node === 'object' && 'props' in node)
      return extract((node as React.ReactElement<{ children?: React.ReactNode }>).props.children)
    return ''
  })(children)
  return slugify(text)
}

function H1({ children, ...props }: ComponentPropsWithoutRef<'h1'>) {
  return <h1 id={headingId(children)} {...props}>{children}</h1>
}
function H2({ children, ...props }: ComponentPropsWithoutRef<'h2'>) {
  return <h2 id={headingId(children)} {...props}>{children}</h2>
}
function H3({ children, ...props }: ComponentPropsWithoutRef<'h3'>) {
  return <h3 id={headingId(children)} {...props}>{children}</h3>
}

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose max-w-none text-wiki-text
      [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:border-b [&_h1]:border-wiki-border [&_h1]:pb-2
      [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-wiki-border/50 [&_h2]:pb-1
      [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
      [&_p]:my-3 [&_p]:leading-relaxed
      [&_a]:text-wiki-accent [&_a]:hover:underline
      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3
      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3
      [&_li]:my-1
      [&_code]:bg-wiki-border/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
      [&_pre]:bg-wiki-surface [&_pre]:border [&_pre]:border-wiki-border [&_pre]:rounded [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4
      [&_pre_code]:bg-transparent [&_pre_code]:p-0
      [&_blockquote]:border-l-4 [&_blockquote]:border-wiki-accent [&_blockquote]:pl-4 [&_blockquote]:text-wiki-text-muted [&_blockquote]:my-4
      [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
      [&_th]:border [&_th]:border-wiki-border [&_th]:bg-wiki-border/20 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
      [&_td]:border [&_td]:border-wiki-border [&_td]:px-3 [&_td]:py-2
      [&_hr]:border-wiki-border [&_hr]:my-6
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ h1: H1, h2: H2, h3: H3 }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
