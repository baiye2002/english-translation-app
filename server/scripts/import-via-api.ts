/**
 * 使用 Supabase REST API 批量插入数据
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTION_URL = 'https://eknfiycdhykfcdldnwbj.supabase.co';
const PRODUCTION_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw';

const client = createClient(PRODUCTION_URL, PRODUCTION_SERVICE_ROLE_KEY);

async function importViaAPI() {
  console.log('====================================');
  console.log('使用 Supabase REST API 导入数据');
  console.log('====================================\n');

  try {
    // 1. 读取 SQL 文件
    console.log('[1/5] 读取 SQL 文件...');
    const sqlFilePath = path.join(process.cwd(), 'REORGANIZED_DATA.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('✓ SQL 文件读取完成');

    // 2. 解析数据
    console.log('\n[2/5] 解析数据...');

    const questions: any[] = [];
    const hints: any[] = [];

    const lines = sqlContent.split('\n');
    let inQuestions = false;
    let inHints = false;

    for (const line of lines) {
      if (line.includes('插入题目数据')) {
        inQuestions = true;
        inHints = false;
        continue;
      }
      if (line.includes('插入提示数据')) {
        inHints = true;
        inQuestions = false;
        continue;
      }
      if (line.includes('--') || line.trim() === '') {
        continue;
      }

      if (inQuestions && line.startsWith('INSERT INTO questions')) {
        const match = line.match(/VALUES \((\d+), '(.+)', '(.+)', '(.+)'\)/);
        if (match) {
          questions.push({
            id: parseInt(match[1]),
            chinese_sentence: match[2].replace(/''/g, "'"),
            english_reference: match[3].replace(/''/g, "'"),
            difficulty: match[4].replace(/''/g, "'"),
          });
        }
      }

      if (inHints && line.startsWith('INSERT INTO question_hints')) {
        const match = line.match(/VALUES \((\d+), '(.+)'\)/);
        if (match) {
          try {
            hints.push({
              question_id: parseInt(match[1]),
              hint_data: JSON.parse(match[2].replace(/''/g, "'")),
            });
          } catch (e) {
            // 跳过解析失败的提示
          }
        }
      }
    }

    console.log(`✓ 解析完成: ${questions.length} 条题目, ${hints.length} 条提示`);

    // 3. 清空数据
    console.log('\n[3/5] 清空生产环境数据...');

    await client.from('practice_answers').delete().neq('id', 0);
    await client.from('competition_answers').delete().neq('id', 0);
    await client.from('question_hints').delete().neq('question_id', 0);
    await client.from('questions').delete().neq('id', 0);

    console.log('✓ 数据清空完成');

    // 4. 插入题目（逐条插入）
    console.log('\n[4/5] 插入题目数据...');

    let successQuestions = 0;
    let errorQuestions = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      try {
        const { error } = await client
          .from('questions')
          .insert({
            id: q.id,
            chinese_sentence: q.chinese_sentence,
            english_reference: q.english_reference,
            difficulty: q.difficulty,
          });

        if (error) {
          throw error;
        }

        successQuestions++;
      } catch (error: any) {
        console.error(`插入题目失败 (ID: ${q.id}):`, error.message);
        errorQuestions++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`进度: ${i + 1}/${questions.length} (成功: ${successQuestions}, 失败: ${errorQuestions})`);
      }
    }

    console.log(`✓ 题目插入完成: 成功 ${successQuestions}, 失败 ${errorQuestions}`);

    // 5. 插入提示（逐条插入）
    console.log('\n[5/5] 插入提示数据...');

    let successHints = 0;
    let errorHints = 0;

    for (let i = 0; i < hints.length; i++) {
      const h = hints[i];

      try {
        const { error } = await client
          .from('question_hints')
          .insert({
            question_id: h.question_id,
            hint_data: h.hint_data,
          });

        if (error) {
          throw error;
        }

        successHints++;
      } catch (error: any) {
        console.error(`插入提示失败 (question_id: ${h.question_id}):`, error.message);
        errorHints++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`进度: ${i + 1}/${hints.length} (成功: ${successHints}, 失败: ${errorHints})`);
      }
    }

    console.log(`✓ 提示插入完成: 成功 ${successHints}, 失败 ${errorHints}`);

    // 6. 验证
    console.log('\n验证数据...');

    const { count: questionCount } = await client
      .from('questions')
      .select('*', { count: 'exact', head: true });

    const { count: hintCount } = await client
      .from('question_hints')
      .select('*', { count: 'exact', head: true });

    console.log(`\n====================================`);
    console.log(`题目数量: ${questionCount}`);
    console.log(`提示数量: ${hintCount}`);
    console.log('====================================');

    if (questionCount === 2068 && hintCount === 2068) {
      console.log('\n✅✅✅ 数据导入成功！\n');
      console.log('下一步操作:');
      console.log('1. 在 Railway 控制台点击 "Redeploy" 按钮重新部署服务');
      console.log('2. 等待部署完成后，测试前端获取题目和提示功能');
    } else {
      console.error('\n❌ 数据导入失败！');
      console.error(`期望: 2068 条题目, 2068 条提示`);
      console.error(`实际: ${questionCount} 条题目, ${hintCount} 条提示`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ 导入失败:', error);
    process.exit(1);
  }
}

importViaAPI();
