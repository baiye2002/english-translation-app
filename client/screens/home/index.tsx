import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useSafeRouter();

  const handlePracticeMode = () => {
    router.push('/practice-difficulty');
  };

  const handleCompetitionMode = () => {
    router.push('/competition-setup');
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
          <Text style={styles.title}>英语翻译练习</Text>
          <Text style={styles.subtitle}>选择练习模式，提升英语翻译能力</Text>
        </View>

        {/* Practice Mode Card */}
        <TouchableOpacity
          activeOpacity={0.97}
          onPress={handlePracticeMode}
          style={styles.card}
        >
          <View style={styles.shadowDark}>
            <View style={styles.shadowLight}>
              <View style={styles.iconContainer}>
                <FontAwesome name="book" size={32} color="#6C63FF" />
              </View>
              <Text style={styles.cardTitle}>练习模式</Text>
              <Text style={styles.cardDescription}>
                选择难度，完成5道翻译练习，获得实时反馈和评分
              </Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <FontAwesome name="bullseye" size={16} color="#6C63FF" />
                  <Text style={styles.featureText}>实时AI评判</Text>
                </View>
                <View style={styles.featureItem}>
                  <FontAwesome name="trophy" size={16} color="#6C63FF" />
                  <Text style={styles.featureText}>成绩统计</Text>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <LinearGradient
                  colors={['#6C63FF', '#896BFF']}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>开始练习</Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Competition Mode Card */}
        <TouchableOpacity
          activeOpacity={0.97}
          onPress={handleCompetitionMode}
          style={styles.card}
        >
          <View style={styles.shadowDark}>
            <View style={styles.shadowLight}>
              <View style={styles.iconContainerSecondary}>
                <FontAwesome name="users" size={32} color="#FF6584" />
              </View>
              <Text style={styles.cardTitle}>竞技模式</Text>
              <Text style={styles.cardDescription}>
                最多4人同时竞技，每人选择难度，轮流答题决出胜负
              </Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <FontAwesome name="users" size={16} color="#FF6584" />
                  <Text style={[styles.featureText, styles.featureTextSecondary]}>多人对战</Text>
                </View>
                <View style={styles.featureItem}>
                  <FontAwesome name="trophy" size={16} color="#FF6584" />
                  <Text style={[styles.featureText, styles.featureTextSecondary]}>排名系统</Text>
                </View>
              </View>
              <View style={styles.buttonContainer}>
                <LinearGradient
                  colors={['#FF6584', '#FF85A3']}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>开始竞技</Text>
                </LinearGradient>
              </View>
            </View>
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
    marginBottom: 32,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(108,99,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerSecondary: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,101,132,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 15,
    color: '#636E72',
    lineHeight: 22,
    marginBottom: 20,
  },
  featureList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
    marginLeft: 8,
  },
  featureTextSecondary: {
    color: '#FF6584',
  },
  buttonContainer: {
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
});
