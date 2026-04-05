-- 创建 question_hints 表（安全版本）
-- 在 Supabase SQL Editor 中执行

-- ========================================
-- 创建 question_hints 表（如果不存在）
-- ========================================
CREATE TABLE IF NOT EXISTS question_hints (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  difficulty VARCHAR(50) NOT NULL,
  hint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(question_id, difficulty)
);

-- ========================================
-- 创建索引
-- ========================================
CREATE INDEX IF NOT EXISTS question_hints_question_id_idx ON question_hints(question_id);
CREATE INDEX IF NOT EXISTS question_hints_difficulty_idx ON question_hints(difficulty);

-- ========================================
-- 启用 RLS
-- ========================================
ALTER TABLE question_hints ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 删除已存在的策略（如果有）
-- ========================================
DROP POLICY IF EXISTS "Enable all access on question_hints" ON question_hints;

-- ========================================
-- 创建策略
-- ========================================
CREATE POLICY "Enable all access on question_hints" ON question_hints FOR ALL USING (true);

-- ========================================
-- 修改其他表的 difficulty 字段长度
-- ========================================
-- 修改 practice_sessions 表
ALTER TABLE practice_sessions ALTER COLUMN difficulty TYPE VARCHAR(50);

-- 修改 competition_players 表
ALTER TABLE competition_players ALTER COLUMN difficulty TYPE VARCHAR(50);

-- ========================================
-- 验证表结构
-- ========================================
SELECT 'Table structure check:' AS info;
SELECT
  table_name,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'difficulty'
ORDER BY table_name;

-- ========================================
-- 查看现有表的记录数
-- ========================================
SELECT '\nRecord counts:' AS info;
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
