import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'react-native';

interface Result {
  playerId: number;
  playerName: string;
  avatarUrl: string;
  finalScore: number;
  isWinner: boolean;
}

interface Winner {
  playerId: number;
  playerName: string;
  avatarUrl: string;
  score: number;
}

export default function CompetitionResultScreen() {
  const router = useSafeRouter();
  const params = useSafeSearchParams<{ results: string; winner: string }>();

  const results: Result[] = params.results ? JSON.parse(params.results) : [];
  const winner: Winner = params.winner ? JSON.parse(params.winner) : null;

  const handleHome = () => {
    router.push('/');
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <FontAwesome name="trophy" size={24} color="#FFD700" />;
    if (index === 1) return <FontAwesome name="trophy" size={24} color="#C0C0C0" />;
    if (index === 2) return <FontAwesome name="trophy" size={24} color="#CD7F32" />;
    return <FontAwesome name="star" size={24} color="#B2BEC3" />;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return '#B2BEC3';
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
          <Text style={styles.title}>竞技结果</Text>
        </View>

        {/* Winner Card */}
        {winner && (
          <View style={styles.card}>
            <View style={styles.shadowDark}>
              <View style={styles.shadowLight}>
                <View style={styles.winnerBanner}>
                  <FontAwesome name="trophy" size={32} color="#FFD700" />
                  <Text style={styles.winnerTitle}>获胜者</Text>
                </View>

                <View style={styles.winnerContainer}>
                  <View style={styles.winnerAvatarContainer}>
                    <Image
                      source={{ uri: winner.avatarUrl }}
                      style={styles.winnerAvatar}
                    />
                    <View style={styles.winnerCrown}>
                      <FontAwesome name="trophy" size={32} color="#FFD700" />
                    </View>
                  </View>
                  <Text style={styles.winnerName}>{winner.playerName}</Text>
                  <View style={styles.winnerScoreContainer}>
                    <Text style={styles.winnerScoreValue}>{winner.score}</Text>
                    <Text style={styles.winnerScoreLabel}>分</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Results List */}
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>排名</Text>

          {results.map((result, index) => (
            <View key={result.playerId} style={styles.resultItem}>
              <View style={styles.shadowDark}>
                <View style={[styles.shadowLight, result.isWinner && styles.winnerCard]}>
                  <View style={styles.rankContainer}>
                    <View style={styles.rankIcon}>{getRankIcon(index)}</View>
                    <Text style={[styles.rankText, { color: getRankColor(index) }]}>
                      {index + 1}
                    </Text>
                  </View>

                  <View style={styles.playerInfo}>
                    <View style={styles.playerAvatarContainer}>
                      <Image
                        source={{ uri: result.avatarUrl }}
                        style={styles.playerAvatar}
                      />
                    </View>
                    <View style={styles.playerDetails}>
                      <Text style={styles.playerName}>{result.playerName}</Text>
                      {result.isWinner && (
                        <View style={styles.winnerBadge}>
                          <FontAwesome name="trophy" size={14} color="#FFD700" />
                          <Text style={styles.winnerBadgeText}> 获胜</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.scoreContainer}>
                    <Text style={[styles.scoreValue, { color: getRankColor(index) }]}>
                      {result.finalScore}
                    </Text>
                    <Text style={styles.scoreLabel}>分</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.97}
          onPress={handleHome}
          style={styles.buttonContainer}
        >
          <View style={styles.secondaryButton}>
            <FontAwesome name="home" size={18} color="#FF6584" />
            <Text style={styles.secondaryButtonText}>返回首页</Text>
          </View>
        </TouchableOpacity>
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
    color: '#FF6584',
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
    padding: 24,
  },
  winnerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  winnerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFD700',
  },
  winnerContainer: {
    alignItems: 'center',
  },
  winnerAvatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  winnerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  winnerCrown: {
    position: 'absolute',
    top: -16,
    left: '50%',
    transform: [{ translateX: -16 }],
  },
  winnerName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 12,
  },
  winnerScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  winnerScoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFD700',
  },
  winnerScoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#636E72',
    marginLeft: 4,
  },
  resultsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 12,
  },
  winnerCard: {
    backgroundColor: 'rgba(255,215,0,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  rankIcon: {
    marginBottom: 4,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  winnerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  winnerBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 13,
    color: '#636E72',
    marginLeft: 4,
  },
  buttonContainer: {
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
    borderColor: 'rgba(255,101,132,0.2)',
    gap: 8,
    width: '100%',
  },
  secondaryButtonText: {
    color: '#FF6584',
    fontSize: 16,
    fontWeight: '700',
  },
});
