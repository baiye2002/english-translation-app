import { getSupabaseClient } from '../src/storage/database/supabase-client';

async function reorganizeInDatabase() {
  console.log('[Reorganize] 开始在数据库中重组数据...');

  const client = getSupabaseClient();

  try {
    // 1. 读取所有数据
    console.log('[Reorganize] 读取所有数据...');

    const { data: allQuestions, error: questionsError } = await client
      .from('questions')
      .select('*')
      .order('id');

    if (questionsError) {
      throw new Error(`读取题目失败: ${questionsError.message}`);
    }

    const { data: allHints, error: hintsError } = await client
      .from('question_hints')
      .select('*')
      .order('question_id');

    if (hintsError) {
      throw new Error(`读取提示失败: ${hintsError.message}`);
    }

    console.log(`[Reorganize] 读取到 ${allQuestions.length} 道题目和 ${allHints.length} 条提示`);

    if (allQuestions.length === 0) {
      throw new Error('没有读取到任何题目数据！');
    }

    // 2. 创建 ID 映射
    const oldIdToNewId = new Map<number, number>();
    allQuestions.forEach((q: any, index: number) => {
      oldIdToNewId.set(q.id, index + 1);
    });

    console.log('[Reorganize] ID 映射创建完成');

    // 3. 清空数据表
    console.log('[Reorganize] 清空数据表...');
    const { error: deleteHintsError } = await client.from('question_hints').delete().neq('question_id', 0);
    if (deleteHintsError) {
      throw new Error(`清空提示表失败: ${deleteHintsError.message}`);
    }

    const { error: deleteQuestionsError } = await client.from('questions').delete().neq('id', 0);
    if (deleteQuestionsError) {
      throw new Error(`清空题目表失败: ${deleteQuestionsError.message}`);
    }
    console.log('[Reorganize] ✓ 数据表清空完成');

    // 4. 重新插入题目数据
    console.log('[Reorganize] 重新插入题目数据...');

    let successQuestions = 0;
    let errorQuestions = 0;

    for (let i = 0; i < allQuestions.length; i++) {
      const q = allQuestions[i];
      const newId = i + 1;

      try {
        const { error } = await client.from('questions').insert({
          id: newId,
          chinese_sentence: q.chinese_sentence,
          english_reference: q.english_reference,
          difficulty: q.difficulty,
          user_id: q.user_id,
          created_at: q.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (error) {
          throw error;
        }

        successQuestions++;
      } catch (error: any) {
        console.error(`[Reorganize] 插入题目失败 (ID: ${newId}):`, error.message);
        errorQuestions++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`[Reorganize] 题目进度: ${i + 1}/${allQuestions.length} (成功: ${successQuestions}, 失败: ${errorQuestions})`);
      }
    }

    console.log(`[Reorganize] ✓ 题目插入完成 (成功: ${successQuestions}, 失败: ${errorQuestions})`);

    if (successQuestions === 0) {
      throw new Error('没有成功插入任何题目！');
    }

    // 5. 重新插入提示数据
    console.log('[Reorganize] 重新插入提示数据...');

    let successHints = 0;
    let errorHints = 0;

    for (let i = 0; i < allHints.length; i++) {
      const h = allHints[i];
      const oldId = h.question_id;
      const newId = oldIdToNewId.get(oldId);

      if (!newId) {
        console.warn(`[Reorganize] 警告: 提示的题目 ID ${oldId} 没有对应的旧题目`);
        continue;
      }

      try {
        const { error } = await client.from('question_hints').insert({
          question_id: newId,
          hint_data: h.hint_data,
          created_at: h.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (error) {
          throw error;
        }

        successHints++;
      } catch (error: any) {
        console.error(`[Reorganize] 插入提示失败 (question_id: ${newId}):`, error.message);
        errorHints++;
      }

      if ((i + 1) % 100 === 0) {
        console.log(`[Reorganize] 提示进度: ${i + 1}/${allHints.length} (成功: ${successHints}, 失败: ${errorHints})`);
      }
    }

    console.log(`[Reorganize] ✓ 提示插入完成 (成功: ${successHints}, 失败: ${errorHints})`);

    // 6. 验证数据
    console.log('[Reorganize] 验证数据...');

    // 等待一下，确保数据已提交
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { count: questionCount } = await client.from('questions').select('*', { count: 'exact', head: true });
    const { count: hintCount } = await client.from('question_hints').select('*', { count: 'exact', head: true });

    console.log(`[Reorganize] 题目数量: ${questionCount}`);
    console.log(`[Reorganize] 提示数量: ${hintCount}`);

    // 检查题目 858 和 139
    const { data: q858 } = await client.from('questions').select('chinese_sentence').eq('id', 858).maybeSingle();
    const { data: q139 } = await client.from('questions').select('chinese_sentence').eq('id', 139).maybeSingle();

    console.log(`[Reorganize] 题目 858:`, q858?.chinese_sentence || '不存在');
    console.log(`[Reorganize] 题目 139:`, q139?.chinese_sentence || '不存在');

    if (questionCount === allQuestions.length && hintCount === allHints.length) {
      console.log('[Reorganize] ✓✓✓ 数据重组成功！');
    } else {
      console.error(`[Reorganize] ✗✗✗ 数据验证失败！期望: 题目 ${allQuestions.length}, 提示 ${allHints.length}, 实际: 题目 ${questionCount}, 提示 ${hintCount}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('[Reorganize] 重组失败:', error);
    process.exit(1);
  }
}

reorganizeInDatabase();
