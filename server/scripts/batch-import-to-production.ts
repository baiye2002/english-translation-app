/**
 * 使用批量插入导入数据到生产环境
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTION_URL = 'https://eknfiycdhykfcdldnwbj.supabase.co';
const PRODUCTION_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw';

const productionClient = createClient(PRODUCTION_URL, PRODUCTION_SERVICE_ROLE_KEY);

async function batchImportToProduction() {
  console.log('====================================');
  console.log('批量导入数据到生产环境...');
  console.log('====================================\n');

  try {
    // 1. 读取 SQL 文件
    console.log('[1/4] 读取 SQL 文件...');
    const sqlFilePath = path.join(process.cwd(), 'REORGANIZED_DATA.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    // 2. 解析数据
    console.log('[2/4] 解析数据...');

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

    console.log(`[2/4] ✓ 解析完成: ${questions.length} 条题目, ${hints.length} 条提示`);

    // 3. 清空数据
    console.log('\n[3/4] 清空生产环境数据...');

    await productionClient.from('practice_answers').delete().neq('id', 0);
    await productionClient.from('competition_answers').delete().neq('id', 0);
    await productionClient.from('question_hints').delete().neq('question_id', 0);
    await productionClient.from('questions').delete().neq('id', 0);

    console.log('[3/4] ✓ 数据清空完成');

    // 4. 批量插入数据（每批 100 条）
    console.log('\n[4/4] 批量插入数据...');

    const batchSize = 100;

    // 插入题目
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      const { error } = await productionClient.from('questions').insert(
        batch.map(q => ({
          id: q.id,
          chinese_sentence: q.chinese_sentence,
          english_reference: q.english_reference,
          difficulty: q.difficulty,
          user_id: null,
          created_at: new Date().toISOString(),
        }))
      );

      if (error) {
        console.error(`[4/4] 批量插入题目失败 (批次 ${Math.floor(i / batchSize) + 1}):`, error.message);
      } else {
        console.log(`[4/4] ✓ 题目进度: ${i + batch.length}/${questions.length}`);
      }
    }

    console.log('[4/4] ✓ 题目插入完成');

    // 插入提示
    for (let i = 0; i < hints.length; i += batchSize) {
      const batch = hints.slice(i, i + batchSize);
      const { error } = await productionClient.from('question_hints').insert(
        batch.map(h => ({
          question_id: h.question_id,
          hint_data: h.hint_data,
          created_at: new Date().toISOString(),
        }))
      );

      if (error) {
        console.error(`[4/4] 批量插入提示失败 (批次 ${Math.floor(i / batchSize) + 1}):`, error.message);
      } else {
        console.log(`[4/4] ✓ 提示进度: ${i + batch.length}/${hints.length}`);
      }
    }

    console.log('[4/4] ✓ 提示插入完成');

    // 5. 验证
    console.log('\n验证数据...');

    const { count: questionCount } = await productionClient
      .from('questions')
      .select('*', { count: 'exact', head: true });

    const { count: hintCount } = await productionClient
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

batchImportToProduction();
