/**
 * 导出 question_hints 表的数据到 SQL 文件
 */

import { getSupabaseClient } from '../src/storage/database/supabase-client';

interface QuestionHint {
  question_id: number;
  hint_data: any;
  created_at?: string;
}

async function exportQuestionHints() {
  console.log('开始导出 question_hints 表数据...');

  const client = getSupabaseClient();

  // 查询所有提示数据
  const { data: hints, error } = await client
    .from('question_hints')
    .select('*')
    .order('question_id');

  if (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }

  console.log(`找到 ${hints.length} 条提示数据`);

  // 生成 SQL INSERT 语句
  const sqlStatements: string[] = [];

  sqlStatements.push('-- 导出 question_hints 表数据');
  sqlStatements.push(`-- 导出时间: ${new Date().toISOString()}`);
  sqlStatements.push(`-- 总记录数: ${hints.length}`);
  sqlStatements.push('');

  for (const hint of hints as QuestionHint[]) {
    // 将 hint_data 对象转换为 JSON 字符串，并转义单引号
    const hintDataJson = JSON.stringify(hint.hint_data).replace(/'/g, "''");

    const sql = `INSERT INTO question_hints (question_id, hint_data) VALUES (${hint.question_id}, '${hintDataJson}');`;

    sqlStatements.push(sql);
  }

  sqlStatements.push('');
  sqlStatements.push('-- 导出完成');

  // 写入文件
  const fs = await import('fs');
  const path = await import('path');

  const outputPath = path.join(process.cwd(), 'question_hints_export.sql');
  fs.writeFileSync(outputPath, sqlStatements.join('\n'), 'utf-8');

  console.log(`导出成功！文件保存到: ${outputPath}`);
  console.log(`导出了 ${hints.length} 条提示数据`);
}

exportQuestionHints();
