-- 检查 question_hints 表数据
-- 在 Supabase SQL Editor 中执行

-- 1. 检查 question_hints 表是否存在
SELECT 'Tables check:' AS info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'question_hints';

-- 2. 检查 question_hints 表有多少条记录
SELECT '\nRecord count:' AS info;
SELECT COUNT(*) AS count FROM question_hints;

-- 3. 查看前 3 条提示数据
SELECT '\nSample data (first 3):' AS info;
SELECT question_id, difficulty FROM question_hints LIMIT 3;
