-- 简单的数据库检查脚本
-- 在 Supabase SQL Editor 中执行

-- 1. 查看所有表
SELECT '=== Tables ===' AS section;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 2. 查看每张表的记录数
SELECT '\n=== Record Counts ===' AS section;
SELECT 'questions' AS table_name, COUNT(*) AS count FROM questions
UNION ALL
SELECT 'question_hints', COUNT(*) FROM question_hints
UNION ALL
SELECT 'practice_sessions', COUNT(*) FROM practice_sessions
UNION ALL
SELECT 'practice_answers', COUNT(*) FROM practice_answers
UNION ALL
SELECT 'competition_rooms', COUNT(*) FROM competition_rooms
UNION ALL
SELECT 'competition_players', COUNT(*) FROM competition_players
UNION ALL
SELECT 'competition_answers', COUNT(*) FROM competition_answers;

-- 3. 查看题目统计
SELECT '\n=== Questions by Difficulty ===' AS section;
SELECT difficulty, COUNT(*) AS count FROM questions GROUP BY difficulty;

-- 4. 查看最新5道题目
SELECT '\n=== Latest Questions ===' AS section;
SELECT id, difficulty, chinese_sentence, english_reference FROM questions ORDER BY id DESC LIMIT 5;

-- 5. 查看提示数量
SELECT '\n=== Hints ===' AS section;
SELECT COUNT(*) AS count FROM question_hints;
