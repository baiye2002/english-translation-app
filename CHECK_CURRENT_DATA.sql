-- 查看当前数据库中的所有数据
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 查看所有表
SELECT '=== Table Statistics ===' AS info;
SELECT
  table_name,
  (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_name = t.table_name
  ) AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. 查看每张表的记录数
SELECT '\n=== Record Count ===' AS info;

SELECT 'questions' AS table_name, COUNT(*) AS record_count FROM questions
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

-- 3. 查看题目按难度统计
SELECT '\n=== Questions by Difficulty ===' AS info;
SELECT
  difficulty,
  COUNT(*) AS count
FROM questions
GROUP BY difficulty
ORDER BY
  CASE difficulty
    WHEN '小学一年级' THEN 1
    WHEN '小学二年级' THEN 2
    WHEN '小学三年级' THEN 3
    WHEN '小学四年级' THEN 4
    WHEN '小学五年级' THEN 5
    WHEN '小学六年级' THEN 6
    WHEN '初中一年级' THEN 7
    WHEN '初中二年级' THEN 8
    WHEN '初中三年级' THEN 9
    WHEN '高中一年级' THEN 10
    WHEN '高中二年级' THEN 11
    WHEN '高中三年级' THEN 12
    WHEN '大学' THEN 13
  END;

-- 4. 查看提示统计
SELECT '\n=== Hints Count ===' AS info;
SELECT COUNT(*) AS hint_count FROM question_hints;

-- 5. 查看最新5道题目
SELECT '\n=== Latest 5 Questions ===' AS info;
SELECT
  id,
  difficulty,
  chinese_sentence,
  english_reference
FROM questions
ORDER BY id DESC
LIMIT 5;
