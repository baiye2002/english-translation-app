import { getSupabaseClient } from '../src/storage/database/supabase-client';

/**
 * 查看数据库中的题目统计
 */
async function checkQuestionCount() {
  try {
    const client = getSupabaseClient();

    console.log('正在查询数据库中的题目数量...\n');

    // 查询每个难度的题目数量
    const { data: questions, error } = await client
      .from('questions')
      .select('difficulty')
      .order('difficulty');

    if (error) {
      console.error('查询失败:', error.message);
      return;
    }

    if (!questions || questions.length === 0) {
      console.log('⚠️  数据库中没有题目数据！');
      console.log('需要先执行 SQL 脚本导入题目数据。');
      return;
    }

    // 统计每个难度的数量
    const countMap = new Map<string, number>();
    questions.forEach(q => {
      const count = countMap.get(q.difficulty) || 0;
      countMap.set(q.difficulty, count + 1);
    });

    console.log('📊 数据库中的题目统计：\n');

    const difficulties = [
      '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
      '初中一年级', '初中二年级', '初中三年级',
      '高中一年级', '高中二年级', '高中三年级',
      '大学'
    ];

    let total = 0;
    difficulties.forEach(diff => {
      const count = countMap.get(diff) || 0;
      total += count;
      console.log(`  ${diff}: ${count} 道`);
    });

    console.log(`\n  总计: ${total} 道题目`);

    // 显示前 5 道题目示例
    console.log('\n📝 前 5 道题目示例：\n');
    const { data: sampleQuestions } = await client
      .from('questions')
      .select('id, chinese_sentence, english_reference, difficulty')
      .limit(5);

    if (sampleQuestions && sampleQuestions.length > 0) {
      sampleQuestions.forEach((q, index) => {
        console.log(`${index + 1}. [${q.difficulty}] ${q.chinese_sentence}`);
        console.log(`   ${q.english_reference}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('查询失败:', error);
  }
}

checkQuestionCount();
