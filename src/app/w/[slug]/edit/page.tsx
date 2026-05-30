import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { marked } from 'marked'
import type { Metadata } from 'next'
import type { Document } from '@/lib/supabase/types'
import WikiEditor from '@/components/wiki/WikiEditor'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: `${decodeURIComponent(slug)} 편집 — 포도위키` }
}

export default async function EditPage({ params }: Props) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=${encodeURIComponent(`/w/${encodeURIComponent(decodedSlug)}/edit`)}`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('status')
    .eq('id', user.id)
    .single()
  if (!profile || profile.status !== 'approved') redirect('/pending')

  const { data: document } = await supabase
    .from('documents')
    .select('slug, title, content, author_id, created_at, updated_at')
    .eq('slug', decodedSlug)
    .single() as { data: Document | null }

  const initialHtml = document?.content
    ? (marked.parse(document.content) as string)
    : ''

  return (
    <WikiEditor
      slug={decodedSlug}
      initialTitle={document?.title ?? decodedSlug}
      initialHtml={initialHtml}
    />
  )
}
