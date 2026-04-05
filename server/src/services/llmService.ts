import OpenAI from 'openai';

/**
 * 翻译评判请求
 */
interface EvaluateTranslationRequest {
  chineseSentence: string;
  userAnswer: string;
  referenceAnswer: string;
  difficulty: string;
}

/**
 * 翻译评判响应
 */
interface EvaluateTranslationResponse {
  isCorrect: boolean;
  score: number; // 0-100
  feedback: string;
  referenceAnswer: string; // 正确的翻译
  errorPoints: string[]; // 错误点列表
  correctUsage: string; // 正确用法说明
  knowledgePoints: string[]; // 考察的知识点
}

/**
 * 创建 LLM 客户端
 */
function createLLMClient() {
  // 打印所有相关的环境变量，用于调试
  const envKeys = {
    COZE_WORKLOAD_IDENTITY_API_KEY: process.env.COZE_WORKLOAD_IDENTITY_API_KEY?.substring(0, 10) + '...',
    ARK_API_KEY: process.env.ARK_API_KEY?.substring(0, 10) + '...',
    COZE_PROJECT_ID: process.env.COZE_PROJECT_ID,
    API_KEY: process.env.API_KEY?.substring(0, 10) + '...',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY?.substring(0, 10) + '...'
  };
  console.log('[LLM Client] 环境变量检查:', envKeys);

  // 使用豆包火山引擎 API Key
  const apiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY ||
                 process.env.ARK_API_KEY ||
                 process.env.API_KEY;

  if (!apiKey) {
    throw new Error('未配置 API Key，请设置 COZE_WORKLOAD_IDENTITY_API_KEY 或 ARK_API_KEY 环境变量');
  }

  console.log('[LLM Client] 创建 OpenAI 客户端', {
    apiKeyLength: apiKey.length,
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-seed-1-8-251228'
  });

  // 使用 OpenAI SDK，设置火山引擎的 base_url
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  });

  return client;
}

/**
 * 评判翻译质量
 */
export async function evaluateTranslation(
  request: EvaluateTranslationRequest
): Promise<EvaluateTranslationResponse> {
  const { chineseSentence, userAnswer, referenceAnswer, difficulty } = request;

  const client = createLLMClient();

  const systemPrompt = `你是一位专业的英语翻译评判专家。请根据以下标准评判用户的翻译：

1. 语法正确性
2. 表达地道性
3. 是否准确传达了原句意思

请严格按照以下 JSON 格式返回结果（不要返回任何其他内容）：
{
  "isCorrect": true/false,
  "score": 0-100的数字,
  "feedback": "鼓励或纠正的中文反馈，50-100字",
  "referenceAnswer": "参考翻译（使用题目提供的参考答案）",
  "errorPoints": ["错误点1", "错误点2", ...], // 用户翻译中的错误点，如果没有错误则为空数组 []
  "correctUsage": "正确的用法说明，包括正确的表达方式和语法结构，50-150字",
  "knowledgePoints": ["知识点1", "知识点2", ...] // 本题考察的英语知识点，如：时态、固定搭配、词汇用法等
}

评判标准：
- 如果翻译完全正确、表达地道，isCorrect 为 true，score >= 90
- 如果翻译基本正确但不够地道，isCorrect 为 true，score 70-89
- 如果翻译有语法错误或表达不地道，isCorrect 为 false，score < 70
- 难度越高，评分标准越严格
- referenceAnswer 字段必须使用题目提供的参考翻译，不得修改

errorPoints 填写要求：
- 指出具体的语法错误、拼写错误、表达错误
- 如果翻译完全正确，返回空数组 []
- 每个错误点要具体、明确

correctUsage 填写要求：
- 说明正确的语法结构
- 解释正确的词汇搭配
- 提供地道的表达方式
- 可以给出类似的表达示例

knowledgePoints 填写要求：
- 列出本题考察的语法点（如：一般现在时、现在进行时、定语从句等）
- 列出考察的词汇点（如：固定搭配、短语动词等）
- 列出考察的表达技巧（如：时态转换、语态转换等）
- 每个知识点要简洁明了，10-20字

示例（用户翻译有错误）：
{
  "isCorrect": false,
  "score": 65,
  "feedback": "你的翻译基本意思正确，但存在语法错误，需要加强时态的运用。",
  "referenceAnswer": "I went to the park yesterday",
  "errorPoints": ["使用了现在时 'go'，应该用过去时 'went'", "缺少时间状语 'yesterday'"],
  "correctUsage": "这个句子需要使用一般过去时，表示过去发生的动作。正确的结构是：主语 + 动词过去式 + 地点 + 时间。'go' 的过去式是 'went'。例如：I went to school yesterday.",
  "knowledgePoints": ["一般过去时", "时间状语", "不规则动词变化"]
}

示例（用户翻译正确）：
{
  "isCorrect": true,
  "score": 95,
  "feedback": "翻译正确！你对过去时的掌握很好，表达也很地道。",
  "referenceAnswer": "I went to the park yesterday",
  "errorPoints": [],
  "correctUsage": "正确使用了一般过去时 'went' 来表示昨天发生的动作。动词 'go' 的过去式是 'went'。时间状语 'yesterday' 放在句末，符合英语习惯。",
  "knowledgePoints": ["一般过去时", "不规则动词", "时间状语位置"]
}`;

  const userPrompt = `中文原句：${chineseSentence}
参考翻译：${referenceAnswer}
用户翻译：${userAnswer}
难度等级：${difficulty}

请评判用户的翻译质量。`;

  try {
    console.log('[LLM Client] 开始调用豆包 API');

    // 使用 OpenAI SDK 调用火山引擎 API
    const response = await client.responses.create({
      model: 'doubao-seed-1-8-251228',
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    console.log('[LLM Client] 豆包 API 响应:', JSON.stringify(response, null, 2));

    // 提取响应内容
    const content = response.output?.[0]?.content?.[0]?.text;

    if (!content) {
      throw new Error('LLM 返回的响应为空');
    }

    // 尝试解析 JSON 响应
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('LLM 返回的不是有效的 JSON 格式');
    }

    const result = JSON.parse(jsonMatch[0]) as EvaluateTranslationResponse;

    console.log('[LLM Client] 解析结果:', result);

    return result;
  } catch (error) {
    console.error('[LLM Client] LLM 评判失败:', error);
    throw new Error('翻译评判失败，请稍后重试');
  }
}
