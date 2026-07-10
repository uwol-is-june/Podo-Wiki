import { createClient } from '@supabase/supabase-js'

import type { Database } from './supabase/types'

// 읽기 전용 v1: 인증 없이 anon key로 공개 SELECT만 수행한다.
// (documents/revisions RLS가 public SELECT 허용 — supabase/migrations 참조)
export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
)
