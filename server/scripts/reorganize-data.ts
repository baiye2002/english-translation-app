/**
 * 导出并重新组织数据
 * 使题目 ID 连续（从 1 到 2068）
 */

import { getSupabaseClient } from '../src/storage/database/supabase-client';

interface Question {
  id: number;
  chinese_sentence: string;
  english_reference: string;
  difficulty: string;
  created_at?: string;
}

interface QuestionHint {
  question_id: number;
  hint_data: any;
  created_at?: string;
}

async function reorganizeData() {
  console.log('开始导出并重新组织数据...');

  const client = getSupabaseClient();

  // 1. 导出所有题目（使用分页）
  console.log('导出题目数据...');
  const allQuestions: Question[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data: questions, error: questionsError } = await client
      .from('questions')
      .select('*')
      .order('id')
      .range(from, to);

    if (questionsError) {
      console.error(`导出题目失败（第 ${page + 1} 页）:`, questionsError);
      process.exit(1);
    }

    if (questions && questions.length > 0) {
      allQuestions.push(...questions);
      console.log(`  已导出 ${allQuestions.length} 条题目...`);
    }

    hasMore = questions && questions.length === pageSize;
    page++;
  }

  console.log(`✓ 导出了 ${allQuestions.length} 条题目`);

  // 2. 导出所有提示（使用分页）
  console.log('导出提示数据...');
  const allHints: QuestionHint[] = [];
  page = 0;
  hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data: hints, error: hintsError } = await client
      .from('question_hints')
      .select('*')
      .order('question_id')
      .range(from, to);

    if (hintsError) {
      console.error(`导出提示失败（第 ${page + 1} 页）:`, hintsError);
      process.exit(1);
    }

    if (hints && hints.length > 0) {
      allHints.push(...hints);
      console.log(`  已导出 ${allHints.length} 条提示...`);
    }

    hasMore = hints && hints.length === pageSize;
    page++;
  }

  console.log(`✓ 导出了 ${allHints.length} 条提示`);

  // 3. 创建旧 ID 到新 ID 的映射
  console.log('创建 ID 映射...');
  const oldIdToNewId = new Map<number, number>();
  allQuestions.forEach((q: Question, index: number) => {
    const newId = index + 1;
    oldIdToNewId.set(q.id, newId);
  });

  console.log('ID 映射示例（前 10 条）:');
  let count = 0;
  for (const [oldId, newId] of oldIdToNewId) {
    console.log(`  旧 ID ${oldId} → 新 ID ${newId}`);
    if (++count >= 10) break;
  }

  // 4. 重新组织题目数据
  console.log('重新组织题目数据...');
  const reorganizedQuestions = allQuestions.map((q: Question, index: number) => ({
    newId: index + 1,
    chinese_sentence: q.chinese_sentence,
    english_reference: q.english_reference,
    difficulty: q.difficulty,
  }));

  // 5. 重新组织提示数据
  console.log('重新组织提示数据...');
  const reorganizedHints = allHints.map((h: QuestionHint) => {
    const newQuestionId = oldIdToNewId.get(h.question_id);
    if (!newQuestionId) {
      console.error(`警告：找不到题目 ID ${h.question_id} 的新 ID`);
    }
    return {
      newQuestionId: newQuestionId || h.question_id,
      hint_data: h.hint_data,
    };
  });

  console.log('提示数据重组完成');

  // 6. 生成 SQL 脚本
  console.log('生成 SQL 脚本...');
  const sqlStatements: string[] = [];

  sqlStatements.push('-- 清空现有数据');
  sqlStatements.push('DELETE FROM question_hints;');
  sqlStatements.push('DELETE FROM questions;');
  sqlStatements.push('');

  sqlStatements.push('-- 重置自增序列');
  sqlStatements.push('ALTER SEQUENCE questions_id_seq RESTART WITH 1;');
  sqlStatements.push('');

  sqlStatements.push('-- 插入题目数据（新 ID：1-2068）');
  for (const q of reorganizedQuestions) {
    const escapedChinese = q.chinese_sentence.replace(/'/g, "''");
    const escapedEnglish = q.english_reference.replace(/'/g, "''");
    const escapedDifficulty = q.difficulty.replace(/'/g, "''");

    sqlStatements.push(
      `INSERT INTO questions (id, chinese_sentence, english_reference, difficulty) VALUES (${q.newId}, '${escapedChinese}', '${escapedEnglish}', '${escapedDifficulty}');`
    );
  }

  // 7. 写入 SQL 文件
  const fs = await import('fs');
  const path = await import('path');

  const outputPath = path.join(process.cwd(), 'REORGANIZED_DATA.sql');
  fs.writeFileSync(outputPath, sqlStatements.join('\n'), 'utf-8');

  console.log(`SQL 脚本已生成：${outputPath}`);

  // 8. 统计信息
  console.log('\n=== 数据重组统计 ===');
  console.log(`原始题目数量：${allQuestions.length}`);
  console.log(`原始提示数量：${allHints.length}`);
  console.log(`新题目 ID 范围：1-${reorganizedQuestions.length}`);
  console.log(`新提示数量：${reorganizedHints.length}`);
  console.log('\n提示数据预览（前 3 条）:');
  reorganizedHints.slice(0, 3).forEach((h, index) => {
    console.log(`  ${index + 1}. 新题目 ID ${h.newQuestionId}`);
  });

  // 9. 生成提示数据的 SQL
  console.log('\n生成提示数据的 SQL...');
  const hintSqlStatements: string[] = [];
  hintSqlStatements.push('');
  hintSqlStatements.push('-- 插入提示数据');
  for (const h of reorganizedHints) {
    const hintDataJson = JSON.stringify(h.hint_data).replace(/'/g, "''");
    hintSqlStatements.push(
      `INSERT INTO question_hints (question_id, hint_data) VALUES (${h.newQuestionId}, '${hintDataJson}');`
    );
  }

  // 追加到 SQL 文件
  fs.appendFileSync(outputPath, '\n' + hintSqlStatements.join('\n'), 'utf-8');

  console.log(`提示数据 SQL 已追加到：${outputPath}`);

  console.log('\n✅ 数据重组完成！');
  console.log(`\n下一步：在 Supabase 中执行以下 SQL 文件：`);
  console.log(`  ${outputPath}`);
}

reorganizeData();
