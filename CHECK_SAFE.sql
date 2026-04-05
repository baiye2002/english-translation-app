-- 安全的数据库检查脚本
-- 先检查哪些表存在，再查询数据
-- 在 Supabase SQL Editor 中执行

-- 1. 查看所有存在的表
SELECT '=== Existing Tables ===' AS section;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 2. 检查 questions 表
SELECT '\n=== questions Table ===' AS section;
SELECT COUNT(*) AS count FROM questions;

-- 3. 检查 question_hints 表（如果存在）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'question_hints') THEN
    RAISE NOTICE '=== question_hints Table ===';
    PERFORM dblink_connect('test_conn', 'dbname=' || current_database());
    PERFORM dblink_disconnect('test_conn');
  END IF;
END $$;
