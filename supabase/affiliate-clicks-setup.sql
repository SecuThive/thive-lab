-- ── affiliate_click_logs 테이블 ──────────────────────────────────
-- 쿠팡 파트너스 제휴 링크 클릭 이벤트 저장 (카테고리별 성과 분석용)

CREATE TABLE IF NOT EXISTS affiliate_click_logs (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT        NOT NULL,
  category    TEXT,
  position    TEXT,       -- 'top' | 'bottom' | 'sticky'
  clicked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_click_logs_slug       ON affiliate_click_logs (slug);
CREATE INDEX IF NOT EXISTS idx_click_logs_category   ON affiliate_click_logs (category);
CREATE INDEX IF NOT EXISTS idx_click_logs_clicked_at ON affiliate_click_logs (clicked_at DESC);

-- RLS: 읽기는 모두 허용 (admin 대시보드 조회용), 쓰기는 anon 허용
ALTER TABLE affiliate_click_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "click_logs_read_all"
  ON affiliate_click_logs FOR SELECT
  USING (true);

-- ── RPC: 클릭 로그 삽입 (SECURITY DEFINER → RLS 우회) ────────────
CREATE OR REPLACE FUNCTION log_affiliate_click(
  p_slug     TEXT,
  p_category TEXT DEFAULT NULL,
  p_position TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO affiliate_click_logs (slug, category, position)
  VALUES (p_slug, p_category, p_position);
END;
$$;

GRANT EXECUTE ON FUNCTION log_affiliate_click(TEXT, TEXT, TEXT) TO anon, authenticated;
