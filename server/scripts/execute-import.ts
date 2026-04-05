/**
 * 使用 pg 库直接连接 Supabase 数据库执行 SQL
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// 数据库连接信息
const DB_CONFIG = {
  host: 'db.eknfiycdhykfcdldnwbj.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw',
  ssl: {
    rejectUnauthorized: false
  }
};

const SQL_FILE_PATH = path.join(process.cwd(), 'FULL_DATABASE_EXPORT.sql');

async function executeSQL() {
  console.log('====================================');
  console.log('开始执行数据库导入...');
  console.log('====================================\n');

  const pool = new Pool(DB_CONFIG);

  try {
    // 读取 SQL 文件
    console.log('[1/3] 读取 SQL 文件...');
    const sqlContent = fs.readFileSync(SQL_FILE_PATH, 'utf-8');

    console.log('✓ SQL 文件读取完成');
    console.log(`文件大小: ${(sqlContent.length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`行数: ${sqlContent.split('\n').length} 行\n`);

    // 连接数据库
    console.log('[2/3] 连接数据库...');
    await pool.connect();
    console.log('✓ 数据库连接成功\n');

    // 执行 SQL
    console.log('[3/3] 执行 SQL...');
    console.log('这可能需要 1-2 分钟，请耐心等待...\n');

    const startTime = Date.now();

    await pool.query(sqlContent);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`✓ SQL 执行完成 (${duration} 秒)\n`);

    // 验证数据
    console.log('====================================');
    console.log('验证数据...');
    console.log('====================================\n');

    const { rows: questions } = await pool.query('SELECT COUNT(*) as count FROM questions');
    const { rows: hints } = await pool.query('SELECT COUNT(*) as count FROM question_hints');
    const { rows: q1039 } = await pool.query("SELECT id, chinese_sentence FROM questions WHERE id = 1039");
    const { rows: h1039 } = await pool.query('SELECT question_id FROM question_hints WHERE question_id = 1039');

    console.log(`题目数量: ${questions[0].count}`);
    console.log(`提示数量: ${hints[0].count}`);
    console.log(`题目 1039: ${q1039[0]?.chinese_sentence || '不存在'}`);
    console.log(`题目 1039 的提示: ${h1039[0] ? '存在' : '不存在'}\n`);

    // 最终检查
    console.log('====================================');
    if (questions[0].count === 2068 && hints[0].count === 2068) {
      console.log('✅✅✅ 数据导入成功！');
      console.log('====================================');
      console.log('\n下一步操作:');
      console.log('1. 在 Railway 控制台点击 "Redeploy" 按钮重新部署服务');
      console.log('2. 等待部署完成后，测试前端获取题目和提示功能');
    } else {
      console.error('❌ 数据导入失败！');
      console.error(`期望: 2068 条题目, 2068 条提示`);
      console.error(`实际: ${questions[0].count} 条题目, ${hints[0].count} 条提示`);
      console.log('====================================');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ 执行失败:', error);
    console.error('\n错误详情:');
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

executeSQL();
