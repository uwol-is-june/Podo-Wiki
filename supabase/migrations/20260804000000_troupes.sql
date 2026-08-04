-- 공연단체 목록 (TASK-075)
-- 기존에는 src/data/troupes.ts + mobile/src/data/troupes.ts 에 하드코딩돼 있어서
-- 단체 하나 추가하려면 코드 수정 + 웹 배포 + 앱 스토어 심사가 필요했다.
-- 이 테이블로 옮기면서 /admin 에서 등록하면 웹·앱 양쪽에 바로 반영되게 한다.

CREATE TABLE troupes (
  -- slug 는 위키 문서 주소(/w/[slug])이자 PK. 단체 이름을 그대로 쓴다 (한글 slug — 기존 광운극예술연구회 방식 유지)
  slug       TEXT        PRIMARY KEY,
  name       TEXT        NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  -- logo_url 은 두 형태를 모두 허용한다:
  --   1) 절대 URL   — Storage(troupe-logos 버킷)에 업로드한 로고. 신규 등록은 전부 이쪽
  --   2) '/logos/…' — 저장소 public/ 에 커밋돼 있던 기존 로고 (아래 시드)
  -- NULL 이면 웹·앱 모두 이니셜 플레이스홀더로 렌더한다 (썸네일은 선택 입력)
  logo_url   TEXT,
  sort_order INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- documents(slug) 로의 FK 는 일부러 걸지 않았다.
-- 단체 등록 시 빈 문서를 같이 만들지만, 나중에 그 문서가 삭제되더라도
-- 홈 화면에서 단체가 통째로 사라지는 것보다 "문서 없음" 화면으로 가는 편이 덜 놀랍다.

ALTER TABLE troupes ENABLE ROW LEVEL SECURITY;

-- 홈 화면(웹 anon SSR · 앱 anon 클라이언트)에서 읽어야 하므로 공개 SELECT.
CREATE POLICY "public_read_troupes"
  ON troupes FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT/UPDATE/DELETE 정책 없음 → 일반 사용자는 쓰기 불가.
-- admin 은 service_role(admin client)로 RLS 를 우회한다 (feature_requests·deletion_requests 와 동일 패턴).

CREATE INDEX idx_troupes_order ON troupes(sort_order, created_at);

-- ── 로고 업로드용 Storage 버킷 ────────────────────────────────────────
-- Vercel 런타임에서는 public/ 에 파일을 쓸 수 없어서 업로드 로고는 Storage 에 둔다.
-- public 버킷이라 조회는 공개 URL 로 바로 되고, 업로드는 service_role 만 수행한다.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'troupe-logos',
  'troupe-logos',
  true,
  2097152, -- 2MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- ── 기존 하드코딩 단체 이관 ──────────────────────────────────────────
-- 로고는 이미 public/logos/ 에 커밋돼 있으므로 경로를 그대로 옮긴다 (버킷 재업로드 불필요).
INSERT INTO troupes (slug, name, logo_url, sort_order)
VALUES ('광운극예술연구회', '광운극예술연구회', '/logos/광운극예술연구회.png', 0)
ON CONFLICT (slug) DO NOTHING;
