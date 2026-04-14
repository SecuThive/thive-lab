-- ── 쿠팡 파트너스 추천 상품 테이블 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT        NOT NULL,
  category        TEXT,                     -- 가전/IT, 생활용품, 주방, 뷰티, 스포츠, 아이디어, 유아, 식품
  description     TEXT,
  image_url       TEXT,
  affiliate_url   TEXT        NOT NULL,     -- 쿠팡 파트너스 링크
  original_price  INTEGER,                  -- 원 단위
  sale_price      INTEGER,
  discount_percent INTEGER,
  rating          NUMERIC(3,1),
  review_count    INTEGER     DEFAULT 0,
  is_featured     BOOLEAN     DEFAULT false,
  is_hot          BOOLEAN     DEFAULT false, -- 이번 주 HOT 배지
  tags            TEXT[]      DEFAULT '{}',
  status          TEXT        DEFAULT 'published',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- blog_posts 테이블에 파트너스 링크 + 상품 이미지 컬럼 추가
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS affiliate_url  TEXT,
  ADD COLUMN IF NOT EXISTS product_image TEXT;

-- 인덱스
CREATE INDEX IF NOT EXISTS products_category_idx   ON products (category);
CREATE INDEX IF NOT EXISTS products_featured_idx   ON products (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS products_status_idx     ON products (status);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at DESC);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON products FOR SELECT USING (status = 'published');

-- 샘플 데이터 (실제 쿠팡 파트너스 링크로 교체 필요)
INSERT INTO products (name, category, description, affiliate_url, original_price, sale_price, discount_percent, rating, review_count, is_featured, is_hot, tags)
VALUES
  ('로지텍 MX Master 3S 무선 마우스', '가전/IT', '조용한 클릭, 정밀한 추적, 7개 버튼. 재택근무 필수 마우스.', 'https://link.coupang.com/placeholder', 129000, 99000, 23, 4.8, 12400, true, true, ARRAY['마우스','로지텍','재택근무']),
  ('필립스 에어프라이어 HD9252', '주방', '3.2L 용량, 기름 없이 바삭하게. 다이어트 요리 필수템.', 'https://link.coupang.com/placeholder', 89000, 69000, 22, 4.7, 8900, true, false, ARRAY['에어프라이어','필립스','주방가전']),
  ('닥터자르트 세라마이딘 크림', '뷰티', '세라마이드 집중 보습. 건성 피부 구원자.', 'https://link.coupang.com/placeholder', 42000, 34000, 19, 4.9, 23100, false, true, ARRAY['세라마이딘','보습크림','닥터자르트']),
  ('다이슨 V12 무선청소기', '생활용품', '레이저 먼지 감지, 강력 흡입. 무선 청소기의 끝판왕.', 'https://link.coupang.com/placeholder', 899000, 769000, 14, 4.8, 5600, true, false, ARRAY['다이슨','청소기','무선']),
  ('나이키 에어줌 페가수스 41', '스포츠', '반응성 좋은 쿠셔닝, 일상+러닝 모두 OK.', 'https://link.coupang.com/placeholder', 139000, 109000, 22, 4.6, 7800, false, true, ARRAY['나이키','러닝화','페가수스']),
  ('아이코닉 자석 케이블 정리함', '아이디어', '케이블 5개 동시 정리. 책상 위 카오스 해결.', 'https://link.coupang.com/placeholder', 18000, 12000, 33, 4.5, 3400, false, false, ARRAY['케이블정리','아이디어상품','데스크셋업']);
