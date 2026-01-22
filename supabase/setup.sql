-- Supabase 프로젝트 테이블 생성 SQL

-- projects 테이블 생성
CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Live', 'Beta', 'Coming Soon')),
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  layout TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 업데이트 시간 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터 삽입
INSERT INTO projects (name, status, description, link, icon_name, layout) VALUES
('Steam Scout', 'Live', 'Price intelligence for Steam hardware with archived drop history.', 'https://steam.thivelab.com', 'Radar', 'sm:col-span-3 sm:row-span-2'),
('Junior Jobs', 'Beta', 'Signal-based job board for emerging talent with daily scrapes and filters.', '#', 'BriefcaseBusiness', 'sm:col-span-3'),
('Subsidy AI', 'Coming Soon', 'Gov incentives radar tuned to your stack, geography, and hiring plan.', '#', 'Bot', 'sm:col-span-2'),
('Ledger Pulse', 'Live', 'Finance cockpit to monitor MRR, burn, and cash runway in a single view.', 'https://finance.thivelab.com', 'WalletMinimal', 'sm:col-span-2'),
('Signal Vault', 'Beta', 'Ops telemetry overlays that merge product analytics, support, and alerting.', 'https://ops.thivelab.com', 'Database', 'sm:col-span-4'),
('Relay Forms', 'Coming Soon', 'Adaptive intake forms that sync structured data into your ops stack automatically.', '#', 'Cpu', 'sm:col-span-2');

-- Row Level Security (RLS) 활성화
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 생성
CREATE POLICY "Enable read access for all users" ON projects
FOR SELECT USING (true);

-- 인증된 사용자만 삽입/업데이트/삭제 가능 (관리자 전용)
-- 실제로는 서비스 역할 키를 사용하여 서버 측에서만 수정하도록 구현
CREATE POLICY "Enable insert for authenticated users only" ON projects
FOR INSERT WITH CHECK (false);

CREATE POLICY "Enable update for authenticated users only" ON projects
FOR UPDATE USING (false);

CREATE POLICY "Enable delete for authenticated users only" ON projects
FOR DELETE USING (false);
