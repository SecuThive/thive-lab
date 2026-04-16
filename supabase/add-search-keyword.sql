-- ── products 테이블에 search_keyword 컬럼 추가 ──────────────────────────────
-- 가격 갱신 시 쿠팡 API 재검색에 사용할 키워드
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS search_keyword TEXT,
  ADD COLUMN IF NOT EXISTS price_updated_at TIMESTAMPTZ;

-- 기존 샘플 데이터에 검색 키워드 반영
UPDATE products SET search_keyword = '로지텍 MX Master 3S'    WHERE name ILIKE '%MX Master 3S%';
UPDATE products SET search_keyword = '필립스 에어프라이어'      WHERE name ILIKE '%에어프라이어%';
UPDATE products SET search_keyword = '닥터자르트 세라마이딘'    WHERE name ILIKE '%세라마이딘%';
UPDATE products SET search_keyword = '다이슨 V12 무선청소기'    WHERE name ILIKE '%다이슨 V12%';
UPDATE products SET search_keyword = '나이키 에어줌 페가수스'   WHERE name ILIKE '%페가수스%';
UPDATE products SET search_keyword = '케이블 정리함'            WHERE name ILIKE '%케이블 정리%';
