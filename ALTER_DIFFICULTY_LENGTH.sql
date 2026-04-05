-- 修改所有表的 difficulty 字段长度
-- 从 VARCHAR(20) 改为 VARCHAR(50)
-- 在 Supabase SQL Editor 中执行

-- 1. 修改 question_hints 表
ALTER TABLE question_hints ALTER COLUMN difficulty TYPE VARCHAR(50);

-- 2. 修改 practice_sessions 表
ALTER TABLE practice_sessions ALTER COLUMN difficulty TYPE VARCHAR(50);

-- 3. 修改 competition_players 表
ALTER TABLE competition_players ALTER COLUMN difficulty TYPE VARCHAR(50);

-- 验证修改结果
SELECT
  'After modification:' AS info;
SELECT
  table_name,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'difficulty'
ORDER BY table_name;
