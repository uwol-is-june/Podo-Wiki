CREATE TABLE deletion_requests (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_slug TEXT        NOT NULL REFERENCES documents(slug) ON DELETE CASCADE,
  requester_id  UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason        TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at   TIMESTAMPTZ
);

ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- 승인된 사용자만 삭제 신청 가능
CREATE POLICY "approved_users_can_request_deletion"
  ON deletion_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    requester_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND status = 'approved')
  );

-- 자신의 신청만 조회 가능 (관리자는 admin client로 RLS 우회)
CREATE POLICY "users_view_own_deletion_requests"
  ON deletion_requests FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid());

CREATE INDEX idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX idx_deletion_requests_document_slug ON deletion_requests(document_slug);
