-- 편집 잠금 테이블: 동시 편집 방지
CREATE TABLE IF NOT EXISTS edit_locks (
  document_slug  TEXT        PRIMARY KEY REFERENCES documents(slug) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  acquired_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at     TIMESTAMPTZ NOT NULL DEFAULT now() + interval '30 minutes'
);

ALTER TABLE edit_locks ENABLE ROW LEVEL SECURITY;

-- 누구나 락 상태 조회 가능 (편집 페이지에서 확인)
CREATE POLICY "edit_locks_select_public"
  ON edit_locks FOR SELECT USING (true);

-- 본인 user_id로만 삽입 가능
CREATE POLICY "edit_locks_insert_authenticated"
  ON edit_locks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 본인 락이거나 이미 만료된 락이면 덮어쓰기 가능
CREATE POLICY "edit_locks_update_authenticated"
  ON edit_locks FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR expires_at < now())
  WITH CHECK (auth.uid() = user_id);

-- 본인 락이거나 만료된 락 삭제 가능
CREATE POLICY "edit_locks_delete_authenticated"
  ON edit_locks FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR expires_at < now());
