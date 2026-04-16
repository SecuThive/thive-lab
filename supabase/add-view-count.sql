-- ── blog_posts 조회수 컬럼 추가 ─────────────────────────────
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- 인덱스 (인기순 정렬용)
CREATE INDEX IF NOT EXISTS idx_blog_posts_views
  ON blog_posts (view_count DESC);

-- ── 조회수 증가 RPC (SECURITY DEFINER → RLS 우회) ────────────
CREATE OR REPLACE FUNCTION increment_view_count(post_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE slug = post_slug
    AND status = 'published';
END;
$$;

-- anon / authenticated 역할에 실행 권한 부여
GRANT EXECUTE ON FUNCTION increment_view_count(TEXT) TO anon, authenticated;
