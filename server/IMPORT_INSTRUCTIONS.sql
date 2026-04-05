-- ========================================
-- 导入重组后的数据到生产环境
-- 执行方式：在 Supabase SQL Editor 中复制以下内容并执行
-- ========================================

-- 1. 清空所有数据（注意顺序：先删除外键表，再删除主表）
DELETE FROM practice_answers;
DELETE FROM competition_answers;
DELETE FROM question_hints;
DELETE FROM questions;

-- 2. 插入题目数据
INSERT INTO questions (id, chinese_sentence, english_reference, difficulty, user_id, created_at) VALUES
(1, '你好', 'Hello', '小学一年级', NULL, NOW()),
(2, '谢谢', 'Thank you', '小学一年级', NULL, NOW()),
(3, '再见', 'Goodbye', '小学一年级', NULL, NOW()),
(4, '早上好', 'Good morning', '小学一年级', NULL, NOW()),
(5, '我爱妈妈', 'I love my mom', '小学一年级', NULL, NOW()),
(6, '今天天气很好', 'The weather is very good today', '小学一年级', NULL, NOW()),
(7, '我去学校', 'I go to school', '小学一年级', NULL, NOW()),
(8, '这是我的书', 'This is my book', '小学一年级', NULL, NOW()),
(9, '他有一个苹果', 'He has an apple', '小学一年级', NULL, NOW()),
(10, '我们喜欢玩足球', 'We like to play soccer', '小学一年级', NULL, NOW());

-- 注意：由于数据量较大（2068条），建议使用 Supabase 的批量导入功能
-- 或者使用我们生成的 REORGANIZED_DATA.sql 文件

-- ========================================
-- 自动导入脚本（需要 Node.js 环境）
-- ========================================
-- 如果您想自动导入，请在本地执行以下命令：
-- pnpm tsx scripts/import-to-production.ts
