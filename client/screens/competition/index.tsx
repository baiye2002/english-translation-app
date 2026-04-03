import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'react-native';

interface Player {
  id: number;
  player_name: string;
  avatar_url: string;
  difficulty: string; // 可能是单个难度或多个难度用逗号分隔
  score: number;
  current_round: number;
}

interface WordHint {
  chinese: string;
  english: string;
  phonetic: string;
  partOfSpeech: string;
  plural?: string;
  pastTense?: string;
  pastParticiple?: string;
  thirdPerson?: string;
  presentParticiple?: string;
  examples?: string[];
}

interface ExamPointHint {
  points: string[];
  explanations: string[];
}

export default function CompetitionScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ roomId: string; players: string }>();

  console.log('Competition页面初始化，params:', params);

  const [roomId] = useState(params.roomId || '');
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [globalRound, setGlobalRound] = useState(1); // 全局轮次（1-5）
  const scrollViewRef = useRef<ScrollView>(null);

  // 用于跟踪当前加载的玩家ID，避免重复加载
  const loadedPlayerIdRef = useRef<number | null>(null);

  // 提示功能相关状态
  const [hintCache, setHintCache] = useState<Map<number, any>>(new Map()); // 提示缓存
  const [hintData, setHintData] = useState<{
    sentenceWithHints: string;
    words: WordHint[];
    examPoints: ExamPointHint;
  } | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);
  const [showExamPointModal, setShowExamPointModal] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordHint | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // 输入框获得焦点时滚动到底部
  const handleInputFocus = useCallback(() => {
    // 延迟滚动，确保键盘已经弹出
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // 结束比赛
  const finishCompetition = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/competition/finish/${roomId}`,
        {
          method: 'POST',
        }
      );
      const data = await response.json();

      if (response.ok) {
        router.push('/competition-result', {
          results: JSON.stringify(data.results),
          winner: JSON.stringify(data.winner),
        });
      } else {
        Alert.alert('错误', data.error || '结束比赛失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    }
  }, [roomId, router]);

  // 加载当前玩家题目
  const loadCurrentQuestion = useCallback(async (rId: string, playerId: number, round: number) => {
    // 检查是否已经加载过这个玩家的题目
    if (loadedPlayerIdRef.current === playerId) {
      console.log(`玩家 ${playerId} 的题目已加载，跳过`);
      return;
    }

    // 避免重复加载
    if (isLoadingQuestion) {
      console.log('已经在加载题目中，跳过重复请求');
      return;
    }

    console.log(`开始加载题目，房间ID: ${rId}, 玩家ID: ${playerId}, 轮次: ${round}`);
    setIsLoadingQuestion(true);
    loadedPlayerIdRef.current = playerId;

    try {
      // 传递轮次参数
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/competition/question/${rId}/${playerId}?round=${round}`
      );
      const data = await response.json();
      console.log('题目数据:', data);

      if (response.ok) {
        if (data.completed) {
          // 该玩家已完成所有题目，直接移动到下一个玩家
          console.log('玩家已完成所有题目，切换到下一个玩家');
          const nextIndex = currentPlayerIndex + 1;
          if (nextIndex >= players.length) {
            // 所有玩家都已完成，结束比赛
            console.log('所有玩家都已完成，结束比赛');
            finishCompetition();
          } else {
            console.log(`切换到玩家索引: ${nextIndex}`);
            setCurrentPlayerIndex(nextIndex);
            // 注意：不在这里递归调用，而是依赖 currentPlayerIndex 变化触发重新加载
          }
        } else {
          console.log('设置当前题目');
          setCurrentQuestion(data);
        }
      } else {
        console.error('加载题目失败:', data.error);
        Alert.alert('错误', data.error || '加载题目失败');
      }
    } catch (error) {
      console.error('加载题目异常:', error);
      Alert.alert('错误', '网络请求失败');
    } finally {
      setIsLoadingQuestion(false);
    }
  }, [currentPlayerIndex, players, finishCompetition, isLoadingQuestion]);

  // 移动到下一个玩家
  const moveToNextPlayer = useCallback(() => {
    console.log('moveToNextPlayer 被调用');
    const nextIndex = currentPlayerIndex + 1;
    console.log(`当前索引: ${currentPlayerIndex}, 下一个索引: ${nextIndex}`);

    if (nextIndex >= players.length) {
      console.log('所有玩家都已完成，结束比赛');
      finishCompetition();
    } else {
      console.log(`切换到玩家索引: ${nextIndex}`);
      setCurrentPlayerIndex(nextIndex);
      // 重置已加载标记，允许加载新玩家题目
      loadedPlayerIdRef.current = null;
      loadCurrentQuestion(roomId, players[nextIndex]?.id);
      setFeedback(null);
      setUserAnswer('');
    }
  }, [currentPlayerIndex, players, roomId, loadCurrentQuestion, finishCompetition]);

  // 提交答案
  const handleSubmit = useCallback(async () => {
    if (!userAnswer.trim()) {
      Alert.alert('提示', '请输入答案');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/competition/answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            playerId: players[currentPlayerIndex]?.id,
            questionId: currentQuestion?.questionId,
            userAnswer: userAnswer.trim(),
            roundNumber: globalRound, // 传递当前的全局轮次
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setFeedback(data);

        // 更新玩家分数和轮次显示
        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex].score = data.totalScore;
        updatedPlayers[currentPlayerIndex].current_round = data.roundNumber; // 使用后端返回的轮次
        setPlayers(updatedPlayers);
      } else {
        Alert.alert('错误', data.error || '提交失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setIsSubmitting(false);
    }
  }, [roomId, players, currentPlayerIndex, currentQuestion, userAnswer, globalRound]);

  // 下一题
  const handleNext = useCallback(() => {
    console.log('handleNext 被调用');
    console.log(`当前全局轮次: ${globalRound}, 当前玩家索引: ${currentPlayerIndex}`);
    setFeedback(null);
    setUserAnswer('');

    // 轮流答题逻辑
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    if (nextPlayerIndex === 0) {
      // 所有玩家都答完一轮，进入下一轮
      const nextGlobalRound = globalRound + 1;
      console.log(`进入下一轮，从 ${globalRound} -> ${nextGlobalRound}`);
      if (nextGlobalRound > 5) {
        console.log('所有玩家都已完成所有题目，结束比赛');
        finishCompetition();
        return;
      }
      // 先更新全局轮次状态
      setGlobalRound(nextGlobalRound);
      // 重置到第一个玩家
      setCurrentPlayerIndex(0);
      // 重置已加载标记
      loadedPlayerIdRef.current = null;
      // 立即加载下一轮的题目，使用 nextGlobalRound 而不是 globalRound
      console.log(`准备加载玩家 ${players[0]?.id} 的题目，轮次: ${nextGlobalRound}`);
      loadCurrentQuestion(roomId, players[0]?.id, nextGlobalRound);
    } else {
      // 切换到下一个玩家，保持当前轮次
      console.log(`切换到玩家索引: ${nextPlayerIndex}，当前轮次: ${globalRound}`);
      setCurrentPlayerIndex(nextPlayerIndex);
      loadedPlayerIdRef.current = null;
      loadCurrentQuestion(roomId, players[nextPlayerIndex]?.id, globalRound);
    }
  }, [globalRound, currentPlayerIndex, players, roomId, loadCurrentQuestion, finishCompetition]);

  // 请求音频权限
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('音频权限未授予');
      }
    })();
  }, []);

  // 切换题目时检查缓存
  useEffect(() => {
    if (currentQuestion?.questionId) {
      const currentId = currentQuestion.questionId;
      const cachedHint = hintCache.get(currentId);
      if (cachedHint) {
        setHintData(cachedHint);
      } else {
        setHintData(null);
      }
    }
  }, [currentQuestion?.questionId, hintCache]);

  // 获取提示（带缓存）
  const handleGetHint = async () => {
    const currentId = currentQuestion?.questionId;
    if (!currentId) return;

    // 检查缓存
    const cachedHint = hintCache.get(currentId);
    if (cachedHint) {
      setHintData(cachedHint);
      return;
    }

    setIsHintLoading(true);
    try {
      // 使用第一个难度作为提示依据
      const playerDifficulties = currentPlayer.difficulty.split(',');
      const primaryDifficulty = playerDifficulties[0];

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/practice/hint/${currentId}?difficulty=${encodeURIComponent(primaryDifficulty)}`
      );
      const data = await response.json();

      if (response.ok) {
        // 存入缓存
        setHintCache(prev => new Map(prev).set(currentId, data));
        setHintData(data);
      } else {
        Alert.alert('错误', data.error || '获取提示失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setIsHintLoading(false);
    }
  };

  // 点击单词显示详情
  const handleWordClick = (word: WordHint) => {
    setSelectedWord(word);
    setShowWordModal(true);
  };

  // 播放单词发音
  const handlePlayAudio = async (word: string) => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: `https://dict.youdao.com/dictvoice?audio=${word}&type=1` });
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlayingAudio(false);
          soundObject.unloadAsync();
        }
      });
    } catch (error) {
      console.error('音频播放失败:', error);
      setIsPlayingAudio(false);
      Alert.alert('提示', '音频播放失败');
    }
  };

  // 标点符号集合
  const PUNCTUATION_SET = new Set([
    '。', '，', '！', '？', '；', '：',
    '\u201c', '\u201d', '\u2018', '\u2019', '（', '）', '《', '》',
    '.', ',', '!', '?', ';', ':', '(', ')', '"', "'"
  ]);

  // 检查是否为标点符号
  const isPunctuation = (word: string): boolean => {
    return word.split('').every(char => PUNCTUATION_SET.has(char));
  };

  // 移除标点符号
  const removePunctuation = (word: string): string => {
    return word.split('').filter(char => !PUNCTUATION_SET.has(char)).join('');
  };

  // 渲染带下划线的句子
  const renderHintedSentence = () => {
    if (!hintData) return null;

    const words = hintData.sentenceWithHints.split(' ');

    return (
      <View style={styles.hintedSentenceContainer}>
        {words.map((word, index) => {
          const wordIsPunctuation = isPunctuation(word);
          const wordInfo = hintData.words.find(w => w.chinese === removePunctuation(word));

          if (wordIsPunctuation || !wordInfo) {
            return <Text key={index} style={styles.punctuationText}>{word}</Text>;
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleWordClick(wordInfo)}
              style={styles.clickableWord}
              activeOpacity={0.7}
            >
              <Text style={styles.clickableWordText}>{word}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // 初始化
  useEffect(() => {
    console.log('Competition useEffect 触发');
    console.log('roomId:', roomId);
    console.log('params.players:', params.players);

    if (params.players) {
      try {
        console.log('开始解析玩家数据');
        const parsedPlayers = JSON.parse(params.players);
        console.log('解析后的玩家数据:', parsedPlayers);
        setPlayers(parsedPlayers);
        // 注意：不在这里直接调用 loadCurrentQuestion，而是让下面的 useEffect 自动处理
        if (parsedPlayers.length === 0) {
          console.error('玩家列表为空');
          Alert.alert('错误', '玩家列表为空');
        }
      } catch (error) {
        console.error('解析玩家数据失败:', error);
        Alert.alert('错误', '解析玩家数据失败');
      }
    } else {
      console.error('params.players 不存在');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, params.players]);

  // 监听 currentPlayerIndex 变化，自动加载新玩家的题目
  useEffect(() => {
    console.log('currentPlayerIndex 变化:', currentPlayerIndex, '全局轮次:', globalRound);
    const currentPlayer = players[currentPlayerIndex];
    // 只在当前玩家已设置、没有正在加载、且房间ID存在时才加载
    if (currentPlayer && !isLoadingQuestion && roomId) {
      // 检查是否需要重置已加载标记（当切换到新玩家时）
      if (loadedPlayerIdRef.current !== currentPlayer.id) {
        console.log(`自动加载玩家 ${currentPlayer.player_name} 的题目（轮次: ${globalRound}）`);
        loadCurrentQuestion(roomId, currentPlayer.id, globalRound);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayerIndex, players, roomId, globalRound]);

  const currentPlayer = players[currentPlayerIndex];

  if (!currentPlayer) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6584" />
          <Text style={styles.loadingText}>正在加载...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
          bounces={false}
          nestedScrollEnabled={true}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← 返回</Text>
            </TouchableOpacity>
            <Text style={styles.title}>竞技模式</Text>
          </View>

          {/* Players List */}
          <View style={styles.playersList}>
            {players.map((player, index) => (
              <View
                key={player.id}
                style={[
                  styles.playerItem,
                  index === currentPlayerIndex && styles.currentPlayerItem,
                ]}
              >
                <View style={styles.playerInfo}>
                  <View style={styles.playerAvatarContainer}>
                    <Image
                      source={{ uri: player.avatar_url }}
                      style={styles.playerAvatar}
                    />
                  </View>
                  <View style={styles.playerDetails}>
                    <Text style={styles.playerName}>{player.player_name}</Text>
                    <Text style={styles.playerDifficulty}>
                      {player.difficulty.includes(',')
                        ? `${player.difficulty.split(',').length} 个难度`
                        : player.difficulty}
                    </Text>
                  </View>
                </View>
                <View style={styles.playerStats}>
                  <FontAwesome name="trophy" size={16} color="#FF6584" />
                  <Text style={styles.playerScore}>{player.score}</Text>
                  <Text style={styles.playerRound}>轮次: {player.current_round}/5</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Question Card */}
          {currentQuestion && !feedback && (
            <View style={styles.card}>
              <View style={styles.shadowDark}>
                <View style={styles.shadowLight}>
                  <View style={styles.currentPlayerBanner}>
                    <Text style={styles.currentPlayerLabel}>当前答题</Text>
                    <Text style={styles.currentPlayerName}>{currentPlayer.player_name}</Text>
                  </View>

                  <View style={styles.iconContainer}>
                    <FontAwesome name="book" size={24} color="#FF6584" />
                  </View>
                  <Text style={styles.cardTitle}>请翻译成英文</Text>
                  {!hintData ? (
                    <Text style={styles.chineseText}>{currentQuestion.chineseSentence}</Text>
                  ) : (
                    renderHintedSentence()
                  )}

                  {!feedback && (
                    <View style={styles.hintButtonsContainer}>
                      {(!hintCache.has(currentQuestion?.questionId || -1) || !hintData) && (
                        <TouchableOpacity
                          onPress={handleGetHint}
                          disabled={isHintLoading}
                          style={[styles.hintButton, isHintLoading && styles.hintButtonDisabled]}
                          activeOpacity={0.7}
                        >
                          {isHintLoading ? (
                            <ActivityIndicator size="small" color="#FF6584" />
                          ) : (
                            <>
                              <FontAwesome name="lightbulb-o" size={16} color="#FF6584" />
                              <Text style={styles.hintButtonText}>获取提示</Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                      {hintData && (
                        <TouchableOpacity
                          onPress={() => setShowExamPointModal(true)}
                          style={styles.hintButton}
                          activeOpacity={0.7}
                        >
                          <FontAwesome name="graduation-cap" size={16} color="#FF6584" />
                          <Text style={styles.hintButtonText}>考点提示</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="输入英文翻译..."
                      placeholderTextColor="#B2BEC3"
                      value={userAnswer}
                      onChangeText={setUserAnswer}
                      multiline
                      numberOfLines={3}
                      onFocus={handleInputFocus}
                    />
                    <TouchableOpacity
                      activeOpacity={0.97}
                      onPress={handleSubmit}
                      disabled={isSubmitting}
                      style={[
                        styles.submitButton,
                        isSubmitting && styles.submitButtonDisabled,
                      ]}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <FontAwesome name="paper-plane" size={18} color="#FFFFFF" />
                          <Text style={styles.submitButtonText}>提交</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Feedback Card */}
          {feedback && (
            <View style={styles.card}>
              <View style={styles.shadowDark}>
                <View style={styles.shadowLight}>
                  <View
                    style={[
                      styles.feedbackHeader,
                      feedback.isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
                    ]}
                  >
                    {feedback.isCorrect ? (
                      <FontAwesome name="check-circle" size={24} color="#00B894" />
                    ) : (
                      <FontAwesome name="times-circle" size={24} color="#FF6B6B" />
                    )}
                    <Text
                      style={[
                        styles.feedbackHeaderText,
                        feedback.isCorrect ? styles.correctText : styles.incorrectText,
                      ]}
                    >
                      {feedback.isCorrect ? '回答正确' : '需要改进'}
                    </Text>
                  </View>

                  {/* 用户翻译 */}
                  <View style={styles.userAnswerContainer}>
                    <Text style={styles.userAnswerLabel}>你的翻译：</Text>
                    <Text style={styles.userAnswerText}>{userAnswer}</Text>
                  </View>

                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>本题得分：</Text>
                    <Text style={[styles.scoreValue, { color: getScoreColor(feedback.score) }]}>
                      {feedback.score}
                    </Text>
                  </View>
                  <Text style={styles.feedbackText}>{feedback.feedback}</Text>
                  {feedback.referenceAnswer && (
                    <View style={styles.referenceContainer}>
                      <Text style={styles.referenceLabel}>参考翻译：</Text>
                      <Text style={styles.referenceText}>{feedback.referenceAnswer}</Text>
                    </View>
                  )}

                  {/* 错误点分析 */}
                  {feedback.errorPoints && feedback.errorPoints.length > 0 && (
                    <View style={styles.detailContainer}>
                      <View style={styles.detailHeader}>
                        <FontAwesome name="exclamation-triangle" size={18} color="#FF6B6B" />
                        <Text style={styles.detailTitle}>错误点分析</Text>
                      </View>
                      {feedback.errorPoints.map((point, index) => (
                        <View key={index} style={styles.detailItem}>
                          <Text style={styles.detailBullet}>•</Text>
                          <Text style={styles.detailText}>{point}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 正确用法说明 */}
                  {feedback.correctUsage && feedback.correctUsage.length > 0 && (
                    <View style={styles.detailContainer}>
                      <View style={styles.detailHeader}>
                        <FontAwesome name="lightbulb-o" size={18} color="#00B894" />
                        <Text style={styles.detailTitle}>正确用法说明</Text>
                      </View>
                      {feedback.correctUsage.map((usage, index) => (
                        <View key={index} style={styles.detailItem}>
                          <Text style={styles.detailBullet}>•</Text>
                          <Text style={styles.detailText}>{usage}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* 考察知识点 */}
                  {feedback.knowledgePoints && feedback.knowledgePoints.length > 0 && (
                    <View style={styles.detailContainer}>
                      <View style={styles.detailHeader}>
                        <FontAwesome name="graduation-cap" size={18} color="#6C63FF" />
                        <Text style={styles.detailTitle}>考察知识点</Text>
                      </View>
                      <View style={styles.knowledgePointsContainer}>
                        {feedback.knowledgePoints.map((point, index) => (
                          <View key={index} style={styles.knowledgePointItem}>
                            <Text style={styles.knowledgePointText}>{point}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.97}
                    onPress={handleNext}
                    style={styles.nextButtonContainer}
                  >
                    <LinearGradient
                      colors={['#FF6584', '#FF85A3']}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>继续</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 单词详情 Modal */}
      <Modal
        visible={showWordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWordModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowWordModal(false)}>
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>单词详情</Text>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity
                  onPress={() => handlePlayAudio(selectedWord?.english || '')}
                  disabled={isPlayingAudio}
                  style={styles.audioButton}
                  activeOpacity={0.7}
                >
                  <FontAwesome
                    name="volume-up"
                    size={20}
                    color={isPlayingAudio ? '#B2BEC3' : '#FF6584'}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowWordModal(false)}>
                  <FontAwesome name="times" size={24} color="#636E72" />
                </TouchableOpacity>
              </View>
            </View>

            {selectedWord && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.wordMainInfo}>
                  <Text style={styles.chineseWord}>{selectedWord.chinese}</Text>
                  <View style={styles.englishWordContainer}>
                    <Text style={styles.englishWord}>{selectedWord.english}</Text>
                  </View>
                  <Text style={styles.phonetic}>{selectedWord.phonetic}</Text>
                  <View style={styles.partOfSpeechBadge}>
                    <Text style={styles.partOfSpeechText}>{selectedWord.partOfSpeech}</Text>
                  </View>
                </View>

                {/* 名词复数 */}
                {selectedWord.plural && (
                  <View style={styles.formContainer}>
                    <View style={styles.formItem}>
                      <Text style={styles.formLabel}>复数</Text>
                      <Text style={styles.formValue}>{selectedWord.plural}</Text>
                    </View>
                  </View>
                )}

                {/* 动词形式 */}
                {(selectedWord.pastTense || selectedWord.thirdPerson) && (
                  <View style={styles.formContainer}>
                    {selectedWord.pastTense && (
                      <View style={styles.formItem}>
                        <Text style={styles.formLabel}>过去式</Text>
                        <Text style={styles.formValue}>{selectedWord.pastTense}</Text>
                      </View>
                    )}
                    {selectedWord.pastParticiple && (
                      <View style={styles.formItem}>
                        <Text style={styles.formLabel}>过去分词</Text>
                        <Text style={styles.formValue}>{selectedWord.pastParticiple}</Text>
                      </View>
                    )}
                    {selectedWord.thirdPerson && (
                      <View style={styles.formItem}>
                        <Text style={styles.formLabel}>第三人称</Text>
                        <Text style={styles.formValue}>{selectedWord.thirdPerson}</Text>
                      </View>
                    )}
                    {selectedWord.presentParticiple && (
                      <View style={styles.formItem}>
                        <Text style={styles.formLabel}>现在分词</Text>
                        <Text style={styles.formValue}>{selectedWord.presentParticiple}</Text>
                      </View>
                    )}
                  </View>
                )}

                {selectedWord.examples && selectedWord.examples.length > 0 && (
                  <View style={styles.examplesContainer}>
                    <Text style={styles.examplesTitle}>例句</Text>
                    {selectedWord.examples.map((example, index) => (
                      <View key={index} style={styles.exampleItem}>
                        <Text style={styles.exampleText}>{example}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* 考点提示 Modal */}
      <Modal
        visible={showExamPointModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExamPointModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowExamPointModal(false)}>
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>考点提示</Text>
              <TouchableOpacity onPress={() => setShowExamPointModal(false)}>
                <FontAwesome name="times" size={24} color="#636E72" />
              </TouchableOpacity>
            </View>

            {hintData && hintData.examPoints && (
              <ScrollView style={styles.modalBody}>
                {hintData.examPoints.points.map((point, index) => (
                  <View key={index} style={styles.examPointItem}>
                    <View style={styles.examPointHeader}>
                      <FontAwesome name="book" size={16} color="#FF6584" />
                      <Text style={styles.examPointTitle}>{point}</Text>
                    </View>
                    <Text style={styles.examPointExplanation}>{hintData.examPoints.explanations[index]}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const getScoreColor = (score: number) => {
  if (score >= 90) return '#00B894';
  if (score >= 70) return '#6C63FF';
  if (score >= 60) return '#FDCB6E';
  return '#FF6B6B';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 300 : 250,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F3',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#636E72',
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6584',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
  },
  playersList: {
    marginBottom: 20,
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8E8EB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  currentPlayerItem: {
    backgroundColor: 'rgba(255,101,132,0.12)',
    borderWidth: 2,
    borderColor: '#FF6584',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  playerAvatar: {
    width: '100%',
    height: '100%',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 2,
  },
  playerDifficulty: {
    fontSize: 12,
    color: '#636E72',
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  playerScore: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF6584',
    marginLeft: 4,
  },
  playerRound: {
    fontSize: 11,
    color: '#636E72',
    marginTop: 2,
  },
  card: {
    marginBottom: 16,
  },
  shadowDark: {
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    borderRadius: 24,
    marginBottom: 16,
  },
  shadowLight: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    backgroundColor: '#F0F0F3',
    borderRadius: 24,
    padding: 24,
  },
  currentPlayerBanner: {
    backgroundColor: 'rgba(255,101,132,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  currentPlayerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6584',
    marginBottom: 4,
  },
  currentPlayerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,101,132,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  chineseText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    lineHeight: 30,
    marginBottom: 24,
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: '#E8E8EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#2D3436',
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6584',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  correctFeedback: {
    backgroundColor: 'rgba(0,184,148,0.1)',
  },
  incorrectFeedback: {
    backgroundColor: 'rgba(255,107,107,0.1)',
  },
  feedbackHeaderText: {
    fontSize: 16,
    fontWeight: '700',
  },
  correctText: {
    color: '#00B894',
  },
  incorrectText: {
    color: '#FF6B6B',
  },
  userAnswerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,101,132,0.2)',
    marginBottom: 16,
  },
  userAnswerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
    marginBottom: 8,
  },
  userAnswerText: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 24,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#636E72',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 8,
  },
  feedbackText: {
    fontSize: 15,
    color: '#636E72',
    lineHeight: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,101,132,0.1)',
    marginBottom: 16,
  },
  referenceContainer: {
    backgroundColor: '#E8E8EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  referenceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636E72',
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 15,
    color: '#2D3436',
    lineHeight: 22,
  },
  detailContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,101,132,0.1)',
    marginBottom: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  detailBullet: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
  knowledgePointsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  knowledgePointItem: {
    backgroundColor: 'rgba(255,101,132,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  knowledgePointText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6584',
  },
  nextButtonContainer: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // 提示功能样式
  hintButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,101,132,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  hintButtonDisabled: {
    opacity: 0.5,
  },
  hintButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6584',
  },
  hintedSentenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  clickableWord: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6584',
    marginRight: 4,
  },
  clickableWordText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    lineHeight: 30,
  },
  punctuationText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    lineHeight: 30,
    marginRight: 4,
  },
  // Modal 样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8EB',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  audioButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
  },
  modalBody: {
    padding: 20,
  },
  wordMainInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chineseWord: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  englishWordContainer: {
    marginBottom: 8,
  },
  englishWord: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF6584',
  },
  phonetic: {
    fontSize: 18,
    color: '#636E72',
    marginBottom: 16,
  },
  partOfSpeechBadge: {
    backgroundColor: 'rgba(255,101,132,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  partOfSpeechText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6584',
  },
  formContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  formItem: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  formLabel: {
    fontSize: 13,
    color: '#636E72',
    marginBottom: 4,
  },
  formValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  examplesContainer: {
    marginTop: 16,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  exampleItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#2D3436',
    lineHeight: 20,
  },
  examPointItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  examPointHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  examPointTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6584',
  },
  examPointExplanation: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
});
