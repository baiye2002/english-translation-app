import { getSupabaseClient } from '../src/storage/database/supabase-client';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 导出所有题目到 SQL 文件
 */
async function exportAllQuestions() {
  try {
    const client = getSupabaseClient();

    console.log('正在导出所有题目数据...\n');

    // 获取所有题目
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
        throw new Error(`获取题目失败: ${error.message}`);
      }

      if (!questions || questions.length === 0) {
        hasMore = false;
        break;
      }

      allQuestions = allQuestions.concat(questions);
      console.log(`已获取 ${allQuestions.length} 道题目...`);

      if (questions.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }

    console.log(`\n总计: ${allQuestions.length} 道题目\n`);

    // 按难度分组
    const grouped: Record<string, any[]> = {};
    allQuestions.forEach(q => {
      if (!grouped[q.difficulty]) {
        grouped[q.difficulty] = [];
      }
      grouped[q.difficulty].push(q);
    });

    // 生成 SQL
    let sql = '-- 从数据库导出的所有题目\n';
    sql += '-- 共 ' + allQuestions.length + ' 道题目\n';
    sql += '-- 导出时间: ' + new Date().toISOString() + '\n\n';

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

    // 保存到文件
    const filePath = join(process.cwd(), '..', 'DATABASE_EXPORT.sql');
    writeFileSync(filePath, sql, 'utf-8');

    console.log('✅ 已导出到: DATABASE_EXPORT.sql');
    console.log('文件路径: ' + filePath);

    // 显示统计
    console.log('\n📊 题目统计：\n');
    difficulties.forEach(diff => {
      const count = grouped[diff]?.length || 0;
      if (count > 0) {
        console.log(`  ${diff}: ${count} 道`);
      } else {
        console.log(`  ${diff}: 0 道 ⚠️`);
      }
    });

    console.log(`\n  总计: ${allQuestions.length} 道题目`);

  } catch (error) {
    console.error('导出失败:', error);
  }
}

exportAllQuestions();
