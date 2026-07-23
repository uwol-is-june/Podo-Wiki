-- 기능 추가 요청 (TASK-059)
-- 앱(더보기 탭)·웹(빠른 링크 모달)에서 비로그인 익명 제출, admin이 확인·삭제.
-- deletion_requests 와 동일한 "사용자 제출 → admin 검토·삭제" 패턴.

CREATE TABLE feature_requests (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  content    TEXT        NOT NULL CHECK (char_length(btrim(content)) BETWEEN 5 AND 2000),
  source     TEXT        NOT NULL DEFAULT 'web' CHECK (source IN ('app', 'web')),
  status     TEXT        NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- 누구나(비로그인 anon 포함) 요청 제출 가능. content 길이는 테이블 CHECK로 스팸/빈값 방지.
-- WITH CHECK (status = 'open') 로 임의 status 삽입 차단 (기본값도 'open').
CREATE POLICY "anyone_can_submit_feature_request"
  ON feature_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'open');

-- SELECT/DELETE 정책 없음 → 일반 사용자는 조회·삭제 불가.
-- admin은 service_role(admin client)로 RLS 우회하여 조회·삭제 (deletion_requests 동일).

CREATE INDEX idx_feature_requests_created_at ON feature_requests(created_at DESC);
