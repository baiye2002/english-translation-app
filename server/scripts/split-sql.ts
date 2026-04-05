/**
 * 拆分 SQL 文件为多个小文件
 */

import * as fs from 'fs';
import * as path from 'path';

const SQL_FILE_PATH = path.join(process.cwd(), 'FULL_DATABASE_EXPORT.sql');
const OUTPUT_DIR = path.join(process.cwd(), 'split-sql');

async function splitSQL() {
  console.log('====================================');
  console.log('拆分 SQL 文件为多个小文件');
  console.log('====================================\n');

  try {
    // 读取 SQL 文件
    console.log('[1/3] 读取 SQL 文件...');
    const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf-8');

    console.log('✓ SQL 文件读取完成');
    console.log(`文件大小: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`行数: ${sqlContent.split('\n').length} 行\n`);

    // 创建输出目录
    console.log('[2/3] 创建输出目录...');
    if (fs.existsSync(OUTPUT_DIR)) {
      fs.rmSync(OUTPUT_DIR, { recursive: true });
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('✓ 输出目录创建完成\n');

    // 拆分 SQL
    console.log('[3/3] 拆分 SQL 文件...\n');

    const lines = sqlContent.split('\n');
    const batchLines = 500; // 每个文件 500 行
    const batches: string[] = [];

    let currentBatch: string[] = [];
    let inInsertBlock = false;
    let insertLineBuffer: string[] = [];

    for (const line of lines) {
      if (line.trim().startsWith('INSERT INTO')) {
        inInsertBlock = true;
        insertLineBuffer = [line];
      } else if (inInsertBlock) {
        insertLineBuffer.push(line);

        // 如果行以分号结尾，说明 INSERT 语句结束
        if (line.trim().endsWith(';')) {
          inInsertBlock = false;

          // 如果添加这个 INSERT 会导致超出批次大小，先保存当前批次
          if (currentBatch.length + insertLineBuffer.length > batchLines) {
            if (currentBatch.length > 0) {
              batches.push(currentBatch.join('\n'));
            }
            currentBatch = [...insertLineBuffer];
          } else {
            currentBatch.push(...insertLineBuffer);
          }
          insertLineBuffer = [];
        }
      } else {
        currentBatch.push(line);
      }
    }

    // 保存最后一个批次
    if (currentBatch.length > 0) {
      batches.push(currentBatch.join('\n'));
    }

    // 保存每个批次
    console.log(`✓ 拆分完成，共 ${batches.length} 个文件\n`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const fileName = `batch_${i + 1}.sql`;
      const filePath = path.join(OUTPUT_DIR, fileName);

      fs.writeFileSync(filePath, batch);
      console.log(`✓ 生成文件: ${fileName} (${batch.split('\n').length} 行)`);
    }

    console.log('\n====================================');
    console.log('✅ SQL 文件拆分完成！');
    console.log('====================================');
    console.log('\n下一步操作:');
    console.log(`1. 所有文件保存在: ${OUTPUT_DIR}`);
    console.log('2. 在 Supabase SQL Editor 中逐个执行这些文件');
    console.log(`3. 按顺序执行: batch_1.sql → batch_${batches.length}.sql`);
    console.log('\n或者，我可以生成一个自动化脚本，使用 Supabase API 执行这些文件。');

  } catch (error) {
    console.error('\n❌ 拆分失败:', error);
    process.exit(1);
  }
}

splitSQL();
