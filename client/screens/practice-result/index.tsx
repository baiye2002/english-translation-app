import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { FontAwesome } from '@expo/vector-icons';

export default function PracticeResultScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ score: string; correctCount: string; totalQuestions: string }>();

  const score = parseInt(params.score || '0');
  const correctCount = parseInt(params.correctCount || '0');
  const totalQuestions = parseInt(params.totalQuestions || '10');

  const getScoreColor = () => {
    if (score >= 90) return '#00B894';
    if (score >= 70) return '#6C63FF';
    if (score >= 60) return '#FDCB6E';
    return '#FF6B6B';
  };

  const getScoreMessage = () => {
    if (score >= 90) return '太棒了！';
    if (score >= 70) return '做得很好！';
    if (score >= 60) return '继续加油！';
    return '需要更多练习！';
  };

  const handleHome = () => {
    router.push('/');
  };

  const handleRetry = () => {
    router.back();
  };

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.title}>练习结果</Text>
        </View>

        {/* Score Card */}
        <View style={styles.card}>
          <View style={styles.shadowDark}>
            <View style={styles.shadowLight}>
              <View style={styles.iconContainer}>
                <FontAwesome name="trophy" size={32} color={getScoreColor()} />
              </View>
              <Text style={styles.scoreMessage}>{getScoreMessage()}</Text>
              <View style={styles.scoreContainer}>
                <Text style={[styles.scoreText, { color: getScoreColor() }]}>{score}</Text>
                <Text style={styles.scoreLabel}>分</Text>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <FontAwesome name="check-circle" size={20} color="#00B894" />
                  </View>
                  <Text style={styles.statValue}>{correctCount}</Text>
                  <Text style={styles.statLabel}>正确</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <FontAwesome name="trending-up" size={20} color="#6C63FF" />
                  </View>
                  <Text style={styles.statValue}>{totalQuestions}</Text>
                  <Text style={styles.statLabel}>总题数</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <View style={styles.statIconContainerSecondary}>
                    <Text style={styles.statPercentage}>
                      {Math.round((correctCount / totalQuestions) * 100)}%
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>正确率</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Performance Analysis */}
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisTitle}>表现分析</Text>
          <View style={styles.analysisCard}>
            <View style={styles.shadowDark}>
              <View style={styles.shadowLight}>
                {score >= 90 ? (
                  <Text style={styles.analysisText}>
                    非常出色！你已经掌握了这个难度的翻译技巧，继续保持！
                  </Text>
                ) : score >= 70 ? (
                  <Text style={styles.analysisText}>
                    做得不错！你对这个难度已经有了很好的掌握，再接再厉！
                  </Text>
                ) : score >= 60 ? (
                  <Text style={styles.analysisText}>
                    基础还可以，但还有提升空间。建议多练习基础句型，注意语法细节。
                  </Text>
                ) : (
                  <Text style={styles.analysisText}>
                    需要加强练习。建议从更低的难度开始，打好基础后再挑战这个难度。
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.97}
            onPress={handleRetry}
            style={styles.actionButton}
          >
            <LinearGradient
              colors={['#6C63FF', '#896BFF']}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>再练一次</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.97}
            onPress={handleHome}
            style={styles.actionButton}
          >
            <View style={styles.secondaryButton}>
              <FontAwesome name="home" size={18} color="#6C63FF" />
              <Text style={styles.secondaryButtonText}>返回首页</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F3',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
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
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D3436',
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
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,184,148,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreMessage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 24,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: '800',
    color: '#00B894',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#636E72',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E8E8EB',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconContainerSecondary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C63FF',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#636E72',
  },
  analysisContainer: {
    marginBottom: 32,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  analysisCard: {
    marginBottom: 16,
  },
  analysisText: {
    fontSize: 15,
    color: '#636E72',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  actionButton: {
    width: '100%',
  },
  gradientButton: {
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButtonText: {
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '700',
  },
});
