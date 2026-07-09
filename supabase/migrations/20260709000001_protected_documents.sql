-- 보호 문서 메커니즘: protected = true인 문서는 role='admin'만 편집/삭제 가능
-- 일반 회원은 열람만 가능 (SELECT 정책은 그대로 공개 유지)

ALTER TABLE documents
  ADD COLUMN protected BOOLEAN NOT NULL DEFAULT false;

-- 기존 approved 기반 쓰기 정책을 protected 조건 포함으로 교체
DROP POLICY IF EXISTS "documents_insert_approved" ON documents;
DROP POLICY IF EXISTS "documents_update_approved" ON documents;
DROP POLICY IF EXISTS "documents_delete_approved" ON documents;
DROP POLICY IF EXISTS "revisions_insert_approved" ON revisions;

CREATE POLICY "documents_insert_approved"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_approved() AND auth.uid() = author_id
    AND (NOT protected OR public.is_admin())
  );

CREATE POLICY "documents_update_approved"
  ON documents FOR UPDATE
  TO authenticated
  USING (public.is_approved() AND (NOT protected OR public.is_admin()))
  WITH CHECK (public.is_approved() AND (NOT protected OR public.is_admin()));

CREATE POLICY "documents_delete_approved"
  ON documents FOR DELETE
  TO authenticated
  USING (public.is_approved() AND (NOT protected OR public.is_admin()));

CREATE POLICY "revisions_insert_approved"
  ON revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_approved() AND auth.uid() = editor_id
    AND (
      public.is_admin()
      OR NOT EXISTS (
        SELECT 1 FROM documents d
        WHERE d.slug = document_slug AND d.protected
      )
    )
  );

-- 기존 시스템 문서를 보호 문서로 지정
UPDATE documents SET protected = true
WHERE slug IN ('포도위키:도움말', '포도상점');
