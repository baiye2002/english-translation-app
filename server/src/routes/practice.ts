import express from 'express';
import type { Request, Response } from 'express';
import { getQuestionsByDifficulty } from '../services/questionService';
import { evaluateTranslation } from '../services/llmService';
import { getHint } from '../services/hintService';
import { getSupabaseClient } from '../storage/database/supabase-client';

const router = express.Router();

/**
 * GET /api/v1/practice/questions/:difficulty
 * 获取指定难度的5道题目
 */
router.get('/questions/:difficulty', async (req: Request, res: Response) => {
  try {
    const difficultyParam = req.params.difficulty;
    const difficulty = Array.isArray(difficultyParam) ? difficultyParam[0] : difficultyParam;

    // 验证难度级别
    const validDifficulties = [
      '小学一年级', '小学二年级', '小学三年级', '小学四年级', '小学五年级', '小学六年级',
      '初中一年级', '初中二年级', '初中三年级',
      '高中一年级', '高中二年级', '高中三年级',
      '大学'
    ];

    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ error: '无效的难度级别' });
    }

    const questions = await getQuestionsByDifficulty(difficulty, 5);

    // 返回题目（不包含参考答案）
    const questionsForClient = questions.map((q: any) => ({
      id: q.id,
      chineseSentence: q.chinese_sentence,
    }));

    res.json({ questions: questionsForClient });
  } catch (error) {
    console.error('获取题目失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '获取题目失败' });
  }
});

/**
 * GET /api/v1/practice/hint/:questionId
 * 获取题目提示信息
 */
router.get('/hint/:questionId', async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { difficulty } = req.query;

    console.log('[Hint Route] 收到请求', { questionId, difficulty, query: req.query });

    if (!questionId || !difficulty) {
      console.log('[Hint Route] 参数验证失败', { questionId, difficulty });
      return res.status(400).json({ error: '缺少必要参数' });
    }

    console.log('[Hint Route] 参数验证通过，开始处理');

    // 获取题目详情
    const client = getSupabaseClient();
    const { data: question, error: questionError } = await client
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .maybeSingle();

    if (questionError || !question) {
      console.log('[Hint Route] 题目不存在', { questionId, error: questionError });
      return res.status(404).json({ error: '题目不存在' });
    }

    console.log('[Hint Route] 找到题目', { id: question.id, chinese: question.chinese_sentence });

    // 获取提示信息（传递 questionId 以支持缓存和预生成）
    const hint = await getHint(
      question.chinese_sentence,
      question.english_reference,
      difficulty as string,
      req,
      parseInt(questionId as string)
    );

    console.log('[Hint Route] 成功获取提示');
    res.json(hint);
  } catch (error) {
    console.error('[Hint Route] 获取提示失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '获取提示失败' });
  }
});

/**
 * POST /api/v1/practice/submit
 * 提交单题答案并获取反馈
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { questionId, userAnswer, difficulty } = req.body;

    if (!questionId || !userAnswer || !difficulty) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 获取题目详情（包含参考答案）
    const client = getSupabaseClient();
    const { data: question, error: questionError } = await client
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .maybeSingle();

    if (questionError || !question) {
      return res.status(404).json({ error: '题目不存在' });
    }

    // 使用 LLM 评判翻译
    const evaluation = await evaluateTranslation(
      {
        chineseSentence: question.chinese_sentence,
        userAnswer,
        referenceAnswer: question.english_reference,
        difficulty,
      },
      req
    );

    res.json({
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      feedback: evaluation.feedback,
      referenceAnswer: evaluation.referenceAnswer,
      errorPoints: evaluation.errorPoints,
      correctUsage: evaluation.correctUsage,
      knowledgePoints: evaluation.knowledgePoints,
    });
  } catch (error) {
    console.error('提交答案失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '提交答案失败' });
  }
});

/**
 * POST /api/v1/practice/session
 * 创建练习会话并记录结果
 */
router.post('/session', async (req: Request, res: Response) => {
  try {
    const { difficulty, answers } = req.body;

    if (!difficulty || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const client = getSupabaseClient();

    // 计算总分
    const totalScore = answers.reduce((sum: number, a: any) => sum + (a.score || 0), 0);
    const correctCount = answers.filter((a: any) => a.isCorrect).length;
    const finalScore = Math.round((totalScore / (answers.length * 100)) * 100);

    // 创建练习会话
    const { data: session, error: sessionError } = await client
      .from('practice_sessions')
      .insert({
        difficulty,
        score: finalScore,
        total_questions: answers.length,
        correct_count: correctCount,
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(`创建会话失败: ${sessionError.message}`);
    }

    // 批量插入答案记录
    const answerRecords = answers.map((a: any) => ({
      session_id: session.id,
      question_id: a.questionId,
      user_answer: a.userAnswer,
      is_correct: a.isCorrect,
      feedback: a.feedback,
    }));

    const { error: answersError } = await client
      .from('practice_answers')
      .insert(answerRecords);

    if (answersError) {
      throw new Error(`保存答案失败: ${answersError.message}`);
    }

    res.json({
      sessionId: session.id,
      score: finalScore,
      correctCount,
      totalQuestions: answers.length,
    });
  } catch (error) {
    console.error('保存练习结果失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '保存练习结果失败' });
  }
});

/**
 * GET /api/v1/practice/history
 * 获取练习历史
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('practice_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) {
      throw new Error(`获取历史记录失败: ${error.message}`);
    }

    res.json({ sessions: data });
  } catch (error) {
    console.error('获取历史记录失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '获取历史记录失败' });
  }
});

export default router;
