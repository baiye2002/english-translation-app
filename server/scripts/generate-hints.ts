import { getSupabaseClient } from '../src/storage/database/supabase-client';
import { getHint } from '../src/services/hintService';

/**
 * 为题库中的所有题目预生成提示
 */
async function generateHintsForQuestions() {
  const client = getSupabaseClient();

  try {
    console.log('开始获取需要生成提示的题目...');

    // 分批获取所有题目（Supabase 默认限制 1000 条）
    let allQuestions: any[] = [];
    let offset = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: questions, error: questionsError } = await client
        .from('questions')
        .select('id, difficulty, chinese_sentence, english_reference')
        .order('id', { ascending: true })
        .range(offset, offset + batchSize - 1);

      if (questionsError) {
        throw new Error(`获取题目失败: ${questionsError.message}`);
      }

      if (!questions || questions.length === 0) {
        hasMore = false;
        break;
      }

      allQuestions = allQuestions.concat(questions);

      if (questions.length < batchSize) {
        hasMore = false;
      } else {
        offset += batchSize;
      }
    }

    console.log(`共找到 ${allQuestions.length} 道题目`);

    // 获取已经有提示的题目 ID
    const { data: existingHints, error: hintsError } = await client
      .from('question_hints')
      .select('question_id');

    if (hintsError) {
      throw new Error(`获取已有提示失败: ${hintsError.message}`);
    }

    const existingHintIds = new Set(existingHints?.map(h => h.question_id) || []);
    const questionsToProcess = allQuestions.filter(q => !existingHintIds.has(q.id));

    console.log(`需要生成提示的题目数量: ${questionsToProcess.length}`);
    console.log(`已有提示的题目数量: ${existingHintIds.size}`);
    console.log('');

    if (questionsToProcess.length === 0) {
      console.log('所有题目都已生成提示！');
      return;
    }

    // 逐个生成提示
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < questionsToProcess.length; i++) {
      const question = questionsToProcess[i];
      const progress = ((i + 1) / questionsToProcess.length * 100).toFixed(2);

      process.stdout.write(`\r进度: ${progress}% (${i + 1}/${questionsToProcess.length}) - 正在生成提示: ${question.chinese_sentence.substring(0, 30)}...`);

      try {
        // 调用 getHint 函数生成提示（会自动保存到数据库）
        await getHint(
          question.chinese_sentence,
          question.english_reference,
          question.difficulty,
          undefined,
          question.id
        );

        successCount++;
      } catch (error) {
        console.error(`\n❌ 生成提示失败 (题目ID: ${question.id}):`, error);
        failCount++;
      }

      // 避免请求过快，添加延迟
      if (i < questionsToProcess.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n');
    console.log('========================================');
    console.log('提示生成完成！');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${failCount} 条`);
    console.log(`总计: ${questionsToProcess.length} 条`);
    console.log('========================================');

  } catch (error) {
    console.error('预生成提示失败:', error);
    process.exit(1);
  }
}

// 运行预生成脚本
generateHintsForQuestions();
