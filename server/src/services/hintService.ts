import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import type { Request } from 'express';
import NodeCache from 'node-cache';
import { getSupabaseClient } from '../storage/database/supabase-client';

// 创建内存缓存实例，缓存时间为 24 小时
const hintCache = new NodeCache({ stdTTL: 86400 });

/**
 * 单词提示信息
 */
interface WordHint {
  chinese: string; // 中文词
  english: string; // 英文单词
  phonetic: string; // 美式音标
  partOfSpeech: string; // 词性（中文）
  plural?: string; // 复数形式（仅名词）
  pastTense?: string; // 过去式（仅动词）
  pastParticiple?: string; // 过去分词（仅动词）
  thirdPerson?: string; // 第三人称单数（仅动词）
  presentParticiple?: string; // 现在分词（仅动词）
  examples?: string[]; // 例句（可选）
}

/**
 * 考点提示信息
 */
interface ExamPointHint {
  points: string[]; // 考查的知识点列表
  explanations: string[]; // 每个知识点的详细说明
}

/**
 * 完整提示响应
 */
interface HintResponse {
  sentenceWithHints: string; // 带提示格式的句子（我的 妈妈 是 老师。）
  words: WordHint[]; // 单词详细信息列表
  examPoints: ExamPointHint; // 考点提示
}

/**
 * 创建 LLM 客户端
 */
function createLLMClient(req?: Request) {
  const config = new Config();
  const customHeaders = req ? HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>) : undefined;

  console.log('[LLM Client] 创建 LLM 客户端', {
    hasCustomHeaders: !!customHeaders,
    COZE_PROJECT_ID: process.env.COZE_PROJECT_ID
  });

  return new LLMClient(config, customHeaders);
}

/**
 * 生成缓存键
 */
function getCacheKey(chineseSentence: string, englishReference: string): string {
  return `hint:${chineseSentence}:${englishReference}`;
}

/**
 * 从数据库获取预生成的提示
 */
async function getHintFromDatabase(questionId: number): Promise<HintResponse | null> {
  try {
    const client = getSupabaseClient();
    console.log('[Hint DB] 开始查询数据库', { questionId });

    const { data, error } = await client
      .from('question_hints')
      .select('hint_data')
      .eq('question_id', questionId)
      .maybeSingle();

    if (error) {
      console.error('[Hint DB] 数据库查询错误', { questionId, error });
      return null;
    }

    if (!data) {
      console.log('[Hint DB] 数据库中未找到提示', { questionId });
      return null;
    }

    console.log('[Hint DB] 从数据库获取提示成功', { questionId });

    // 检查 hint_data 是否是字符串，如果是则解析
    const hintData = data.hint_data as any;
    if (typeof hintData === 'string') {
      console.log('[Hint DB] hint_data 是字符串，需要解析');
      return JSON.parse(hintData) as HintResponse;
    }

    return hintData as HintResponse;
  } catch (error) {
    console.error('[Hint DB] 从数据库获取提示失败:', error);
    return null;
  }
}

/**
 * 保存提示到数据库
 */
async function saveHintToDatabase(questionId: number, hintData: HintResponse): Promise<void> {
  try {
    const client = getSupabaseClient();
    await client
      .from('question_hints')
      .upsert({
        question_id: questionId,
        hint_data: hintData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'question_id',
      });
  } catch (error) {
    console.error('保存提示到数据库失败:', error);
  }
}

/**
 * 获取题目提示（优化版：缓存 + 数据库预生成）
 */
export async function getHint(
  chineseSentence: string,
  englishReference: string,
  difficulty: string,
  req?: Request,
  questionId?: number
): Promise<HintResponse> {
  const cacheKey = getCacheKey(chineseSentence, englishReference);

  console.log('[Hint Service] 开始处理提示请求', { cacheKey, questionId });

  // 1. 先从缓存读取（最快）
  const cachedHint = hintCache.get<HintResponse>(cacheKey);
  if (cachedHint) {
    console.log('[Hint Cache] 从缓存获取提示:', cacheKey);
    return cachedHint;
  }

  // 2. 缓存未命中，尝试从数据库读取
  if (questionId) {
    const dbHint = await getHintFromDatabase(questionId);
    if (dbHint) {
      console.log('[Hint DB] 从数据库获取提示:', questionId);
      // 存入缓存
      hintCache.set(cacheKey, dbHint);
      return dbHint;
    }
    console.log('[Hint DB] 数据库中未找到提示，题目ID:', questionId);
  }

  // 3. 数据库未命中，调用 LLM 生成
  console.log('[Hint LLM] 调用 LLM 生成提示...');
  try {
    const hint = await generateHint(chineseSentence, englishReference, difficulty, req);

    // 4. 生成后，同时存入缓存和数据库
    hintCache.set(cacheKey, hint);
    if (questionId) {
      saveHintToDatabase(questionId, hint);
    }

    return hint;
  } catch (llmError) {
    console.error('[Hint LLM] LLM 生成失败，使用默认提示:', llmError);
    // LLM 调用失败时，返回一个默认提示
    const defaultHint: HintResponse = {
      sentenceWithHints: chineseSentence,
      words: [],
      examPoints: {
        points: ['语法和词汇'],
        explanations: ['请仔细思考，注意语法和词汇的正确使用。']
      }
    };
    return defaultHint;
  }
}

/**
 * 调用 LLM 生成提示（内部函数）
 */
async function generateHint(
  chineseSentence: string,
  englishReference: string,
  difficulty: string,
  req?: Request
): Promise<HintResponse> {
  const client = createLLMClient(req);

  const systemPrompt = `你是一位专业的英语翻译提示专家。请根据提供的中文句子和参考翻译，生成以下提示信息：

1. 将中文句子按最小词义单元用空格分开，每个词下方添加下划线（使用特殊标记）
2. 为每个中文词提供对应的英文翻译、美式音标、词性（使用中文）
3. 如果单词是名词，还要提供复数形式
4. 如果单词是动词，还要提供过去式、过去分词、第三人称单数、现在分词
5. 分析题目考查的知识点并给出详细说明

请严格按照以下 JSON 格式返回结果（不要返回任何其他内容）：
{
  "sentenceWithHints": "用特殊格式表示带下划线的句子，每个词之间用空格分隔，标点符号保留在原位置。格式：词词 词词。",
  "words": [
    {
      "chinese": "中文词",
      "english": "English",
      "phonetic": "/phonetic/",
      "partOfSpeech": "名词",
      "plural": "复数形式（仅名词）",
      "pastTense": "过去式（仅动词）",
      "pastParticiple": "过去分词（仅动词）",
      "thirdPerson": "第三人称单数（仅动词）",
      "presentParticiple": "现在分词（仅动词）",
      "examples": ["例句1", "例句2"]
    }
  ],
  "examPoints": {
    "points": ["知识点1", "知识点2"],
    "explanations": ["知识点1的详细说明", "知识点2的详细说明"]
  }
}

词性标注规则（必须使用中文）：
- 名词：名词
- 动词：动词（必须包含 pastTense、pastParticiple、thirdPerson、presentParticiple）
- 形容词：形容词
- 副词：副词
- 代词：代词
- 介词：介词
- 连词：连词
- 助词：助词
- 语气词：语气词
- 冠词：冠词
- 量词：量词
- 其他：其他

音标格式：
- 必须使用美式音标
- 格式：/word/ 或 /wɜːrd/

名词规则：
- plural：规则名词加 -s 或 -es，不规则名词列出正确形式
- 如果单词不是名词或不可变形，plural 为空字符串

动词规则：
- pastTense：规则动词加 -ed，不规则动词列出正确形式
- pastParticiple：规则动词加 -ed，不规则动词列出正确形式
- thirdPerson：规则动词加 -s 或 -es，不规则动词列出正确形式（如 has）
- presentParticiple：规则动词加 -ing，不规则动词列出正确形式
- 如果单词不是动词或不可变形，这些字段都为空字符串

示例：
中文：我的妈妈是老师。
参考翻译：My mother is a teacher.

返回：
{
  "sentenceWithHints": "我的 妈妈 是 老师。",
  "words": [
    {
      "chinese": "我的",
      "english": "my",
      "phonetic": "/maɪ/",
      "partOfSpeech": "代词",
      "examples": ["My book is on the desk.", "This is my friend."]
    },
    {
      "chinese": "妈妈",
      "english": "mother",
      "phonetic": "/ˈmʌðər/",
      "partOfSpeech": "名词",
      "plural": "mothers",
      "examples": ["My mother is a teacher.", "She is a mother of three."]
    },
    {
      "chinese": "是",
      "english": "is",
      "phonetic": "/ɪz/",
      "partOfSpeech": "动词",
      "pastTense": "was",
      "pastParticiple": "been",
      "thirdPerson": "is",
      "presentParticiple": "being",
      "examples": ["She is happy.", "He is a student."]
    },
    {
      "chinese": "老师",
      "english": "teacher",
      "phonetic": "/ˈtiːtʃər/",
      "partOfSpeech": "名词",
      "plural": "teachers",
      "examples": ["She is a good teacher.", "The teacher is kind."]
    }
  ],
  "examPoints": {
    "points": ["系动词 be", "名词单数形式"],
    "explanations": [
      "be 动词有三种形式：am（用于 I）、is（用于第三人称单数）、are（用于复数和 you）。本句主语是单数，所以用 is。",
      "可数名词单数前通常加不定冠词 a 或 an。teacher 以辅音音素开头，所以用 a。"
    ]
  }
}`;

  const userPrompt = `中文句子：${chineseSentence}
参考翻译：${englishReference}
难度等级：${difficulty}

请分析并生成提示信息。`;

  try {
    console.log('[Hint LLM] 开始调用 LLM');
    console.log('[Hint LLM] 模型: doubao-seed-1-8-251228');
    console.log('[Hint LLM] 温度: 0.3');

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    console.log('[Hint LLM] 消息准备完成，systemPrompt 长度:', systemPrompt.length);
    console.log('[Hint LLM] 开始调用 client.invoke...');

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.3,
    });

    console.log('[Hint LLM] client.invoke 调用成功');
    console.log('[Hint LLM] 响应类型:', typeof response);
    console.log('[Hint LLM] 响应内容:', response?.content?.substring(0, 100) || 'No content');

    // 尝试解析 JSON 响应
    const content = response.content.trim();
    console.log('[Hint LLM] 内容长度:', content.length);

    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('[Hint LLM] 无法从响应中提取 JSON，响应内容:', content.substring(0, 500));
      throw new Error('LLM 返回的不是有效的 JSON 格式');
    }

    console.log('[Hint LLM] JSON 匹配成功');
    const result = JSON.parse(jsonMatch[0]) as HintResponse;
    console.log('[Hint LLM] 解析成功');

    return result;
  } catch (error) {
    console.error('[Hint LLM] 获取提示失败:', error);
    console.error('[Hint LLM] 错误详情:', error instanceof Error ? error.stack : 'No stack trace');
    throw new Error('获取提示失败，请稍后重试');
  }
}

export type { WordHint, ExamPointHint, HintResponse };
