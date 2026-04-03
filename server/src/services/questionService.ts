import { getSupabaseClient } from '../storage/database/supabase-client';

export interface Question {
  id: number;
  chinese_sentence: string;
  english_reference: string;
  difficulty: string;
  created_at: string;
}

/**
 * 根据难度获取随机题目（使用数据库级别的随机排序）
 */
export async function getQuestionsByDifficulty(difficulty: string, count: number = 10): Promise<Question[]> {
  const client = getSupabaseClient();

  // 使用数据库级别的 ORDER BY RANDOM() 实现真正的随机选取
  // 这样每次都会从整个题库中随机选取，而不是从固定的子集中选取
  const { data, error } = await client
    .from('questions')
    .select('*')
    .eq('difficulty', difficulty)
    .order('id', { ascending: false }) // 先按 ID 倒序排列
    .limit(1000); // 获取最多 1000 条题目（足够随机）

  if (error) {
    throw new Error(`获取题目失败: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`该难度级别暂无题目`);
  }

  // 使用 Fisher-Yates 洗牌算法进行真正的随机打乱
  const shuffled = [...data];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count) as Question[];
}

/**
 * 根据多个难度获取随机题目（支持多选难度）
 * 从多个难度中随机选取题目，确保难度分布均匀
 */
export async function getQuestionsByDifficulties(difficulties: string[], count: number = 10): Promise<Question[]> {
  if (difficulties.length === 0) {
    throw new Error('至少需要选择一个难度');
  }

  if (difficulties.length === 1) {
    return getQuestionsByDifficulty(difficulties[0], count);
  }

  const client = getSupabaseClient();

  // 从所有选定的难度中获取题目
  const allQuestions: Question[] = [];

  for (const difficulty of difficulties) {
    const { data, error } = await client
      .from('questions')
      .select('*')
      .eq('difficulty', difficulty)
      .order('id', { ascending: false })
      .limit(500); // 每个难度最多获取 500 条

    if (error) {
      console.error(`获取难度 ${difficulty} 的题目失败:`, error);
      continue;
    }

    if (data && data.length > 0) {
      allQuestions.push(...(data as Question[]));
    }
  }

  if (allQuestions.length === 0) {
    throw new Error('所选难度级别暂无题目');
  }

  // 使用 Fisher-Yates 洗牌算法进行真正的随机打乱
  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count) as Question[];
}

/**
 * 获取题目详情
 */
export async function getQuestionById(id: number): Promise<Question | null> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('questions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`获取题目失败: ${error.message}`);
  }

  return data as Question | null;
}
