import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
// 읽기 화면(MarkdownContent)과 동일한 CJK 강조 규칙 유지
import remarkCjkFriendly from 'remark-cjk-friendly'
import remarkCjkFriendlyGfmStrikethrough from 'remark-cjk-friendly-gfm-strikethrough'
import rehypeRaw from 'rehype-raw'
import { parseFaqItems } from '@/lib/wiki/faq'
import { slugToEditHref } from '@/lib/wiki/slug'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '자주 묻는 질문 — 포도위키',
}

const FAQ_SLUG = '포도위키:FAQ'

const remarkPlugins = [remarkGfm, remarkCjkFriendly, remarkCjkFriendlyGfmStrikethrough]

const ANSWER_PROSE = `text-sm text-wiki-text leading-relaxed
  [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0
  [&_a]:text-wiki-accent [&_a:hover]:underline
  [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1
  [&_strong]:font-semibold
  [&_code]:bg-wiki-border/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono`

export default async function FaqPage() {
  const supabase = await createClient()
  const [{ data: doc }, { data: { user } }] = await Promise.all([
    supabase.from('documents').select('content').eq('slug', FAQ_SLUG).maybeSingle(),
    supabase.auth.getUser(),
  ])

  let isAdminUser = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('status, role').eq('id', user.id).single()
    isAdminUser = profile?.status === 'approved' && profile?.role === 'admin'
  }

  const items = doc?.content ? parseFaqItems(doc.content) : []

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-wiki-text">자주 묻는 질문</h1>
      <p className="text-sm text-wiki-text-muted mt-2 mb-8">
        포도위키 이용 중 궁금한 점을 모았습니다. 질문을 누르면 답변을 접거나 펼 수 있어요.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-wiki-text-muted py-12 text-center">
          아직 등록된 질문이 없습니다.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <details
              key={item.id}
              id={item.id}
              open
              className="group bg-wiki-surface border border-wiki-border rounded-lg scroll-mt-20"
            >
              <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                <span className="text-wiki-accent font-bold shrink-0">Q.</span>
                <span className="text-sm font-medium text-wiki-text flex-1">{item.question}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-wiki-text-muted transition-transform group-open:rotate-180"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className={`px-5 pb-4 pt-3 border-t border-wiki-border/50 ${ANSWER_PROSE}`}>
                <ReactMarkdown remarkPlugins={remarkPlugins} rehypePlugins={[rehypeRaw]}>
                  {item.answer}
                </ReactMarkdown>
              </div>
            </details>
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-center">
        {isAdminUser ? (
          <Link
            href={slugToEditHref(FAQ_SLUG)}
            className="px-4 py-2 border border-wiki-border rounded text-sm text-wiki-text hover:border-wiki-accent hover:text-wiki-accent transition-colors"
          >
            FAQ 문서 수정
          </Link>
        ) : (
          <p className="text-xs text-wiki-text-muted">더 궁금한 점은 관리자에게 문의해 주세요.</p>
        )}
      </div>
    </div>
  )
}
