/**
 * 查询生产环境表结构
 */

import { createClient } from '@supabase/supabase-js';

const PRODUCTION_URL = 'https://eknfiycdhykfcdldnwbj.supabase.co';
const PRODUCTION_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrbmZpeWNkaHlrZmNkbGRud2JqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxODM3MiwiZXhwIjoyMDkwNzk0MzcyfQ.0C4owyPmyH7Fr3MzHVW5vwISyBlzyGuLt3cwfxPk4Sw';

const client = createClient(PRODUCTION_URL, PRODUCTION_SERVICE_ROLE_KEY);

async function getTableSchema() {
  console.log('查询生产环境表结构...\n');

  // 尝试查询第一条数据，查看字段结构
  const { data: questions, error: qError } = await client
    .from('questions')
    .select('*')
    .limit(1);

  if (qError) {
    console.log('查询 questions 表失败:', qError.message);
  } else if (questions && questions.length > 0) {
    console.log('questions 表字段:', Object.keys(questions[0]));
    console.log('示例数据:', JSON.stringify(questions[0], null, 2));
  } else {
    console.log('questions 表为空');
  }

  const { data: hints, error: hError } = await client
    .from('question_hints')
    .select('*')
    .limit(1);

  if (hError) {
    console.log('\n查询 question_hints 表失败:', hError.message);
  } else if (hints && hints.length > 0) {
    console.log('\nquestion_hints 表字段:', Object.keys(hints[0]));
    console.log('示例数据:', JSON.stringify(hints[0], null, 2));
  } else {
    console.log('\nquestion_hints 表为空');
  }

  // 统计当前数据量
  const { count: qCount } = await client
    .from('questions')
    .select('*', { count: 'exact', head: true });

  const { count: hCount } = await client
    .from('question_hints')
    .select('*', { count: 'exact', head: true });

  console.log(`\n当前数据量: ${qCount} 条题目, ${hCount} 条提示`);
}

getTableSchema();
