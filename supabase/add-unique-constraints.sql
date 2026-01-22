-- 중복 방지를 위한 UNIQUE constraint 추가

-- hero_stats: label이 고유해야 함
ALTER TABLE hero_stats 
ADD CONSTRAINT hero_stats_label_unique UNIQUE (label);

-- pipeline: label이 고유해야 함
ALTER TABLE pipeline 
ADD CONSTRAINT pipeline_label_unique UNIQUE (label);

-- build_log: title이 고유해야 함
ALTER TABLE build_log 
ADD CONSTRAINT build_log_title_unique UNIQUE (title);
