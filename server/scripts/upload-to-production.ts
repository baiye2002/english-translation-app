import { getSupabaseClient } from '../src/storage/database/supabase-client';
import * as fs from 'fs';
import * as path from 'path';

async function uploadToProduction() {
  console.log('[Upload] 开始上传数据到生产环境...');

  const client = getSupabaseClient();

  try {
    // 1. 清空现有数据
    console.log('[Upload] 清空现有数据...');
    await client.from('question_hints').delete().neq('question_id', 0);
    await client.from('questions').delete().neq('id', 0);
    console.log('[Upload] ✓ 数据清空完成');

    // 2. 读取 SQL 文件
    const sqlFilePath = path.join(__dirname, 'REORGANIZED_DATA.sql');
    console.log('[Upload] 读取 SQL 文件:', sqlFilePath);

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    const lines = sqlContent.split('\n').filter(line => line.trim());

    console.log('[Upload] 找到', lines.length, '条 SQL 语句');

    // 3. 解析并插入数据
    let successCount = 0;
    let errorCount = 0;

    for (const line of lines) {
      if (line.startsWith('INSERT INTO questions')) {
        // 提取 VALUES 后的内容
        const valuesMatch = line.match(/VALUES \((.*)\);/);
        if (!valuesMatch) continue;

        const values = valuesMatch[1].split(',').map(v => v.trim().replace(/^'|'$/g, ''));

        const [id, chineseSentence, englishReference, difficulty, userId] = values;

        try {
          await client.from('questions').insert({
            id: parseInt(id),
            chinese_sentence: chineseSentence,
            english_reference: englishReference,
            difficulty: difficulty,
            user_id: userId ? parseInt(userId) : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          successCount++;
        } catch (error) {
          console.error('[Upload] 插入题目失败:', id, error);
          errorCount++;
        }
      } else if (line.startsWith('INSERT INTO question_hints')) {
        // 提取 VALUES 后的内容
        const valuesMatch = line.match(/VALUES \((.*)\);/);
        if (!valuesMatch) continue;

        const values = valuesMatch[1].split(/,\s*(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => {
          const trimmed = v.trim();
          // 移除外层引号，但保留内部转义
          if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
            return trimmed.slice(1, -1).replace(/''/g, "'");
          }
          return trimmed;
        });

        const [questionId, hintDataJson] = values;

        try {
          await client.from('question_hints').insert({
            question_id: parseInt(questionId),
            hint_data: JSON.parse(hintDataJson),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          successCount++;
        } catch (error) {
          console.error('[Upload] 插入提示失败:', questionId, error);
          errorCount++;
        }
      }

      // 每 100 条打印一次进度
      if ((successCount + errorCount) % 100 === 0) {
        console.log(`[Upload] 进度: ${successCount + errorCount}/${lines.length} (成功: ${successCount}, 失败: ${errorCount})`);
      }
    }

    console.log('[Upload] ✓ 上传完成!');
    console.log(`[Upload] 成功: ${successCount}, 失败: ${errorCount}`);

    // 4. 验证数据
    console.log('[Upload] 验证数据...');
    const { count: questionCount } = await client.from('questions').select('*', { count: 'exact', head: true });
    const { count: hintCount } = await client.from('question_hints').select('*', { count: 'exact', head: true });

    console.log(`[Upload] 题目数量: ${questionCount}`);
    console.log(`[Upload] 提示数量: ${hintCount}`);

    if (questionCount === 2068 && hintCount === 2068) {
      console.log('[Upload] ✓✓✓ 数据验证通过！');
    } else {
      console.error('[Upload] ✗✗✗ 数据验证失败！');
    }

  } catch (error) {
    console.error('[Upload] 上传失败:', error);
    process.exit(1);
  }
}

uploadToProduction();
