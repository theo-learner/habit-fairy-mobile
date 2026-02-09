// ============================================
// 캐릭터 선택 화면
// 11종 캐릭터 중 하나를 선택
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { CHARACTERS, getCharactersByCategory, type CharacterData } from '@/lib/characters';
import { playButtonHaptic, playSuccessSound } from '@/lib/sounds';

function CharacterCard({
  character,
  isSelected,
  onSelect,
}: {
  character: CharacterData;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    playButtonHaptic();
    scale.value = withSpring(0.9, { damping: 15 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, 100);
    onSelect();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.characterCard,
          isSelected && styles.characterCardSelected,
        ]}
      >
        <Image
          source={character.asset}
          style={styles.characterImage}
          resizeMode="contain"
        />
        <Text style={styles.characterEmoji}>{character.emoji}</Text>
        <Text style={[styles.characterName, isSelected && styles.characterNameSelected]}>
          {character.nameKo}
        </Text>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>✓</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function CharacterSelectScreen() {
  const router = useRouter();
  const selectedCharacter = useAppStore((s) => s.selectedCharacter);
  const selectCharacter = useAppStore((s) => s.selectCharacter);
  const childName = useAppStore((s) => s.childName);

  const [activeTab, setActiveTab] = useState<'all' | 'boy' | 'girl'>('all');

  const filteredCharacters = activeTab === 'all'
    ? CHARACTERS
    : CHARACTERS.filter(c => c.category === activeTab || c.category === 'default');

  const handleSelect = async (characterId: string) => {
    await selectCharacter(characterId);
    playSuccessSound();
  };

  const name = childName || '친구';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Text style={styles.headerTitle}>🎭 캐릭터 선택</Text>
        </Animated.View>

        {/* 안내 메시지 */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.infoBox}>
          <Text style={styles.infoText}>
            {name}의 친구를 골라주세요!{'\n'}
            선택한 캐릭터가 홈 화면에 나타나요 ✨
          </Text>
        </Animated.View>

        {/* 카테고리 탭 */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.tabContainer}>
          {[
            { key: 'all', label: '전체', emoji: '🌟' },
            { key: 'boy', label: '남아용', emoji: '👦' },
            { key: 'girl', label: '여아용', emoji: '👧' },
          ].map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => {
                playButtonHaptic();
                setActiveTab(tab.key as 'all' | 'boy' | 'girl');
              }}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
              ]}
            >
              <Text style={styles.tabEmoji}>{tab.emoji}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* 캐릭터 그리드 */}
        <View style={styles.characterGrid}>
          {filteredCharacters.map((character, idx) => (
            <Animated.View
              key={character.id}
              entering={FadeInDown.delay(idx * 50).duration(300)}
              style={styles.gridItem}
            >
              <CharacterCard
                character={character}
                isSelected={selectedCharacter === character.id}
                onSelect={() => handleSelect(character.id)}
              />
            </Animated.View>
          ))}
        </View>

        {/* 선택된 캐릭터 정보 */}
        {selectedCharacter && (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.selectedInfo}>
            <Text style={styles.selectedInfoTitle}>
              선택된 친구: {CHARACTERS.find(c => c.id === selectedCharacter)?.nameKo}
            </Text>
            <Text style={styles.selectedInfoDesc}>
              {CHARACTERS.find(c => c.id === selectedCharacter)?.description}
            </Text>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoText: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    gap: 6,
  },
  tabActive: {
    backgroundColor: '#FBBF24',
  },
  tabEmoji: {
    fontSize: 16,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  gridItem: {
    width: '30%',
    minWidth: 100,
    maxWidth: 120,
  },
  characterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 140,
  },
  characterCardSelected: {
    borderColor: '#FBBF24',
    backgroundColor: '#FFFBEB',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  characterImage: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  characterEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  characterName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
  },
  characterNameSelected: {
    color: '#B45309',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  selectedInfo: {
    marginTop: 24,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  selectedInfoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B45309',
    marginBottom: 4,
  },
  selectedInfoDesc: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
