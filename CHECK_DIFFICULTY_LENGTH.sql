-- 检查 difficulty 字段长度
-- 在 Supabase SQL Editor 中执行

-- 查看 questions 表中所有不同的 difficulty 值及其长度
SELECT
  difficulty,
  LENGTH(difficulty) AS length
FROM questions
GROUP BY difficulty
ORDER BY LENGTH(difficulty) DESC;
