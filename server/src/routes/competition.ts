import express from 'express';
import type { Request, Response } from 'express';
import { getQuestionsByDifficulty, getQuestionsByDifficulties } from '../services/questionService';
import { evaluateTranslation } from '../services/llmService';
import { getHint } from '../services/hintService';
import { getSupabaseClient } from '../storage/database/supabase-client';

const router = express.Router();

/**
 * POST /api/v1/competition/room
 * 创建竞技房间
 */
router.post('/room', async (req: Request, res: Response) => {
  try {
    const { playerCount, players } = req.body;

    if (!playerCount || !players || !Array.isArray(players)) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    if (playerCount < 1 || playerCount > 4) {
      return res.status(400).json({ error: '玩家数量必须在1-4之间' });
    }

    const client = getSupabaseClient();

    // 创建房间
    const { data: room, error: roomError } = await client
      .from('competition_rooms')
      .insert({
        player_count: playerCount,
        status: 'waiting',
      })
      .select()
      .single();

    if (roomError) {
      throw new Error(`创建房间失败: ${roomError.message}`);
    }

    // 创建玩家记录
    const playerRecords = players.map((p: any) => ({
      room_id: room.id,
      player_name: p.name,
      avatar_url: p.avatarUrl,
      difficulty: Array.isArray(p.difficulties) && p.difficulties.length > 0
        ? p.difficulties.join(',')
        : p.difficulty, // 将多个难度连接成字符串存储
      score: 0,
      current_round: 0,
    }));

    const { data: playerData, error: playersError } = await client
      .from('competition_players')
      .insert(playerRecords)
      .select();

    if (playersError) {
      throw new Error(`创建玩家记录失败: ${playersError.message}`);
    }

    res.json({
      roomId: room.id,
      players: playerData,
    });
  } catch (error) {
    console.error('创建房间失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '创建房间失败' });
  }
});

/**
 * POST /api/v1/competition/start
 * 开始竞技比赛
 */
router.post('/start/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const client = getSupabaseClient();

    // 更新房间状态
    const { error: updateError } = await client
      .from('competition_rooms')
      .update({ status: 'in_progress' })
      .eq('id', roomId);

    if (updateError) {
      throw new Error(`开始比赛失败: ${updateError.message}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('开始比赛失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '开始比赛失败' });
  }
});

/**
 * GET /api/v1/competition/room/:roomId
 * 获取房间状态
 */
router.get('/room/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const client = getSupabaseClient();

    // 获取房间信息
    const { data: room, error: roomError } = await client
      .from('competition_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ error: '房间不存在' });
    }

    // 获取玩家信息
    const { data: players, error: playersError } = await client
      .from('competition_players')
      .select('*')
      .eq('room_id', roomId)
      .order('id');

    if (playersError) {
      throw new Error(`获取玩家信息失败: ${playersError.message}`);
    }

    res.json({
      room,
      players,
    });
  } catch (error) {
    console.error('获取房间状态失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '获取房间状态失败' });
  }
});

/**
 * GET /api/v1/competition/question/:roomId/:playerId
 * 获取当前轮次的题目
 */
router.get('/question/:roomId/:playerId', async (req: Request, res: Response) => {
  try {
    const { roomId, playerId } = req.params;
    const { round } = req.query; // 支持传递轮次参数

    const client = getSupabaseClient();

    // 获取玩家信息
    const { data: player, error: playerError } = await client
      .from('competition_players')
      .select('*')
      .eq('id', playerId)
      .eq('room_id', roomId)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: '玩家不存在' });
    }

    // 使用传递的轮次或玩家的当前轮次
    const roundNumber = round ? parseInt(round as string) - 1 : player.current_round;

    // 检查是否已完成5题
    if (roundNumber >= 5) {
      return res.json({ completed: true });
    }

    // 根据玩家难度获取题目
    // 支持多个难度，从多个难度中随机选取题目
    const playerDifficulties = player.difficulty.split(',');
    
    let questions;
    if (playerDifficulties.length > 1) {
      // 多选难度：从多个难度中随机选取
      questions = await getQuestionsByDifficulties(playerDifficulties, 5);
    } else {
      // 单选难度：从单个难度中选取
      questions = await getQuestionsByDifficulty(playerDifficulties[0], 5);
    }
    
    const currentQuestion = questions[roundNumber];

    // 返回题目（不包含参考答案）
    res.json({
      questionId: currentQuestion.id,
      chineseSentence: currentQuestion.chinese_sentence,
      roundNumber: roundNumber + 1,
      totalRounds: 5,
    });
  } catch (error) {
    console.error('获取题目失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '获取题目失败' });
  }
});

/**
 * GET /api/v1/competition/hint/:questionId
 * 获取题目提示信息
 */
router.get('/hint/:questionId', async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { difficulty } = req.query;

    if (!questionId || !difficulty) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 获取题目详情
    const client = getSupabaseClient();
    const { data: question, error: questionError } = await client
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .maybeSingle();

    if (questionError || !question) {
      return res.status(404).json({ error: '题目不存在' });
    }

    // 获取提示信息（传递 questionId 以支持缓存和预生成）
    const hint = await getHint(
      question.chinese_sentence,
      question.english_reference,
      difficulty as string,
      req,
      parseInt(questionId as string)
    );

    res.json(hint);
  } catch (error) {
    console.error('获取提示失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '获取提示失败' });
  }
});

/**
 * POST /api/v1/competition/answer
 * 提交答案并获取反馈
 */
router.post('/answer', async (req: Request, res: Response) => {
  try {
    const { roomId, playerId, questionId, userAnswer, roundNumber } = req.body; // 接收前端传递的轮次

    if (!roomId || !playerId || !questionId || !userAnswer || !roundNumber) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const client = getSupabaseClient();

    // 获取玩家信息
    const { data: player, error: playerError } = await client
      .from('competition_players')
      .select('*')
      .eq('id', playerId)
      .eq('room_id', roomId)
      .single();

    if (playerError || !player) {
      return res.status(404).json({ error: '玩家不存在' });
    }

    // 获取题目详情（包含参考答案）
    const { data: question, error: questionError } = await client
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .maybeSingle();

    if (questionError || !question) {
      return res.status(404).json({ error: '题目不存在' });
    }

    // 使用 LLM 评判翻译
    // 使用第一个难度作为评判依据
    const playerDifficulties = player.difficulty.split(',');
    const primaryDifficulty = playerDifficulties[0];

    const evaluation = await evaluateTranslation(
      {
        chineseSentence: question.chinese_sentence,
        userAnswer,
        referenceAnswer: question.english_reference,
        difficulty: primaryDifficulty,
      },
      req
    );

    // 保存答案记录
    const { error: answerError } = await client
      .from('competition_answers')
      .insert({
        player_id: playerId,
        question_id: questionId,
        round_number: roundNumber, // 使用前端传递的轮次
        user_answer: userAnswer,
        is_correct: evaluation.isCorrect,
        feedback: evaluation.feedback,
      });

    if (answerError) {
      throw new Error(`保存答案失败: ${answerError.message}`);
    }

    // 只更新玩家分数，不更新轮次（轮流答题模式下轮次由前端全局控制）
    const newScore = player.score + evaluation.score;

    const { error: updateError } = await client
      .from('competition_players')
      .update({
        score: newScore,
      })
      .eq('id', playerId);

    if (updateError) {
      throw new Error(`更新玩家状态失败: ${updateError.message}`);
    }

    // 返回前端传递的轮次，而不是数据库中的值
    res.json({
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      totalScore: newScore,
      roundNumber: roundNumber, // 使用前端传递的轮次
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
 * POST /api/v1/competition/finish/:roomId
 * 结束比赛并计算结果
 */
router.post('/finish/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const client = getSupabaseClient();

    // 获取房间和玩家信息
    const { data: players, error: playersError } = await client
      .from('competition_players')
      .select('*')
      .eq('room_id', roomId)
      .order('score', { ascending: false });

    if (playersError) {
      throw new Error(`获取玩家信息失败: ${playersError.message}`);
    }

    // 计算获胜者（分数最高）
    const winner = players && players.length > 0 ? players[0] : null;

    // 更新房间状态
    const { error: updateError } = await client
      .from('competition_rooms')
      .update({
        status: 'completed',
        winner_id: winner ? winner.id : null,
      })
      .eq('id', roomId);

    if (updateError) {
      throw new Error(`结束比赛失败: ${updateError.message}`);
    }

    // 计算每个玩家的最终得分（总分转换为百分制）
    const results = players ? players.map((p: any) => ({
      playerId: p.id,
      playerName: p.player_name,
      avatarUrl: p.avatar_url,
      totalScore: p.score,
      finalScore: Math.round((p.score / 500) * 100), // 5题，每题最高100分
      isWinner: winner ? p.id === winner.id : false,
    })) : [];

    res.json({
      winner: winner ? {
        playerId: winner.id,
        playerName: winner.player_name,
        avatarUrl: winner.avatar_url,
        score: Math.round((winner.score / 500) * 100),
      } : null,
      results,
    });
  } catch (error) {
    console.error('结束比赛失败:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : '结束比赛失败' });
  }
});

export default router;
