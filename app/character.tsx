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
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { CHARACTERS, type CharacterData } from '@/lib/characters';
import { playButtonHaptic, playSuccessSound } from '@/lib/sounds';

import { getAppWidth } from '@/lib/layout';

const SCREEN_WIDTH = getAppWidth();
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

const C = {
  lavender: '#8E97C8',
  dark: '#4A5568',
  coral: '#E8744F',
  sage: '#7DB89E',
  white: '#FFFFFF',
  textDark: '#2D3436',
  textMid: '#636E72',
};

function CharacterCard({
  character,
  isSelected,
  onSelect,
  index,
}: {
  character: CharacterData;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(400)}
      style={[styles.cardWrapper, animatedStyle]}
    >
      <Pressable
        onPress={() => {
          playButtonHaptic();
          scale.value = withSpring(0.95);
          setTimeout(() => (scale.value = withSpring(1)), 100);
          onSelect();
        }}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        {/* 원형 캐릭터 아이콘 */}
        <View style={[styles.charCircle, isSelected && { borderColor: C.coral, borderWidth: 3 }]}>
          <Image source={character.asset} style={styles.cardImage} resizeMode="contain" />
        </View>
        <Text style={[styles.cardName, isSelected && { color: C.coral }]}>
          {character.nameKo}
        </Text>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>선택됨</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function CharacterSelectScreen() {
  const selectedCharacterId = useAppStore((s) => s.selectedCharacter);
  const selectCharacter = useAppStore((s) => s.selectCharacter);
  const [activeTab, setActiveTab] = useState<'all' | 'boy' | 'girl'>('all');

  const filteredCharacters =
    activeTab === 'all'
      ? CHARACTERS
      : CHARACTERS.filter((c) => c.category === activeTab || c.category === 'default');

  const handleSelect = async (characterId: string) => {
    await selectCharacter(characterId);
    playSuccessSound();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>캐릭터 선택</Text>
        <Text style={styles.headerSubtitle}>모험을 함께할 친구를 골라주세요!</Text>
      </View>

      {/* 탭 (pill 형태) */}
      <View style={styles.tabContainer}>
        {[
          { key: 'all', label: '전체' },
          { key: 'boy', label: '남아용' },
          { key: 'girl', label: '여아용' },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                playButtonHaptic();
                setActiveTab(tab.key as any);
              }}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {filteredCharacters.map((character, idx) => (
          <CharacterCard
            key={character.id}
            character={character}
            isSelected={selectedCharacterId === character.id}
            onSelect={() => handleSelect(character.id)}
            index={idx}
          />
        ))}
        <View style={{ height: 120, width: '100%' }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: 'Jua',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    fontFamily: 'Jua',
    color: '#2D2D3F',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabActive: {
    backgroundColor: C.white,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Jua',
    color: '#1A1A2E',
  },
  tabTextActive: {
    color: '#1A1A2E',
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 14,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: C.coral,
    backgroundColor: '#FFF9F5',
  },
  charCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EDF0F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: 72,
    height: 72,
  },
  cardName: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: C.textDark,
    marginBottom: 4,
  },
  selectedBadge: {
    backgroundColor: C.coral,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginTop: 4,
  },
  selectedText: {
    fontSize: 11,
    fontFamily: 'Jua',
    color: C.white,
  },
});
