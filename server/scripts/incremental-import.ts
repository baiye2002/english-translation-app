/**
 * 增量导入数据（从中断处继续）
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTION_URL = 'https://eknfiycdhykfcdldnwbj.supabase.co';
const PRODUCTION_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw';

const client = createClient(PRODUCTION_URL, PRODUCTION_SERVICE_ROLE_KEY);

async function incrementalImport() {
  console.log('====================================');
  console.log('增量导入数据');
  console.log('====================================\n');

  try {
    // 1. 检查当前数据量
    console.log('[1/4] 检查当前数据...');
    const { count: currentQuestionCount } = await client.from('questions').select('*', { count: 'exact', head: true });
    const { count: currentHintCount } = await client.from('question_hints').select('*', { count: 'exact', head: true });

    console.log(`当前数据: ${currentQuestionCount} 条题目, ${currentHintCount} 条提示`);

    // 2. 读取并解析数据
    console.log('\n[2/4] 读取数据...');
    const sqlFilePath = path.join(process.cwd(), 'REORGANIZED_DATA.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

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

    // 3. 插入缺失的题目
    console.log('\n[3/4] 插入缺失的题目...');
    console.log(`从第 ${currentQuestionCount + 1} 条开始...\n`);

    const startQuestionIndex = currentQuestionCount;
    let successQuestions = 0;
    let errorQuestions = 0;

    for (let i = startQuestionIndex; i < questions.length; i++) {
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

      if ((i + 1) % 50 === 0) {
        console.log(`进度: ${i + 1}/${questions.length} (成功: ${successQuestions}, 失败: ${errorQuestions})`);
      }
    }

    console.log(`✓ 题目插入完成: 成功 ${successQuestions}, 失败 ${errorQuestions}`);

    // 4. 插入提示
    console.log('\n[4/4] 插入提示数据...\n');

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

      if ((i + 1) % 50 === 0) {
        console.log(`进度: ${i + 1}/${hints.length} (成功: ${successHints}, 失败: ${errorHints})`);
      }
    }

    console.log(`✓ 提示插入完成: 成功 ${successHints}, 失败 ${errorHints}`);

    // 5. 验证
    console.log('\n验证数据...');

    const { count: finalQuestionCount } = await client.from('questions').select('*', { count: 'exact', head: true });
    const { count: finalHintCount } = await client.from('question_hints').select('*', { count: 'exact', head: true });

    console.log(`\n====================================`);
    console.log(`最终数据: ${finalQuestionCount} 条题目, ${finalHintCount} 条提示`);
    console.log('====================================');

    if (finalQuestionCount === 2068 && finalHintCount === 2068) {
      console.log('\n✅✅✅ 数据导入成功！\n');
      console.log('下一步操作:');
      console.log('1. 在 Railway 控制台点击 "Redeploy" 按钮重新部署服务');
      console.log('2. 等待部署完成后，测试前端获取题目和提示功能');
    } else {
      console.error('\n⚠️ 数据未完全导入');
      console.error(`期望: 2068 条题目, 2068 条提示`);
      console.error(`实际: ${finalQuestionCount} 条题目, ${finalHintCount} 条提示`);
      console.log('\n请重新运行此脚本继续导入...');
    }

  } catch (error) {
    console.error('\n❌ 导入失败:', error);
    process.exit(1);
  }
}

incrementalImport();
