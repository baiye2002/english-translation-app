/**
 * 将本地数据导出并导入到生产环境 Supabase 数据库
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// 生产环境数据库配置
const PRODUCTION_URL = 'https://eknfiycdhykfcdldnwbj.supabase.co';
const PRODUCTION_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw';

// 创建生产环境数据库客户端
const productionClient = createClient(PRODUCTION_URL, PRODUCTION_SERVICE_ROLE_KEY);

async function exportAndImportToProduction() {
  console.log('====================================');
  console.log('开始导出本地数据到生产环境...');
  console.log('====================================\n');

  try {
    // 1. 读取本地 SQL 文件
    console.log('[1/5] 读取本地 SQL 文件...');
    const sqlFilePath = path.join(process.cwd(), 'REORGANIZED_DATA.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('[1/5] ✓ SQL 文件读取完成');

    // 2. 解析 SQL 数据
    console.log('\n[2/5] 解析 SQL 数据...');

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
            console.error(`[2/5] 解析提示数据失败 (ID: ${match[1]}):`, e);
          }
        }
      }
    }

    console.log(`[2/5] ✓ 解析完成: ${questions.length} 条题目, ${hints.length} 条提示`);

    // 3. 检查生产环境当前数据
    console.log('\n[3/5] 检查生产环境当前数据...');

    const { count: prodQuestionCount } = await productionClient
      .from('questions')
      .select('*', { count: 'exact', head: true });

    const { count: prodHintCount } = await productionClient
      .from('question_hints')
      .select('*', { count: 'exact', head: true });

    console.log(`[3/5] 生产环境当前数据: ${prodQuestionCount} 条题目, ${prodHintCount} 条提示`);

    // 4. 清空生产环境数据
    console.log('\n[4/5] 清空生产环境数据...');

    if (prodQuestionCount > 0) {
      // 先删除所有外键表的数据
      const tablesToDelete = [
        'practice_answers',
        'competition_answers'
      ];

      for (const table of tablesToDelete) {
        try {
          const { error } = await productionClient
            .from(table)
            .delete()
            .neq('id', 0);

          if (error) {
            console.log(`[4/5] ${table} 表: ${error.message} (可能是表不存在)`);
          } else {
            console.log(`[4/5] ✓ ${table} 表清空完成`);
          }
        } catch (e: any) {
          console.log(`[4/5] ${table} 表: ${e.message} (可能是表不存在)`);
        }
      }

      const { error: deleteHintsError } = await productionClient
        .from('question_hints')
        .delete()
        .neq('question_id', 0);

      if (deleteHintsError) {
        throw new Error(`清空提示表失败: ${deleteHintsError.message}`);
      }

      const { error: deleteQuestionsError } = await productionClient
        .from('questions')
        .delete()
        .neq('id', 0);

      if (deleteQuestionsError) {
        throw new Error(`清空题目表失败: ${deleteQuestionsError.message}`);
      }
    }

    console.log('[4/5] ✓ 生产环境数据清空完成');

    // 5. 插入题目数据
    console.log('\n[5/5] 插入题目数据...');

    let successQuestions = 0;
    let errorQuestions = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      try {
        const { error } = await productionClient
          .from('questions')
          .insert({
            id: q.id,
            chinese_sentence: q.chinese_sentence,
            english_reference: q.english_reference,
            difficulty: q.difficulty,
            user_id: null,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          throw error;
        }

        successQuestions++;
      } catch (error: any) {
        console.error(`[5/5] 插入题目失败 (ID: ${q.id}):`, error.message);
        errorQuestions++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`[5/5] 题目进度: ${i + 1}/${questions.length} (成功: ${successQuestions}, 失败: ${errorQuestions})`);
      }
    }

    console.log(`[5/5] ✓ 题目插入完成: 成功 ${successQuestions}, 失败 ${errorQuestions}`);

    // 6. 插入提示数据
    console.log('\n[5/5] 插入提示数据...');

    let successHints = 0;
    let errorHints = 0;

    for (let i = 0; i < hints.length; i++) {
      const h = hints[i];

      try {
        const { error } = await productionClient
          .from('question_hints')
          .insert({
            question_id: h.question_id,
            hint_data: h.hint_data,
            created_at: new Date().toISOString(),
          })
          .select();

        if (error) {
          throw error;
        }

        successHints++;
      } catch (error: any) {
        console.error(`[5/5] 插入提示失败 (question_id: ${h.question_id}):`, error.message);
        errorHints++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`[5/5] 提示进度: ${i + 1}/${hints.length} (成功: ${successHints}, 失败: ${errorHints})`);
      }
    }

    console.log(`[5/5] ✓ 提示插入完成: 成功 ${successHints}, 失败 ${errorHints}`);

    // 7. 验证生产环境数据
    console.log('\n验证生产环境数据...');

    // 等待一下，确保数据已提交
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { count: finalQuestionCount } = await productionClient
      .from('questions')
      .select('*', { count: 'exact', head: true });

    const { count: finalHintCount } = await productionClient
      .from('question_hints')
      .select('*', { count: 'exact', head: true });

    console.log(`生产环境最终数据: ${finalQuestionCount} 条题目, ${finalHintCount} 条提示`);

    // 检查特定题目
    const { data: q1039 } = await productionClient
      .from('questions')
      .select('id, chinese_sentence')
      .eq('id', 1039)
      .maybeSingle();

    const { data: h1039 } = await productionClient
      .from('question_hints')
      .select('question_id')
      .eq('question_id', 1039)
      .maybeSingle();

    console.log(`题目 1039: ${q1039?.chinese_sentence || '不存在'}`);
    console.log(`题目 1039 的提示: ${h1039 ? '存在' : '不存在'}`);

    // 最终检查
    console.log('\n====================================');
    if (finalQuestionCount === 2068 && finalHintCount === 2068) {
      console.log('✅✅✅ 数据导入成功！');
      console.log('====================================');
      console.log('\n下一步操作:');
      console.log('1. 在 Railway 控制台点击 "Redeploy" 按钮重新部署服务');
      console.log('2. 等待部署完成后，测试前端获取题目和提示功能');
    } else {
      console.error('❌❌❌ 数据导入失败！');
      console.error(`期望: 2068 条题目, 2068 条提示`);
      console.error(`实际: ${finalQuestionCount} 条题目, ${finalHintCount} 条提示`);
      console.log('====================================');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ 导入失败:', error);
    process.exit(1);
  }
}

exportAndImportToProduction();
