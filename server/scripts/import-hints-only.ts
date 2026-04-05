/**
 * 专门导入提示数据
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTION_URL = 'https://eknfiycdhykfcdldnwbj.supabase.co';
const PRODUCTION_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw';

const client = createClient(PRODUCTION_URL, PRODUCTION_SERVICE_ROLE_KEY);

async function importHints() {
  console.log('====================================');
  console.log('导入提示数据');
  console.log('====================================\n');

  try {
    // 1. 检查当前提示数据
    console.log('[1/3] 检查当前数据...');
    const { count: currentHintCount } = await client.from('question_hints').select('*', { count: 'exact', head: true });
    console.log(`当前提示数量: ${currentHintCount}\n`);

    // 2. 读取并解析提示数据
    console.log('[2/3] 读取提示数据...');
    const sqlFilePath = path.join(process.cwd(), 'REORGANIZED_DATA.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    const hints: any[] = [];

    const lines = sqlContent.split('\n');
    let inHints = false;

    for (const line of lines) {
      if (line.includes('插入提示数据')) {
        inHints = true;
        continue;
      }
      if (line.includes('--') || line.trim() === '' || !inHints) {
        continue;
      }

      if (line.startsWith('INSERT INTO question_hints')) {
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

    console.log(`✓ 解析完成: ${hints.length} 条提示\n`);

    // 3. 插入提示数据（使用批量插入）
    console.log('[3/3] 插入提示数据...');
    console.log('使用批量插入（每批 50 条）...\n');

    const batchSize = 50;
    let successHints = 0;
    let errorHints = 0;

    for (let i = 0; i < hints.length; i += batchSize) {
      const batch = hints.slice(i, i + batchSize);
      const { data, error } = await client
        .from('question_hints')
        .insert(
          batch.map(h => ({
            question_id: h.question_id,
            hint_data: h.hint_data,
          }))
        )
        .select();

      if (error) {
        console.error(`批量插入失败 (批次 ${Math.floor(i / batchSize) + 1}):`, error.message);
        errorHints += batch.length;

        // 如果批量失败，尝试逐条插入
        console.log('尝试逐条插入...');
        for (const h of batch) {
          try {
            await client.from('question_hints').insert({
              question_id: h.question_id,
              hint_data: h.hint_data,
            });
            successHints++;
            errorHints--;
          } catch (e: any) {
            console.error(`插入提示失败 (question_id: ${h.question_id}):`, e.message);
          }
        }
      } else {
        successHints += batch.length;
        console.log(`进度: ${i + batch.length}/${hints.length} (成功: ${successHints}, 失败: ${errorHints})`);
      }

      // 每 500 条检查一次进度
      if ((i + batchSize) % 500 === 0) {
        console.log(`\n进度报告: 已完成 ${i + batch.length}/${hints.length} (${((i + batch.length) / hints.length * 100).toFixed(1)}%)\n`);
      }
    }

    console.log(`✓ 提示插入完成: 成功 ${successHints}, 失败 ${errorHints}`);

    // 4. 验证
    console.log('\n验证数据...');

    const { count: finalHintCount } = await client.from('question_hints').select('*', { count: 'exact', head: true });

    const { data: h1039 } = await client.from('question_hints').select('question_id').eq('question_id', 1039).maybeSingle();

    console.log(`\n====================================`);
    console.log(`最终提示数量: ${finalHintCount}`);
    console.log(`题目 1039 的提示: ${h1039 ? '存在' : '不存在'}`);
    console.log('====================================');

    if (finalHintCount === 2068) {
      console.log('\n✅✅✅ 所有提示数据导入成功！\n');
      console.log('🎉 数据导入完成！\n');
      console.log('下一步操作:');
      console.log('1. 在 Railway 控制台点击 "Redeploy" 按钮重新部署服务');
      console.log('2. 等待部署完成后，测试前端获取题目和提示功能');
      console.log('\n预期结果：');
      console.log('- 获取提示应该从数据库直接读取');
      console.log('- 不再调用 LLM');
      console.log('- 返回完整的提示数据（单词、音标、例句、考点说明）');
    } else {
      console.error('\n⚠️ 提示数据未完全导入');
      console.error(`期望: 2068 条提示`);
      console.error(`实际: ${finalHintCount} 条提示`);
      console.log('\n请重新运行此脚本继续导入...');
    }

  } catch (error) {
    console.error('\n❌ 导入失败:', error);
    process.exit(1);
  }
}

importHints();
