-- projects 테이블에 category 컬럼 추가
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT;

-- 기존 프로젝트에 카테고리 설정
UPDATE projects SET category = 'Pricing intelligence' WHERE name = 'Steam Scout';
UPDATE projects SET category = 'Hiring ops' WHERE name = 'Junior Jobs';
UPDATE projects SET category = 'Gov funding radar' WHERE name = 'Subsidy AI';
UPDATE projects SET category = 'Finance automation' WHERE name = 'Ledger Pulse';
UPDATE projects SET category = 'Ops telemetry' WHERE name = 'Signal Vault';
UPDATE projects SET category = 'Data automation' WHERE name = 'Relay Forms';
