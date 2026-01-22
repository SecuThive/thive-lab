-- Stats, Pipeline, Build Log 테이블 생성

-- hero_stats 테이블 - 홈페이지 통계
CREATE TABLE IF NOT EXISTS hero_stats (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- pipeline 테이블 - 현재 진행중인 프로젝트
CREATE TABLE IF NOT EXISTS pipeline (
  id BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('Live', 'Beta', 'Soon')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- build_log 테이블 - 최근 업데이트 로그
CREATE TABLE IF NOT EXISTS build_log (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 트리거 생성 (기존 것이 있으면 먼저 삭제)
DROP TRIGGER IF EXISTS update_hero_stats_updated_at ON hero_stats;
CREATE TRIGGER update_hero_stats_updated_at
BEFORE UPDATE ON hero_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pipeline_updated_at ON pipeline;
CREATE TRIGGER update_pipeline_updated_at
BEFORE UPDATE ON pipeline
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_build_log_updated_at ON build_log;
CREATE TRIGGER update_build_log_updated_at
BEFORE UPDATE ON build_log
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터 삽입 (중복 방지)
INSERT INTO hero_stats (label, value, display_order) VALUES
('Automations Deployed', '38+', 1),
('Average Launch Time', '9 days', 2),
('Teams Supported', '24', 3)
ON CONFLICT (label) DO NOTHING;

INSERT INTO pipeline (label, status, display_order) VALUES
('Steam Scout API', 'Live', 1),
('Junior Jobs EU', 'Beta', 2),
('Subsidy AI alerts', 'Soon', 3)
ON CONFLICT (label) DO NOTHING;

INSERT INTO build_log (title, date, display_order) VALUES
('Steam Scout shipped alert webhooks', 'Jan 2026 / Release', 1),
('Junior Jobs talent graph refresh', 'Dec 2025 / Update', 2),
('Subsidy AI grants ingestion', 'Nov 2025 / Research', 3)
ON CONFLICT (title) DO NOTHING;

-- RLS 활성화
ALTER TABLE hero_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_log ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Enable read access for all users" ON hero_stats;
DROP POLICY IF EXISTS "Enable read access for all users" ON pipeline;
DROP POLICY IF EXISTS "Enable read access for all users" ON build_log;

DROP POLICY IF EXISTS "Disable insert for all users" ON hero_stats;
DROP POLICY IF EXISTS "Disable update for all users" ON hero_stats;
DROP POLICY IF EXISTS "Disable delete for all users" ON hero_stats;

DROP POLICY IF EXISTS "Disable insert for all users" ON pipeline;
DROP POLICY IF EXISTS "Disable update for all users" ON pipeline;
DROP POLICY IF EXISTS "Disable delete for all users" ON pipeline;

DROP POLICY IF EXISTS "Disable insert for all users" ON build_log;
DROP POLICY IF EXISTS "Disable update for all users" ON build_log;
DROP POLICY IF EXISTS "Disable delete for all users" ON build_log;

-- 읽기 정책 (모든 사용자)
CREATE POLICY "Enable read access for all users" ON hero_stats FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON pipeline FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON build_log FOR SELECT USING (true);

-- 쓰기 정책 (비활성화 - 관리자 API에서만 수정)
CREATE POLICY "Disable insert for all users" ON hero_stats FOR INSERT WITH CHECK (false);
CREATE POLICY "Disable update for all users" ON hero_stats FOR UPDATE USING (false);
CREATE POLICY "Disable delete for all users" ON hero_stats FOR DELETE USING (false);

CREATE POLICY "Disable insert for all users" ON pipeline FOR INSERT WITH CHECK (false);
CREATE POLICY "Disable update for all users" ON pipeline FOR UPDATE USING (false);
CREATE POLICY "Disable delete for all users" ON pipeline FOR DELETE USING (false);

CREATE POLICY "Disable insert for all users" ON build_log FOR INSERT WITH CHECK (false);
CREATE POLICY "Disable update for all users" ON build_log FOR UPDATE USING (false);
CREATE POLICY "Disable delete for all users" ON build_log FOR DELETE USING (false);
