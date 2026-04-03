import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const DIFFICULTIES = [
  '小学一年级',
  '小学二年级',
  '小学三年级',
  '小学四年级',
  '小学五年级',
  '小学六年级',
  '初中一年级',
  '初中二年级',
  '初中三年级',
  '高中一年级',
  '高中二年级',
  '高中三年级',
  '大学',
];

export default function PracticeDifficultyScreen() {
  const router = useSafeRouter();

  const handleSelectDifficulty = (difficulty: string) => {
    router.push('/practice', { difficulty });
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
          <Text style={styles.title}>选择难度</Text>
          <Text style={styles.subtitle}>选择适合你的难度级别，开始练习</Text>
        </View>

        {/* Difficulty Grid */}
        <View style={styles.grid}>
          {DIFFICULTIES.map((difficulty, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.97}
              onPress={() => handleSelectDifficulty(difficulty)}
              style={styles.difficultyCard}
            >
              <View style={styles.shadowDark}>
                <View style={styles.shadowLight}>
                  <Text style={styles.difficultyNumber}>{index + 1}</Text>
                  <Text style={styles.difficultyText}>{difficulty}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    marginBottom: 16,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  difficultyCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 16,
  },
  shadowDark: {
    shadowColor: '#D1D9E6',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    borderRadius: 20,
  },
  shadowLight: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: -4, height: -4 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    backgroundColor: '#F0F0F3',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  difficultyNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C63FF',
    marginBottom: 8,
    opacity: 0.6,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
  },
});
