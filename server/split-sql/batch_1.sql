-- ========================================
-- 完全重置生产环境数据库
-- ========================================

-- 1. 删除所有表
DROP TABLE IF EXISTS practice_answers CASCADE;
DROP TABLE IF EXISTS competition_answers CASCADE;
DROP TABLE IF EXISTS question_hints CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. 重建表结构
-- 英语翻译学习应用 - 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建题目表 (questions)
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  chinese_sentence TEXT NOT NULL,
  english_reference TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建难度索引
CREATE INDEX IF NOT EXISTS questions_difficulty_idx ON questions(difficulty);

-- 2. 创建练习会话表 (practice_sessions)
CREATE TABLE IF NOT EXISTS practice_sessions (
  id SERIAL PRIMARY KEY,
  difficulty VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS practice_sessions_difficulty_idx ON practice_sessions(difficulty);
CREATE INDEX IF NOT EXISTS practice_sessions_created_at_idx ON practice_sessions(created_at);

-- 3. 创建练习答案表 (practice_answers)
CREATE TABLE IF NOT EXISTS practice_answers (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS practice_answers_session_id_idx ON practice_answers(session_id);
CREATE INDEX IF NOT EXISTS practice_answers_question_id_idx ON practice_answers(question_id);

-- 4. 创建竞赛房间表 (competition_rooms)
CREATE TABLE IF NOT EXISTS competition_rooms (
  id SERIAL PRIMARY KEY,
  player_count INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  winner_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS competition_rooms_status_idx ON competition_rooms(status);

-- 5. 创建竞赛玩家表 (competition_players)
CREATE TABLE IF NOT EXISTS competition_players (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES competition_rooms(id) ON DELETE CASCADE,
  player_name VARCHAR(50) NOT NULL,
  avatar_url VARCHAR(255) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  score INTEGER NOT NULL,
  current_round INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS competition_players_room_id_idx ON competition_players(room_id);

-- 6. 创建竞赛答案表 (competition_answers)
CREATE TABLE IF NOT EXISTS competition_answers (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES competition_players(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  round_number INTEGER NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS competition_answers_player_id_idx ON competition_answers(player_id);
CREATE INDEX IF NOT EXISTS competition_answers_round_number_idx ON competition_answers(round_number);

-- 7. 创建健康检查表 (health_check)
CREATE TABLE IF NOT EXISTS health_check (
  id SERIAL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 Row Level Security (RLS)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_check ENABLE ROW LEVEL SECURITY;

-- 创建策略（允许所有操作，实际使用中可以根据需要调整）
CREATE POLICY "Enable all access on questions" ON questions FOR ALL USING (true);
CREATE POLICY "Enable all access on practice_sessions" ON practice_sessions FOR ALL USING (true);
CREATE POLICY "Enable all access on practice_answers" ON practice_answers FOR ALL USING (true);
CREATE POLICY "Enable all access on competition_rooms" ON competition_rooms FOR ALL USING (true);
CREATE POLICY "Enable all access on competition_players" ON competition_players FOR ALL USING (true);
CREATE POLICY "Enable all access on competition_answers" ON competition_answers FOR ALL USING (true);
CREATE POLICY "Enable all access on health_check" ON health_check FOR ALL USING (true);

-- 查看创建的表
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';


-- 3. 导入数据
-- 清空现有数据
DELETE FROM question_hints;
DELETE FROM questions;

-- 重置自增序列
ALTER SEQUENCE questions_id_seq RESTART WITH 1;

-- 插入题目数据（新 ID：1-2068）