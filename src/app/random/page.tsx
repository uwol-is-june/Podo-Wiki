import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { slugToHref } from '@/lib/wiki/slug'

export const dynamic = 'force-dynamic'

export default async function RandomPage() {
  const supabase = await createClient()

  const { count } = await supabase
    .from('documents')
    .select('slug', { count: 'exact', head: true })

  if (!count || count === 0) {
    redirect('/')
  }

  const randomOffset = Math.floor(Math.random() * count)

  const { data } = await supabase
    .from('documents')
    .select('slug')
    .range(randomOffset, randomOffset)
    .single() as { data: { slug: string } | null }

  if (!data) {
    redirect('/')
  }

  redirect(slugToHref(data.slug))
}
