import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// 반드시 서버 사이드(Server Action, Route Handler)에서만 import
// 'use client' 파일에서 import 금지 — service_role key 노출 위험
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
