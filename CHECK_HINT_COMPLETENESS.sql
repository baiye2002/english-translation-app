-- 检查 question_hints 数据完整性
-- 在 Supabase SQL Editor 中执行

-- 1. 查看有多少个不同的 question_id
SELECT 'Unique question_ids in hints:' AS info;
SELECT COUNT(DISTINCT question_id) AS count FROM question_hints;

-- 2. 查看 questions 表有多少个不同的 id
SELECT '\nUnique question_ids in questions:' AS info;
SELECT COUNT(DISTINCT id) AS count FROM questions;

-- 3. 查看 question_hints 中每个难度有多少条记录
SELECT '\nHints by difficulty:' AS info;
SELECT difficulty, COUNT(*) AS count FROM question_hints GROUP BY difficulty;

-- 4. 查看 question_id = 767 在 questions 表中的难度
SELECT '\nQuestion 767 info:' AS info;
SELECT id, difficulty, chinese_sentence FROM questions WHERE id = 767;

-- 5. 查看 question_hints 表中有哪些 question_id 在 700-800 之间
SELECT '\nHints in range 700-800:' AS info;
SELECT question_id, difficulty FROM question_hints
WHERE question_id BETWEEN 700 AND 800
LIMIT 10;
