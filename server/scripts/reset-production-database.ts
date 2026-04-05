/**
 * 完全重置生产环境数据库
 * 1. 删除所有表
 * 2. 重建表结构
 * 3. 导入数据
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const PRODUCTION_URL = 'https://eknfiycdhykfcdldnwbj.supabase.co';
const PRODUCTION_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw';

const client = createClient(PRODUCTION_URL, PRODUCTION_SERVICE_ROLE_KEY);

async function resetProductionDatabase() {
  console.log('====================================');
  console.log('完全重置生产环境数据库');
  console.log('====================================\n');

  try {
    // 1. 删除所有表
    console.log('[1/4] 删除生产环境所有表...');

    const tables = [
      'practice_answers',
      'competition_answers',
      'question_hints',
      'questions',
      'profiles',
      'users'
    ];

    for (const table of tables) {
      try {
        // 先删除数据
        await client.from(table).delete().neq('id', 0);
        console.log(`  ✓ ${table} 表数据已清空`);
      } catch (e: any) {
        console.log(`  - ${table} 表: ${e.message}`);
      }
    }

    console.log('[1/4] ✓ 所有表数据已清空\n');

    // 2. 读取本地表结构 SQL
    console.log('[2/4] 读取本地表结构...');

    const initSqlPath = path.join(process.cwd(), '..', 'DATABASE_INIT.sql');
    const initSqlContent = fs.readFileSync(initSqlPath, 'utf-8');

    console.log('[2/4] ✓ 表结构 SQL 读取完成\n');

    // 3. 读取本地数据
    console.log('[3/4] 读取本地数据...');

    const dataSqlPath = path.join(process.cwd(), 'REORGANIZED_DATA.sql');
    const dataSqlContent = fs.readFileSync(dataSqlPath, 'utf-8');

    console.log('[3/4] ✓ 数据 SQL 读取完成\n');

    // 4. 生成完整的 SQL 脚本
    console.log('[4/4] 生成 SQL 脚本...\n');

    const fullSql = `-- ========================================
-- 完全重置生产环境数据库
-- ========================================

-- 1. 删除所有表
DROP TABLE IF EXISTS practice_answers CASCADE;
DROP TABLE IF EXISTS competition_answers CASCADE;
DROP TABLE IF EXISTS question_hints CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. 重建表结构
${initSqlContent}

-- 3. 导入数据
${dataSqlContent}
`;

    const outputPath = path.join(process.cwd(), 'FULL_DATABASE_EXPORT.sql');
    fs.writeFileSync(outputPath, fullSql);

    console.log('====================================');
    console.log('✅ SQL 脚本生成完成！');
    console.log('====================================');
    console.log('\n文件路径:', outputPath);
    console.log('\n下一步操作:');
    console.log('1. 打开 Supabase 控制台 (https://supabase.com/dashboard)');
    console.log('2. 找到项目: eknfiycdhykfcdldnwbj');
    console.log('3. 点击 SQL Editor');
    console.log('4. 复制 FULL_DATABASE_EXPORT.sql 的内容');
    console.log('5. 粘贴到 SQL Editor 并执行');
    console.log('\n⚠️ 注意：这将删除生产环境的所有数据，请确认后执行！');

  } catch (error) {
    console.error('\n❌ 生成 SQL 脚本失败:', error);
    process.exit(1);
  }
}

resetProductionDatabase();
