-- 修复 competition_rooms 表的主键序列问题
-- 原因：序列的当前值小于表中实际的最大 ID，导致新插入时产生重复的主键

-- 方案 1：如果需要保留现有数据，重置序列
SELECT setval('competition_rooms_id_seq', (SELECT COALESCE(MAX(id), 0) FROM competition_rooms));

-- 方案 2：如果不需要现有数据，清空表并重置序列（取消下面两行的注释来执行）
-- TRUNCATE TABLE competition_players CASCADE;
-- TRUNCATE TABLE competition_rooms RESTART IDENTITY CASCADE;

-- 验证序列是否已修复
SELECT
  'competition_rooms_id_seq' as sequence_name,
  last_value,
  max_value,
  increment_by,
  (SELECT COALESCE(MAX(id), 0) FROM competition_rooms) as max_id_in_table
FROM competition_rooms_id_seq;
