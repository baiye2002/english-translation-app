-- 检查需要生成提示的题目
-- 在 Supabase SQL Editor 中执行

-- 1. 统计所有题目和提示的数量
SELECT '=== 统计 ===' AS section;
SELECT 'Total questions:' AS info;
SELECT COUNT(*) AS count FROM questions;

SELECT '\nTotal hints:' AS info;
SELECT COUNT(*) AS count FROM question_hints;

-- 2. 统计每个难度的题目数量
SELECT '\n=== Questions by difficulty ===' AS section;
SELECT difficulty, COUNT(*) AS count FROM questions GROUP BY difficulty;

-- 3. 统计每个难度的提示数量
SELECT '\n=== Hints by difficulty ===' AS section;
SELECT difficulty, COUNT(*) AS count FROM question_hints GROUP BY difficulty;

-- 4. 查找没有提示的题目
SELECT '\n=== Questions without hints (first 10) ===' AS section;
SELECT
  q.id,
  q.difficulty,
  q.chinese_sentence
FROM questions q
LEFT JOIN question_hints h ON q.id = h.question_id
WHERE h.id IS NULL
ORDER BY q.id
LIMIT 10;

-- 5. 统计没有提示的题目总数
SELECT '\n=== Total questions without hints ===' AS section;
SELECT COUNT(*) AS count
FROM questions q
LEFT JOIN question_hints h ON q.id = h.question_id
WHERE h.id IS NULL;

-- 6. 查找 question_id = 767 是否有提示
SELECT '\n=== Question 767 hint status ===' AS section;
SELECT
  q.id,
  q.difficulty AS question_difficulty,
  h.difficulty AS hint_difficulty,
  CASE WHEN h.id IS NULL THEN 'No hint' ELSE 'Has hint' END AS status
FROM questions q
LEFT JOIN question_hints h ON q.id = h.question_id
WHERE q.id = 767;
