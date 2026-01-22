-- 중복 데이터 정리 스크립트

-- hero_stats 중복 제거 (display_order가 가장 작은 것만 유지)
DELETE FROM hero_stats a
USING hero_stats b
WHERE a.id > b.id
  AND a.label = b.label
  AND a.value = b.value;

-- pipeline 중복 제거
DELETE FROM pipeline a
USING pipeline b
WHERE a.id > b.id
  AND a.label = b.label
  AND a.status = b.status;

-- build_log 중복 제거
DELETE FROM build_log a
USING build_log b
WHERE a.id > b.id
  AND a.title = b.title
  AND a.date = b.date;

-- 확인: 남은 데이터 조회
SELECT 'hero_stats' as table_name, COUNT(*) as count FROM hero_stats
UNION ALL
SELECT 'pipeline', COUNT(*) FROM pipeline
UNION ALL
SELECT 'build_log', COUNT(*) FROM build_log;
