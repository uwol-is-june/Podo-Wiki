-- profiles 테이블: 회원 정보 + 승인 상태
CREATE TABLE public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  organization TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 본인 프로필 조회
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 본인 프로필 insert (가입 시 1회)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE는 service_role만 가능 (기본 DENY → 관리자 승인/거부는 서버 측에서만)

-- approved 여부 체크 함수 (RLS 정책에서 사용)
CREATE OR REPLACE FUNCTION public.is_approved()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- documents/revisions 쓰기 정책을 approved 유저로 교체
DROP POLICY IF EXISTS "documents_insert_authenticated" ON documents;
DROP POLICY IF EXISTS "documents_update_authenticated" ON documents;
DROP POLICY IF EXISTS "documents_delete_authenticated" ON documents;
DROP POLICY IF EXISTS "revisions_insert_authenticated" ON revisions;

CREATE POLICY "documents_insert_approved"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (public.is_approved() AND auth.uid() = author_id);

CREATE POLICY "documents_update_approved"
  ON documents FOR UPDATE
  TO authenticated
  USING (public.is_approved())
  WITH CHECK (public.is_approved());

CREATE POLICY "documents_delete_approved"
  ON documents FOR DELETE
  TO authenticated
  USING (public.is_approved());

CREATE POLICY "revisions_insert_approved"
  ON revisions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_approved() AND auth.uid() = editor_id);
