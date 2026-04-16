-- ── search_keyword 자동 설정 트리거 ──────────────────────────────────────────
-- 상품 INSERT/UPDATE 시 search_keyword 가 NULL 이면 name 을 자동으로 복사

CREATE OR REPLACE FUNCTION set_search_keyword()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.search_keyword IS NULL OR NEW.search_keyword = '' THEN
    NEW.search_keyword := NEW.name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_search_keyword ON products;

CREATE TRIGGER trg_set_search_keyword
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_search_keyword();
