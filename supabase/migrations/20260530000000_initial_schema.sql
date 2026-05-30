-- documents 테이블: 위키 문서
CREATE TABLE IF NOT EXISTS documents (
  slug        TEXT        PRIMARY KEY,
  title       TEXT        NOT NULL,
  content     TEXT        NOT NULL DEFAULT '',
  author_id   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- revisions 테이블: 문서 수정 이력
CREATE TABLE IF NOT EXISTS revisions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_slug   TEXT        NOT NULL REFERENCES documents(slug) ON DELETE CASCADE,
  content         TEXT        NOT NULL DEFAULT '',
  editor_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  edited_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS 활성화
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;

-- documents RLS 정책
CREATE POLICY "documents_select_public"
  ON documents FOR SELECT
  USING (true);

CREATE POLICY "documents_insert_authenticated"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "documents_update_authenticated"
  ON documents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "documents_delete_authenticated"
  ON documents FOR DELETE
  TO authenticated
  USING (true);

-- revisions RLS 정책
CREATE POLICY "revisions_select_public"
  ON revisions FOR SELECT
  USING (true);

CREATE POLICY "revisions_insert_authenticated"
  ON revisions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = editor_id);

-- 인덱스
CREATE INDEX idx_revisions_document_slug ON revisions(document_slug);
CREATE INDEX idx_revisions_edited_at ON revisions(edited_at DESC);
