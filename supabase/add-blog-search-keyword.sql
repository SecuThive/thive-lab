-- blog_posts 테이블에 search_keyword 컬럼 추가
-- 자동 생성기가 어떤 키워드로 글을 작성했는지 기록 → 중복 발행 방지에 사용

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS search_keyword TEXT;

-- 기존 레코드: topic_key 에서 키워드 유추해 backfill (없으면 NULL 유지)
-- 신규 레코드부터는 blog_generator.py 에서 자동 저장
