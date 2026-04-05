/**
 * 插入重组后的数据（完整版）
 */

import { getSupabaseClient } from '../src/storage/database/supabase-client';

async function insertReorganizedData() {
  console.log('开始插入重组后的数据...');

  const client = getSupabaseClient();

  // 1. 重新导出数据
  const fs = await import('fs');
  const path = await import('path');
  const sqlPath = path.join(process.cwd(), 'REORGANIZED_DATA.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

  console.log('解析 SQL 文件...');

  // 解析题目数据
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
          console.error('解析提示数据失败:', e);
        }
      }
    }
  }

  console.log(`✓ 解析到 ${questions.length} 条题目`);
  console.log(`✓ 解析到 ${hints.length} 条提示`);

  // 2. 插入题目数据（逐条插入，避免批量冲突）
  console.log('插入题目数据...');
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    try {
      const { error } = await client
        .from('questions')
        .insert(q)
        .select();

      if (error) {
        console.error(`插入题目 ID ${q.id} 失败:`, error.message);
        errorCount++;
      } else {
        successCount++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`题目进度: ${i + 1}/${questions.length}`);
      }
    } catch (err) {
      console.error(`插入题目 ID ${q.id} 异常:`, err);
      errorCount++;
    }
  }

  console.log(`题目插入完成: 成功 ${successCount}, 失败 ${errorCount}`);

  // 3. 插入提示数据（逐条插入）
  console.log('插入提示数据...');
  successCount = 0;
  errorCount = 0;

  for (let i = 0; i < hints.length; i++) {
    const h = hints[i];

    try {
      const { error } = await client
        .from('question_hints')
        .insert(h)
        .select();

      if (error) {
        console.error(`插入提示题目 ID ${h.question_id} 失败:`, error.message);
        errorCount++;
      } else {
        successCount++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`提示进度: ${i + 1}/${hints.length}`);
      }
    } catch (err) {
      console.error(`插入提示题目 ID ${h.question_id} 异常:`, err);
      errorCount++;
    }
  }

  console.log(`提示插入完成: 成功 ${successCount}, 失败 ${errorCount}`);

  console.log('\n✅ 所有数据插入完成！');
}

insertReorganizedData();
