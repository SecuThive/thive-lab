-- ── 문의 메시지 테이블 ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL,
  type       TEXT        NOT NULL DEFAULT '기타',  -- 상품추천요청 | 제휴/협업 | 버그신고 | 기타
  message    TEXT        NOT NULL,
  is_read    BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_is_read_idx    ON contact_messages (is_read) WHERE is_read = false;

-- RLS: 외부에서 INSERT 만 허용 (anon key로 제출 가능), SELECT 는 service role 만
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_insert" ON contact_messages FOR INSERT WITH CHECK (true);
