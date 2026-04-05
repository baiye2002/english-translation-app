import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { FontAwesome } from '@expo/vector-icons';

interface Question {
  id: number;
  chineseSentence: string;
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

export default function PracticeScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ difficulty: string }>();

  const [difficulty] = useState(params.difficulty || '');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

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

  // 加载题目
  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/practice/questions/${difficulty}`
      );
      const data = await response.json();

      if (response.ok) {
        setQuestions(data.questions);
      } else {
        Alert.alert('错误', data.error || '加载题目失败');
        router.back();
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [difficulty]);

  // 切换题目时检查缓存
  useEffect(() => {
    if (questions[currentIndex]) {
      const currentId = questions[currentIndex].id;
      const cachedHint = hintCache.get(currentId);
      if (cachedHint) {
        setHintData(cachedHint);
      } else {
        setHintData(null);
      }
    }
  }, [currentIndex, questions, hintCache]);

  // 输入框获得焦点时滚动到底部
  const handleInputFocus = useCallback(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  // 请求音频权限
  React.useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('音频权限未授予');
      }
    })();
  }, []);

  // 页面加载时获取题目
  React.useEffect(() => {
    if (difficulty) {
      loadQuestions();
    }
  }, [difficulty, loadQuestions]);

  // 提交答案
  const handleSubmit = async () => {
    if (!userAnswer.trim()) {
      Alert.alert('提示', '请输入答案');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/practice/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: questions[currentIndex].id,
            userAnswer: userAnswer.trim(),
            difficulty,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setFeedback(data);
        setAnswers([
          ...answers,
          {
            questionId: questions[currentIndex].id,
            userAnswer: userAnswer.trim(),
            ...data,
          },
        ]);
      } else {
        Alert.alert('错误', data.error || '提交失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 下一题
  const handleNext = () => {
    setFeedback(null);
    setUserAnswer('');
    // 不清除 hintData，在 useEffect 中根据缓存自动处理

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      saveResults();
    }
  };

  // 获取提示（带缓存）
  const handleGetHint = async () => {
    const currentId = currentQuestion?.id;
    if (!currentId) return;

    // 检查缓存
    const cachedHint = hintCache.get(currentId);
    if (cachedHint) {
      setHintData(cachedHint);
      return;
    }

    setIsHintLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/practice/hint/${currentId}?difficulty=${encodeURIComponent(difficulty)}`
      );
      const data = await response.json();

      if (response.ok) {
        // 检查 data 是否是字符串，如果是则解析为 JSON 对象
        let parsedData = data;
        if (typeof data === 'string') {
          console.log('[Frontend] hintData 是字符串，需要解析');
          parsedData = JSON.parse(data);
        }

        // 存入缓存
        setHintCache(prev => new Map(prev).set(currentId, parsedData));
        setHintData(parsedData);
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

  // 保存练习结果
  const saveResults = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/practice/session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            difficulty,
            answers,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        router.push('/practice-result', {
          score: data.score,
          correctCount: data.correctCount,
          totalQuestions: data.totalQuestions,
        });
      } else {
        Alert.alert('错误', data.error || '保存结果失败');
      }
    } catch (error) {
      Alert.alert('错误', '网络请求失败');
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>正在加载题目...</Text>
        </View>
      </Screen>
    );
  }

  const currentQuestion = questions[currentIndex];
  const hasHintForCurrentQuestion = currentQuestion && hintCache.has(currentQuestion.id);

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
            <View style={styles.progressContainer}>
              <Text style={styles.difficultyText}>{difficulty}</Text>
              <Text style={styles.progressText}>
                第 {currentIndex + 1} / {questions.length} 题
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentIndex + 1) / questions.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Question Card */}
          <View style={styles.card}>
            <View style={styles.shadowDark}>
              <View style={styles.shadowLight}>
                <View style={styles.iconContainer}>
                  <FontAwesome name="book" size={24} color="#6C63FF" />
                </View>
                <Text style={styles.cardTitle}>请翻译成英文</Text>
                {!hintData ? (
                  <Text style={styles.chineseText}>{currentQuestion?.chineseSentence}</Text>
                ) : (
                  renderHintedSentence()
                )}

                {!feedback && (
                  <View style={styles.hintButtonsContainer}>
                    {!hasHintForCurrentQuestion && !hintData && (
                      <TouchableOpacity
                        onPress={handleGetHint}
                        disabled={isHintLoading}
                        style={[styles.hintButton, isHintLoading && styles.hintButtonDisabled]}
                        activeOpacity={0.7}
                      >
                        {isHintLoading ? (
                          <ActivityIndicator size="small" color="#6C63FF" />
                        ) : (
                          <>
                            <FontAwesome name="lightbulb-o" size={16} color="#6C63FF" />
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
                        <FontAwesome name="graduation-cap" size={16} color="#6C63FF" />
                        <Text style={styles.hintButtonText}>考点提示</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {feedback ? (
                  <View style={styles.feedbackContainer}>
                    <View style={styles.userAnswerContainer}>
                      <Text style={styles.userAnswerLabel}>你的翻译：</Text>
                      <Text style={styles.userAnswerText}>{userAnswer}</Text>
                    </View>

                    <View
                      style={[
                        styles.feedbackHeader,
                        feedback.isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
                      ]}
                    >
                      {feedback.isCorrect ? (
                        <FontAwesome name="check-circle" size={20} color="#00B894" />
                      ) : (
                        <FontAwesome name="times-circle" size={20} color="#FF6B6B" />
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
                    <Text style={styles.scoreText}>得分：{feedback.score}</Text>
                    <Text style={styles.feedbackText}>{feedback.feedback}</Text>
                    
                    {/* 错误点 */}
                    {feedback.errorPoints && feedback.errorPoints.length > 0 && (
                      <View style={styles.detailContainer}>
                        <View style={styles.detailHeader}>
                          <FontAwesome name="exclamation-circle" size={16} color="#FF6B6B" />
                          <Text style={styles.detailTitle}>错误点</Text>
                        </View>
                        {feedback.errorPoints.map((point: string, index: number) => (
                          <View key={index} style={styles.detailItem}>
                            <Text style={styles.detailBullet}>•</Text>
                            <Text style={styles.detailText}>{point}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {/* 正确用法 */}
                    {feedback.correctUsage && (
                      <View style={styles.detailContainer}>
                        <View style={styles.detailHeader}>
                          <FontAwesome name="lightbulb-o" size={16} color="#FDCB6E" />
                          <Text style={styles.detailTitle}>正确用法</Text>
                        </View>
                        <Text style={styles.detailText}>{feedback.correctUsage}</Text>
                      </View>
                    )}
                    
                    {/* 知识点 */}
                    {feedback.knowledgePoints && feedback.knowledgePoints.length > 0 && (
                      <View style={styles.detailContainer}>
                        <View style={styles.detailHeader}>
                          <FontAwesome name="book" size={16} color="#6C63FF" />
                          <Text style={styles.detailTitle}>考察知识点</Text>
                        </View>
                        <View style={styles.knowledgePointsContainer}>
                          {feedback.knowledgePoints.map((point: string, index: number) => (
                            <View key={index} style={styles.knowledgePointItem}>
                              <Text style={styles.knowledgePointText}>{point}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    
                    {/* 参考翻译 */}
                    {feedback.referenceAnswer && (
                      <View style={styles.referenceContainer}>
                        <Text style={styles.referenceLabel}>参考翻译：</Text>
                        <Text style={styles.referenceText}>{feedback.referenceAnswer}</Text>
                      </View>
                    )}
                    
                    <TouchableOpacity
                      activeOpacity={0.97}
                      onPress={handleNext}
                      style={styles.nextButtonContainer}
                    >
                      <LinearGradient
                        colors={['#6C63FF', '#896BFF']}
                        style={styles.button}
                      >
                        <Text style={styles.buttonText}>
                          {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                ) : (
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
                )}
              </View>
            </View>
          </View>
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
                    color={isPlayingAudio ? '#B2BEC3' : '#6C63FF'} 
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
                      <FontAwesome name="book" size={16} color="#6C63FF" />
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
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  progressText: {
    fontSize: 14,
    color: '#636E72',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E8E8EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 4,
  },
  card: {
    marginBottom: 24,
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(108,99,255,0.12)',
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
    backgroundColor: '#6C63FF',
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
  feedbackContainer: {
    gap: 16,
  },
  userAnswerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
    marginBottom: 8,
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
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
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
  scoreText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6C63FF',
  },
  feedbackText: {
    fontSize: 15,
    color: '#636E72',
    lineHeight: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.1)',
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
    borderColor: 'rgba(108,99,255,0.1)',
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
    backgroundColor: 'rgba(108,99,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  knowledgePointText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  nextButtonContainer: {
    alignItems: 'center',
    marginTop: 8,
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
    backgroundColor: 'rgba(108,99,255,0.1)',
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
    color: '#6C63FF',
  },
  hintedSentenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  clickableWord: {
    borderBottomWidth: 2,
    borderBottomColor: '#6C63FF',
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
    color: '#6C63FF',
  },
  phonetic: {
    fontSize: 18,
    color: '#636E72',
    marginBottom: 16,
  },
  partOfSpeechBadge: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  partOfSpeechText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
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
    color: '#6C63FF',
  },
  examPointExplanation: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
});
