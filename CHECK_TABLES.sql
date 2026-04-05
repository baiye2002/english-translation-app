-- 简单的表存在性检查
-- 在 Supabase SQL Editor 中执行

-- 只显示所有表名，不查询数据
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 查询 questions 表（如果存在）
SELECT 'questions count:', COUNT(*) FROM questions;
