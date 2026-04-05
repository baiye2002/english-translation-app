/**
 * 检查生产环境数据库的所有表
 */

import { createClient } from '@supabase/supabase-js';

const PRODUCTION_URL = 'https://eknfiycdhykfcdldnwbj.supabase.co';
const PRODUCTION_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw';

const productionClient = createClient(PRODUCTION_URL, PRODUCTION_SERVICE_ROLE_KEY);

async function checkAllTables() {
  console.log('检查生产环境数据库的所有表...');

  // 使用 SQL 查询所有表
  const { data, error } = await productionClient.rpc('get_all_tables');

  if (error) {
    console.error('查询表失败:', error);

    // 尝试使用另一种方式
    const tables = [
      'questions',
      'question_hints',
      'practice_answers',
      'competition_answers',
      'users',
      'profiles'
    ];

    console.log('\n尝试删除这些表的数据...');
    for (const table of tables) {
      try {
        const { count } = await productionClient
          .from(table)
          .select('*', { count: 'exact', head: true });
        console.log(`${table}: ${count} 条记录`);
      } catch (e: any) {
        console.log(`${table}: 表不存在或无权限 (${e.message})`);
      }
    }
  } else {
    console.log('所有表:', data);
  }
}

checkAllTables();
