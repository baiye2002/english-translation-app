import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome } from '@expo/vector-icons';

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

const AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
];

interface Player {
  id: number;
  name: string;
  avatarUrl: string;
  difficulties: string[];
}

export default function CompetitionSetupScreen() {
  const router = useSafeRouter();

  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: '玩家1', avatarUrl: AVATARS[0], difficulties: [DIFFICULTIES[0]] },
  ]);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const addPlayer = () => {
    if (players.length >= 4) {
      Alert.alert('提示', '最多只能添加4名玩家');
      return;
    }
    const newPlayer: Player = {
      id: players.length + 1,
      name: `玩家${players.length + 1}`,
      avatarUrl: AVATARS[players.length],
      difficulties: [DIFFICULTIES[0]],
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 1) {
      Alert.alert('提示', '至少需要1名玩家');
      return;
    }
    const newPlayers = players.filter((_, i) => i !== index);
    setPlayers(newPlayers);
  };

  const updatePlayerName = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const updatePlayerAvatar = (index: number, avatarIndex: number) => {
    const newPlayers = [...players];
    newPlayers[index].avatarUrl = AVATARS[avatarIndex];
    setPlayers(newPlayers);
  };

  const selectDifficulty = (index: number) => {
    setCurrentPlayerIndex(index);
    setShowDifficultyModal(true);
  };

  const toggleDifficulty = (difficulty: string) => {
    const newPlayers = [...players];
    const currentDifficulties = newPlayers[currentPlayerIndex].difficulties;

    if (currentDifficulties.includes(difficulty)) {
      // 如果已选中，且只有一个难度，不允许取消
      if (currentDifficulties.length > 1) {
        newPlayers[currentPlayerIndex].difficulties = currentDifficulties.filter(d => d !== difficulty);
        setPlayers(newPlayers);
      } else {
        Alert.alert('提示', '至少需要选择一个难度');
      }
    } else {
      // 如果未选中，添加到列表
      newPlayers[currentPlayerIndex].difficulties = [...currentDifficulties, difficulty];
      setPlayers(newPlayers);
    }
  };

  const handleStart = async () => {
    console.log('开始竞技按钮被点击');
    console.log('玩家列表:', players);

    // 验证所有玩家都有名字（已有默认值，但用户可以清空，所以仍需验证）
    const hasEmptyName = players.some(p => !p.name.trim());
    if (hasEmptyName) {
      console.log('检测到空名字');
      Alert.alert('提示', '请为所有玩家填写名字');
      return;
    }

    console.log('开始创建房间...');
    setIsLoading(true);
    try {
      const url = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/competition/room`;
      console.log('请求URL:', url);

      const requestBody = {
        playerCount: players.length,
        players: players.map((p, i) => ({
          name: p.name,
          avatarUrl: p.avatarUrl,
          difficulties: p.difficulties,
        })),
      };
      console.log('请求体:', requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('响应状态:', response.status);
      const data = await response.json();
      console.log('响应数据:', data);

      if (response.ok) {
        console.log('创建房间成功，准备跳转');
        router.push('/competition', {
          roomId: data.roomId,
          players: JSON.stringify(data.players),
        });
      } else {
        console.log('创建房间失败:', data.error);
        Alert.alert('错误', data.error || '创建房间失败');
      }
    } catch (error) {
      console.error('网络请求异常:', error);
      Alert.alert('错误', '网络请求失败');
    } finally {
      console.log('请求结束，重置loading状态');
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.subtitle}>设置玩家信息，每人选择各自的难度</Text>
        </View>

        {/* Player Cards */}
        <View style={styles.playersContainer}>
          {players.map((player, index) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.shadowDark}>
                <View style={styles.shadowLight}>
                  {/* Avatar Section */}
                  <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                      <Image
                        source={{ uri: player.avatarUrl }}
                        style={styles.avatar}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => updatePlayerAvatar(index, (index + 1) % 4)}
                      style={styles.changeAvatarButton}
                    >
                      <Text style={styles.changeAvatarText}>更换头像</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Name Input */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="输入玩家名称（默认：玩家1）"
                      placeholderTextColor="#B2BEC3"
                      value={player.name}
                      onChangeText={(text) => updatePlayerName(index, text)}
                    />
                  </View>

                  {/* Difficulty Selection */}
                  <TouchableOpacity
                    style={styles.difficultyButton}
                    onPress={() => selectDifficulty(index)}
                  >
                    <FontAwesome name="user" size={16} color="#6C63FF" />
                    <Text style={styles.difficultyButtonText}>
                      {player.difficulties.length > 1
                        ? `${player.difficulties.length} 个难度`
                        : player.difficulties[0]}
                    </Text>
                  </TouchableOpacity>

                  {/* Remove Button */}
                  {players.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removePlayer(index)}
                    >
                      <FontAwesome name="minus" size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}

          {/* Add Player Button */}
          {players.length < 4 && (
            <TouchableOpacity
              activeOpacity={0.97}
              onPress={addPlayer}
              style={styles.addButton}
            >
              <View style={styles.shadowDark}>
                <View style={styles.shadowLight}>
                  <View style={styles.addContent}>
                    <FontAwesome name="plus" size={24} color="#6C63FF" />
                    <Text style={styles.addButtonText}>添加玩家</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Start Button */}
        <TouchableOpacity
          activeOpacity={0.97}
          onPress={handleStart}
          onPressIn={() => console.log('开始竞技按钮被按下')}
          disabled={isLoading}
          style={styles.startButtonContainer}
        >
          <LinearGradient
            colors={['#FF6584', '#FF85A3']}
            style={styles.startButton}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FontAwesome name="play" size={18} color="#FFFFFF" />
                <Text style={styles.startButtonText}>开始竞技</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Difficulty Modal */}
        <Modal
          visible={showDifficultyModal}
          transparent
          animationType="slide"
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowDifficultyModal(false)}
          >
            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.shadowDark}>
                <View style={styles.shadowLight}>
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>选择难度（可多选）</Text>
                    <Text style={styles.modalSubtitle}>
                      已选 {players[currentPlayerIndex]?.difficulties.length} 个
                    </Text>
                  </View>
                  <ScrollView style={styles.difficultyList}>
                    {DIFFICULTIES.map((difficulty, index) => {
                      const isSelected = players[currentPlayerIndex]?.difficulties.includes(difficulty);
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.difficultyItem,
                            isSelected && styles.difficultyItemSelected,
                          ]}
                          onPress={() => toggleDifficulty(difficulty)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.difficultyItemText,
                            isSelected && styles.difficultyItemTextSelected,
                          ]}>
                            {difficulty}
                          </Text>
                          {isSelected && (
                            <FontAwesome name="check-circle" size={20} color="#6C63FF" />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowDifficultyModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalCloseButtonText}>完成</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#636E72',
  },
  playersContainer: {
    marginBottom: 24,
  },
  playerCard: {
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
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  changeAvatarButton: {
    padding: 8,
  },
  changeAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C63FF',
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#E8E8EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  difficultyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108,99,255,0.12)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
  },
  removeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,107,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    marginBottom: 16,
  },
  addContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6C63FF',
  },
  startButtonContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  startButton: {
    flexDirection: 'row',
    borderRadius: 9999,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C63FF',
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  difficultyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.1)',
  },
  difficultyItemSelected: {
    backgroundColor: 'rgba(108,99,255,0.08)',
    borderColor: '#6C63FF',
    borderWidth: 2,
  },
  difficultyItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
  },
  difficultyItemTextSelected: {
    color: '#6C63FF',
  },
  modalCloseButton: {
    padding: 16,
    backgroundColor: '#E8E8EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#636E72',
  },
});
