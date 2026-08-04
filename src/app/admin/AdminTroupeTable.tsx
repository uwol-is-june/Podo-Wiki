'use client'

import { useActionState, useRef, useTransition } from 'react'
import Image from 'next/image'
import { createTroupe, deleteTroupe, type AdminActionState } from '@/lib/admin/actions'
import type { Troupe } from '@/lib/supabase/types'
import { slugToHref } from '@/lib/wiki/slug'

type Props = { troupes: Troupe[] }

const initialState: AdminActionState = { error: '' }

export default function AdminTroupeTable({ troupes }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, isPending] = useActionState(
    async (prev: AdminActionState, formData: FormData) => {
      const result = await createTroupe(prev, formData)
      if (result.success) formRef.current?.reset()
      return result
    },
    initialState
  )

  return (
    <div className="flex flex-col gap-6">
      <form ref={formRef} action={formAction} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="troupe-name" className="text-sm font-medium text-wiki-text">
            단체 이름
          </label>
          <input
            id="troupe-name"
            name="name"
            type="text"
            required
            disabled={isPending}
            maxLength={60}
            placeholder="예) 광운극예술연구회"
            className="h-10 px-3 rounded border border-wiki-border bg-wiki-bg text-wiki-text placeholder:text-wiki-text-muted focus:outline-none focus:border-wiki-accent transition-colors text-sm"
          />
          <p className="text-xs text-wiki-text-muted">
            입력한 이름이 그대로 문서 주소가 되고, 제목만 있는 빈 문서가 함께 만들어집니다.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="troupe-logo" className="text-sm font-medium text-wiki-text">
            썸네일 <span className="text-wiki-text-muted font-normal">(선택 · 2MB 이하)</span>
          </label>
          <input
            id="troupe-logo"
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            disabled={isPending}
            className="text-sm text-wiki-text file:mr-3 file:px-3 file:py-1.5 file:rounded file:border-0 file:bg-wiki-border file:text-wiki-text file:text-xs file:cursor-pointer"
          />
          <p className="text-xs text-wiki-text-muted">
            올리지 않으면 단체 이름 첫 글자가 대신 표시됩니다.
          </p>
        </div>

        {state.error && (
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="text-sm text-wiki-accent-text bg-wiki-accent/10 px-3 py-2 rounded">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="h-10 self-start px-5 bg-wiki-accent text-wiki-on-accent rounded text-sm font-medium hover:bg-wiki-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isPending ? '등록 중…' : '단체 등록'}
        </button>
      </form>

      <div className="border-t border-wiki-border pt-4">
        {troupes.length === 0 ? (
          <p className="text-wiki-text-muted text-sm py-8 text-center">등록된 단체가 없습니다.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-wiki-border text-wiki-text-muted text-left">
                <th className="py-3 pr-4 font-medium">썸네일</th>
                <th className="py-3 pr-4 font-medium">단체</th>
                <th className="py-3 font-medium">처리</th>
              </tr>
            </thead>
            <tbody>
              {troupes.map((troupe) => (
                <TroupeRow key={troupe.slug} troupe={troupe} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function TroupeRow({ troupe }: { troupe: Troupe }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (!confirm(`${troupe.name} 단체를 목록에서 제거할까요?\n위키 문서는 그대로 남습니다.`)) return
    startTransition(async () => {
      await deleteTroupe(troupe.slug)
    })
  }

  return (
    <tr className="border-b border-wiki-border last:border-0">
      <td className="py-3 pr-4">
        {troupe.logo_url ? (
          <Image
            src={troupe.logo_url}
            alt={troupe.name}
            width={40}
            height={40}
            className="rounded object-cover w-10 h-10"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-wiki-accent/10 flex items-center justify-center text-wiki-accent-text font-bold">
            {troupe.name[0]}
          </div>
        )}
      </td>
      <td className="py-3 pr-4">
        <a href={slugToHref(troupe.slug)} className="text-wiki-accent-text hover:underline">
          {troupe.name}
        </a>
      </td>
      <td className="py-3">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          제거
        </button>
      </td>
    </tr>
  )
}
