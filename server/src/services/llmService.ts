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

  // 从环境变量读取模型名称，默认使用 doubao-seed-1-8-251228
  const model = process.env.DOUBAO_MODEL || 'doubao-seed-1-8-251228';

  console.log('[LLM Client] 创建 OpenAI 客户端', {
    apiKeyLength: apiKey.length,
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    model
  });

  // 使用 OpenAI SDK，设置火山引擎的 base_url
  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  });

  return { client, model };
}

/**
 * 评判翻译质量
 */
export async function evaluateTranslation(
  request: EvaluateTranslationRequest
): Promise<EvaluateTranslationResponse> {
  const { chineseSentence, userAnswer, referenceAnswer, difficulty } = request;

  const { client, model } = createLLMClient();

  const systemPrompt = `你是英语翻译评判专家。评判标准：
1. 翻译与参考答案完全一致 → score=100, isCorrect=true
2. 翻译完全正确、表达地道 → score=95-99, isCorrect=true
3. 翻译基本正确但不够地道 → score=70-89, isCorrect=true
4. 翻译有语法错误或表达不地道 → score<70, isCorrect=false

必须返回严格JSON格式（不要其他内容）：
{
  "isCorrect": true/false,
  "score": 数字(0-100),
  "feedback": "中文反馈(50-100字)",
  "referenceAnswer": "参考翻译",
  "errorPoints": ["错误点1", ...], // 无错误则为[]
  "correctUsage": "正确用法说明(50-150字)",
  "knowledgePoints": ["知识点1", ...] // 简短(10-20字)
}

注意：
- referenceAnswer必须使用题目提供的参考翻译
- 简单词汇完全正确必须给100分
- errorPoints要具体明确
- correctUsage说明语法结构和词汇用法
- knowledgePoints列出考查的语法点和词汇点`;

  const userPrompt = `中文：${chineseSentence}
参考：${referenceAnswer}
用户：${userAnswer}
难度：${difficulty}`;

  try {
    console.log('[LLM Client] 开始调用豆包 API');

    // 使用 OpenAI SDK 调用火山引擎 API
    const response = await client.responses.create({
      model,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      // 优化参数：降低随机性，加快推理
      temperature: 0,  // 完全确定性，最快
      // 注意：火山引擎 responses.create API 不支持 max_tokens 参数
    });

    console.log('[LLM Client] 豆包 API 响应:', JSON.stringify(response, null, 2));

    // 提取响应内容
    // 火山引擎豆包 API 响应结构：response.output 是一个数组
    // output[0] 通常是推理过程（reasoning），output[1] 是实际回复
    // 我们需要找到 type="message" 的输出项
    const output = response.output as any[];

    console.log('[LLM Client] output 数组长度:', output?.length || 0);

    // 查找实际的回复内容
    let messageOutput = null;
    for (let i = 0; i < (output?.length || 0); i++) {
      const item = output[i];
      console.log(`[LLM Client] output[${i}] type:`, item.type);

      // 跳过推理过程
      if (item.type === 'reasoning' || item.type === 'summary') {
        continue;
      }

      // 找到消息输出
      if (item.type === 'message' || (!item.type && item.content)) {
        messageOutput = item;
        break;
      }
    }

    // 如果没有找到，尝试使用最后一个输出
    if (!messageOutput && output && output.length > 0) {
      messageOutput = output[output.length - 1];
    }

    if (!messageOutput) {
      console.error('[LLM Client] 未找到有效的消息输出');
      throw new Error('LLM 返回的响应格式不正确');
    }

    console.log('[LLM Client] 找到消息输出:', JSON.stringify(messageOutput, null, 2));

    // 提取文本内容
    const content = messageOutput.content?.[0]?.text;

    if (!content) {
      console.error('[LLM Client] 消息输出中没有 text 字段');
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
