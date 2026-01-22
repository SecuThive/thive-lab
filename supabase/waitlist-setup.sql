-- Waitlist 테이블 생성
CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Focus areas 테이블 생성
CREATE TABLE IF NOT EXISTS focus_areas (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Focus areas 업데이트 트리거
DROP TRIGGER IF EXISTS update_focus_areas_updated_at ON focus_areas;
CREATE TRIGGER update_focus_areas_updated_at
BEFORE UPDATE ON focus_areas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 초기 Focus areas 데이터 (이미 존재하면 스킵)
INSERT INTO focus_areas (title, display_order) VALUES
('Pricing intelligence', 1),
('Hiring ops', 2),
('Finance automation', 3),
('Gov funding radar', 4),
('Community data', 5)
ON CONFLICT DO NOTHING;

-- RLS 활성화
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_areas ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Enable insert for all users" ON waitlist;
DROP POLICY IF EXISTS "Disable select for all users" ON waitlist;
DROP POLICY IF EXISTS "Enable read access for all users" ON focus_areas;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON focus_areas;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON focus_areas;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON focus_areas;

-- Waitlist 정책: 모든 사용자가 추가 가능, 읽기는 불가
CREATE POLICY "Enable insert for all users" ON waitlist
FOR INSERT WITH CHECK (true);

CREATE POLICY "Disable select for all users" ON waitlist
FOR SELECT USING (false);

-- Focus areas 정책: 모든 사용자가 활성화된 것만 읽기 가능
CREATE POLICY "Enable read access for all users" ON focus_areas
FOR SELECT USING (is_active = true);

CREATE POLICY "Enable insert for authenticated users only" ON focus_areas
FOR INSERT WITH CHECK (false);

CREATE POLICY "Enable update for authenticated users only" ON focus_areas
FOR UPDATE USING (false);

CREATE POLICY "Enable delete for authenticated users only" ON focus_areas
FOR DELETE USING (false);
