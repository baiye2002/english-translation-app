import { getSupabaseClient } from '../src/storage/database/supabase-client';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 导出所有表的数据到 SQL 文件
 */
async function exportAllData() {
  try {
    const client = getSupabaseClient();

    console.log('正在导出所有数据...\n');

    let sql = '-- 从数据库导出的所有数据\n';
    sql += '-- 导出时间: ' + new Date().toISOString() + '\n\n';

    // ========================================
    // 1. 导出 questions（题目）
    // ========================================
    console.log('正在导出 questions...');
    let allQuestions: any[] = [];
    let offset = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: questions, error } = await client
        .from('questions')
        .select('id, chinese_sentence, english_reference, difficulty')
        .order('id', { ascending: true })
        .range(offset, offset + batchSize - 1);

      if (error) {
        throw new Error(`获取 questions 失败: ${error.message}`);
      }

      if (!questions || questions.length === 0) {
        hasMore = false;
        break;
      }

      allQuestions = allQuestions.concat(questions);
      console.log(`  已获取 ${allQuestions.length} 道题目...`);

      if (questions.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }

    if (allQuestions.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 1. questions (题目)\n';
      sql += '-- ========================================\n';
      sql += `-- 共 ${allQuestions.length} 道题目\n\n`;

      // 按 difficulty 分组
      const grouped: Record<string, any[]> = {};
      allQuestions.forEach(q => {
        if (!grouped[q.difficulty]) {
          grouped[q.difficulty] = [];
        }
        grouped[q.difficulty].push(q);
      });

      const difficulties = [
        '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
        '初中一年级', '初中二年级', '初中三年级',
        '高中一年级', '高中二年级', '高中三年级',
        '大学'
      ];

      difficulties.forEach(diff => {
        const questions = grouped[diff] || [];
        if (questions.length > 0) {
          sql += `-- ${diff}: ${questions.length} 道\n`;
          questions.forEach(q => {
            sql += `INSERT INTO questions (chinese_sentence, english_reference, difficulty) VALUES\n`;
            sql += `  ('${q.chinese_sentence.replace(/'/g, "''")}', '${q.english_reference.replace(/'/g, "''")}', '${diff}');\n`;
          });
          sql += '\n';
        }
      });
      console.log(`  ✅ questions: ${allQuestions.length} 道题目\n`);
    }

    // ========================================
    // 2. 导出 question_hints（题目提示）
    // ========================================
    console.log('正在导出 question_hints...');
    const { data: hints, error: hintsError } = await client
      .from('question_hints')
      .select('*')
      .order('question_id', { ascending: true });

    if (hintsError) {
      console.log(`  ⚠️  question_hints: ${hintsError.message}`);
    } else if (hints && hints.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 2. question_hints (题目提示)\n';
      sql += '-- ========================================\n';
      sql += `-- 共 ${hints.length} 条提示\n\n`;

      hints.forEach(h => {
        sql += `INSERT INTO question_hints (question_id, difficulty, hint) VALUES\n`;
        sql += `  (${h.question_id}, '${h.difficulty}', '${(h.hint || '').replace(/'/g, "''").replace(/\n/g, '\\n')}');\n`;
      });
      sql += '\n';
      console.log(`  ✅ question_hints: ${hints.length} 条提示\n`);
    } else {
      console.log(`  ⚠️  question_hints: 没有数据\n`);
    }

    // ========================================
    // 3. 导出 practice_sessions（练习会话）
    // ========================================
    console.log('正在导出 practice_sessions...');
    const { data: sessions, error: sessionsError } = await client
      .from('practice_sessions')
      .select('*')
      .order('id', { ascending: true });

    if (sessionsError) {
      console.log(`  ⚠️  practice_sessions: ${sessionsError.message}`);
    } else if (sessions && sessions.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 3. practice_sessions (练习会话)\n';
      sql += '-- ========================================\n';
      sql += `-- 共 ${sessions.length} 个会话\n\n`;

      sessions.forEach(s => {
        sql += `INSERT INTO practice_sessions (id, difficulty, score, total_questions, correct_count, created_at) VALUES\n`;
        sql += `  (${s.id}, '${s.difficulty}', ${s.score}, ${s.total_questions}, ${s.correct_count}, '${s.created_at}');\n`;
      });
      sql += '\n';
      console.log(`  ✅ practice_sessions: ${sessions.length} 个会话\n`);
    } else {
      console.log(`  ⚠️  practice_sessions: 没有数据\n`);
    }

    // ========================================
    // 4. 导出 practice_answers（练习答案）
    // ========================================
    console.log('正在导出 practice_answers...');
    offset = 0;
    hasMore = true;
    let allAnswers: any[] = [];

    while (hasMore) {
      const { data: answers, error: answersError } = await client
        .from('practice_answers')
        .select('*')
        .order('id', { ascending: true })
        .range(offset, offset + batchSize - 1);

      if (answersError) {
        console.log(`  ⚠️  practice_answers: ${answersError.message}`);
        break;
      }

      if (!answers || answers.length === 0) {
        hasMore = false;
        break;
      }

      allAnswers = allAnswers.concat(answers);
      console.log(`  已获取 ${allAnswers.length} 条答案...`);

      if (answers.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }

    if (allAnswers.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 4. practice_answers (练习答案)\n';
      sql += '-- ========================================\n';
      sql += `-- 共 ${allAnswers.length} 条答案\n\n`;

      allAnswers.forEach(a => {
        sql += `INSERT INTO practice_answers (id, session_id, question_id, user_answer, is_correct, feedback, created_at) VALUES\n`;
        sql += `  (${a.id}, ${a.session_id}, ${a.question_id}, '${(a.user_answer || '').replace(/'/g, "''").replace(/\n/g, '\\n')}', ${a.is_correct}, '${(a.feedback || '').replace(/'/g, "''").replace(/\n/g, '\\n')}', '${a.created_at}');\n`;
      });
      sql += '\n';
      console.log(`  ✅ practice_answers: ${allAnswers.length} 条答案\n`);
    }

    // ========================================
    // 5. 导出 competition_rooms（竞赛房间）
    // ========================================
    console.log('正在导出 competition_rooms...');
    const { data: rooms, error: roomsError } = await client
      .from('competition_rooms')
      .select('*')
      .order('id', { ascending: true });

    if (roomsError) {
      console.log(`  ⚠️  competition_rooms: ${roomsError.message}`);
    } else if (rooms && rooms.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 5. competition_rooms (竞赛房间)\n';
      sql += '-- ========================================\n';
      sql += `-- 共 ${rooms.length} 个房间\n\n`;

      rooms.forEach(r => {
        sql += `INSERT INTO competition_rooms (id, player_count, status, winner_id, created_at) VALUES\n`;
        sql += `  (${r.id}, ${r.player_count}, '${r.status}', ${r.winner_id || 'NULL'}, '${r.created_at}');\n`;
      });
      sql += '\n';
      console.log(`  ✅ competition_rooms: ${rooms.length} 个房间\n`);
    } else {
      console.log(`  ⚠️  competition_rooms: 没有数据\n`);
    }

    // ========================================
    // 6. 导出 competition_players（竞赛玩家）
    // ========================================
    console.log('正在导出 competition_players...');
    const { data: players, error: playersError } = await client
      .from('competition_players')
      .select('*')
      .order('id', { ascending: true });

    if (playersError) {
      console.log(`  ⚠️  competition_players: ${playersError.message}`);
    } else if (players && players.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 6. competition_players (竞赛玩家)\n';
      sql += '-- ========================================\n';
      sql += `-- 共 ${players.length} 个玩家\n\n`;

      players.forEach(p => {
        sql += `INSERT INTO competition_players (id, room_id, player_name, avatar_url, difficulty, score, current_round, created_at) VALUES\n`;
        sql += `  (${p.id}, ${p.room_id}, '${p.player_name.replace(/'/g, "''")}', '${p.avatar_url.replace(/'/g, "''")}', '${p.difficulty}', ${p.score}, ${p.current_round}, '${p.created_at}');\n`;
      });
      sql += '\n';
      console.log(`  ✅ competition_players: ${players.length} 个玩家\n`);
    } else {
      console.log(`  ⚠️  competition_players: 没有数据\n`);
    }

    // ========================================
    // 7. 导出 competition_answers（竞赛答案）
    // ========================================
    console.log('正在导出 competition_answers...');
    offset = 0;
    hasMore = true;
    let allCompAnswers: any[] = [];

    while (hasMore) {
      const { data: compAnswers, error: compAnswersError } = await client
        .from('competition_answers')
        .select('*')
        .order('id', { ascending: true })
        .range(offset, offset + batchSize - 1);

      if (compAnswersError) {
        console.log(`  ⚠️  competition_answers: ${compAnswersError.message}`);
        break;
      }

      if (!compAnswers || compAnswers.length === 0) {
        hasMore = false;
        break;
      }

      allCompAnswers = allCompAnswers.concat(compAnswers);
      console.log(`  已获取 ${allCompAnswers.length} 条答案...`);

      if (compAnswers.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }

    if (allCompAnswers.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 7. competition_answers (竞赛答案)\n';
      sql += '-- ========================================\n';
      sql += `-- 共 ${allCompAnswers.length} 条答案\n\n`;

      allCompAnswers.forEach(a => {
        sql += `INSERT INTO competition_answers (id, player_id, question_id, round_number, user_answer, is_correct, feedback, created_at) VALUES\n`;
        sql += `  (${a.id}, ${a.player_id}, ${a.question_id}, ${a.round_number}, '${(a.user_answer || '').replace(/'/g, "''").replace(/\n/g, '\\n')}', ${a.is_correct}, '${(a.feedback || '').replace(/'/g, "''").replace(/\n/g, '\\n')}', '${a.created_at}');\n`;
      });
      sql += '\n';
      console.log(`  ✅ competition_answers: ${allCompAnswers.length} 条答案\n`);
    }

    // ========================================
    // 8. 导出 health_check（健康检查）
    // ========================================
    console.log('正在导出 health_check...');
    const { data: healthChecks, error: healthError } = await client
      .from('health_check')
      .select('*');

    if (healthError) {
      console.log(`  ⚠️  health_check: ${healthError.message}`);
    } else if (healthChecks && healthChecks.length > 0) {
      sql += '-- ========================================\n';
      sql += '-- 8. health_check (健康检查)\n';
      sql += '-- ========================================\n';
      sql += `-- 共 ${healthChecks.length} 条记录\n\n`;

      healthChecks.forEach(h => {
        sql += `INSERT INTO health_check (id, updated_at) VALUES\n`;
        sql += `  (${h.id}, '${h.updated_at}');\n`;
      });
      sql += '\n';
      console.log(`  ✅ health_check: ${healthChecks.length} 条记录\n`);
    } else {
      console.log(`  ⚠️  health_check: 没有数据\n`);
    }

    // ========================================
    // 保存到文件
    // ========================================
    const filePath = join(process.cwd(), '..', 'DATABASE_ALL_DATA.sql');
    writeFileSync(filePath, sql, 'utf-8');

    console.log('\n========================================');
    console.log('✅ 所有数据已导出到: DATABASE_ALL_DATA.sql');
    console.log('文件路径: ' + filePath);
    console.log('========================================\n');

  } catch (error) {
    console.error('导出失败:', error);
  }
}

exportAllData();
