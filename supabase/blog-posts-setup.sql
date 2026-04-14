-- ── blog_posts 테이블 ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blog_posts (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  summary     TEXT,
  content     TEXT NOT NULL,         -- Markdown 원문
  content_html TEXT,                 -- 렌더링된 HTML (Python에서 변환 후 저장)
  tags        TEXT[] DEFAULT '{}',
  category    TEXT,
  status      TEXT NOT NULL DEFAULT 'published'
              CHECK (status IN ('draft', 'published')),
  source      TEXT NOT NULL DEFAULT 'auto'
              CHECK (source IN ('auto', 'manual')),
  topic_key   TEXT,                  -- 반복 방지용 토픽 식별자
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_blog_posts_status    ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category  ON blog_posts (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created   ON blog_posts (created_at DESC);

-- updated_at 자동 갱신 트리거
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 읽기 공개 허용
DROP POLICY IF EXISTS "Blog posts readable by all" ON blog_posts;
CREATE POLICY "Blog posts readable by all" ON blog_posts
  FOR SELECT USING (status = 'published');

-- 쓰기는 서비스 역할 키를 사용하는 서버사이드에서만
DROP POLICY IF EXISTS "Blog posts insert blocked" ON blog_posts;
DROP POLICY IF EXISTS "Blog posts update blocked" ON blog_posts;
DROP POLICY IF EXISTS "Blog posts delete blocked" ON blog_posts;
CREATE POLICY "Blog posts insert blocked" ON blog_posts FOR INSERT WITH CHECK (false);
CREATE POLICY "Blog posts update blocked" ON blog_posts FOR UPDATE USING (false);
CREATE POLICY "Blog posts delete blocked" ON blog_posts FOR DELETE USING (false);
