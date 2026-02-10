import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { CHARACTERS, type CharacterData } from '@/lib/characters';
import { playButtonHaptic, playSuccessSound } from '@/lib/sounds';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

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

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={[styles.cardWrapper, animatedStyle]}
    >
      <Pressable
        onPress={() => {
          playButtonHaptic();
          onSelect();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          isSelected && styles.cardSelected
        ]}
      >
        <Image
          source={character.asset}
          style={styles.cardImage}
          resizeMode="contain"
        />
        <Text style={[
          styles.cardName,
          isSelected && styles.cardNameSelected
        ]}>
          {character.nameKo}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function CharacterSelectScreen() {
  const selectedCharacterId = useAppStore((s) => s.selectedCharacter);
  const selectCharacter = useAppStore((s) => s.selectCharacter);
  const [activeTab, setActiveTab] = useState<'all' | 'boy' | 'girl'>('all');

  const filteredCharacters = activeTab === 'all'
    ? CHARACTERS
    : CHARACTERS.filter(c => c.category === activeTab || c.category === 'default');

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
              style={[
                styles.tab,
                isActive && styles.tabActive
              ]}
            >
              <Text style={[
                styles.tabText,
                isActive && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView 
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {filteredCharacters.map((character, idx) => (
          <CharacterCard
            key={character.id}
            character={character}
            isSelected={selectedCharacterId === character.id}
            onSelect={() => handleSelect(character.id)}
            index={idx}
          />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0', 
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Jua', 
    color: '#3E2723',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: '#5D4037',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D7CCC8',
  },
  tabActive: {
    backgroundColor: '#FFF',
    borderColor: '#FFB74D',
    borderWidth: 2,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Jua',
    color: '#8D6E63',
  },
  tabTextActive: {
    color: '#3E2723',
  },
  grid: {
    alignItems: 'center', 
    paddingBottom: 40,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16, 
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    height: 240, 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#FFB74D',
    backgroundColor: '#FFF8E1',
  },
  cardImage: {
    width: 150, 
    height: 150,
    marginBottom: 16,
  },
  cardName: {
    fontSize: 24, 
    fontFamily: 'Jua',
    color: '#3E2723',
  },
  cardNameSelected: {
    color: '#E65100',
  },
});
