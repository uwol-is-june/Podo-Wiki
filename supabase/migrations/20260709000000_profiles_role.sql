-- profiles에 role 컬럼 추가: 보호 문서(관리자 전용) 편집 권한의 기반
-- /admin 페이지 접근은 기존 passcode 방식 유지, role은 문서 편집 권한에만 사용

ALTER TABLE public.profiles
  ADD COLUMN role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'admin'));

-- admin 여부 체크 함수 (RLS 정책에서 사용, is_approved()와 동일 패턴)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
  );
$$ LANGUAGE sql SECURITY DEFINER;
