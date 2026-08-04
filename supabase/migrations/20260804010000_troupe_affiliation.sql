-- 단체 소속 (TASK-076)
-- 단체를 "소속 + 명칭" 두 줄로 표기하기 위한 컬럼.
--   예) 소속: 광운대학교 / 명칭: 광운극예술연구회
-- slug 는 여전히 명칭에서만 만든다 — 소속은 표시용 정보이고, 소속이 바뀌어도 문서 주소는 그대로여야 함.
-- 소속이 없는 단체(대학·회사에 속하지 않은 극단 등)도 있으므로 NULL 허용, 이때는 명칭 한 줄만 표기.

ALTER TABLE troupes
  ADD COLUMN affiliation TEXT CHECK (affiliation IS NULL OR char_length(btrim(affiliation)) BETWEEN 1 AND 60);

UPDATE troupes SET affiliation = '광운대학교' WHERE slug = '광운극예술연구회';
