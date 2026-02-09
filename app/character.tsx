// ============================================
// 캐릭터 선택 화면 - Enhanced with Effects
// 11종 캐릭터 중 하나를 선택 + 캐릭터별 이펙트
// ============================================

import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { CHARACTERS, type CharacterData } from '@/lib/characters';
import { playButtonHaptic, playSuccessSound } from '@/lib/sounds';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min((SCREEN_WIDTH - 60) / 3, 110);

// 이펙트 파티클 컴포넌트
function EffectParticle({ emoji, delay, size = 16 }: { emoji: string; delay: number; size?: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 40;
    translateX.value = randomX;
    
    setTimeout(() => {
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 500 })
      );
      translateY.value = withSequence(
        withTiming(-30, { duration: 1800, easing: Easing.out(Easing.quad) })
      );
    }, delay);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.Text style={[{ fontSize: size, position: 'absolute' }, animStyle]}>
      {emoji}
    </Animated.Text>
  );
}

// 캐릭터 카드 컴포넌트
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
  const [showEffects, setShowEffects] = useState(false);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    playButtonHaptic();
    scale.value = withSequence(
      withSpring(0.85, { damping: 15 }),
      withSpring(1.05, { damping: 12 }),
      withSpring(1, { damping: 15 })
    );
    setShowEffects(true);
    setTimeout(() => setShowEffects(false), 2000);
    onSelect();
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay(index * 40).duration(400)}
      style={[animStyle, { width: CARD_WIDTH }]}
    >
      <Pressable onPress={handlePress}>
        <LinearGradient
          colors={isSelected ? character.theme.gradient : ['#FFFFFF', '#F9FAFB']}
          style={[
            styles.characterCard,
            isSelected && { 
              borderColor: character.theme.primary,
              shadowColor: character.theme.primary,
            },
          ]}
        >
          {/* 이펙트 파티클 */}
          {showEffects && (
            <View style={styles.effectContainer}>
              {[0, 1, 2, 3, 4].map((i) => (
                <EffectParticle 
                  key={i} 
                  emoji={character.theme.effectEmoji} 
                  delay={i * 100}
                  size={14}
                />
              ))}
            </View>
          )}

          {/* 캐릭터 이미지 */}
          <View style={styles.imageContainer}>
            <Image
              source={character.asset}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </View>

          {/* 캐릭터 이름 */}
          <Text style={[
            styles.characterName,
            isSelected && { color: character.theme.primary, fontWeight: '800' }
          ]}>
            {character.nameKo}
          </Text>

          {/* 선택 체크 */}
          {isSelected && (
            <View style={[styles.selectedBadge, { backgroundColor: character.theme.primary }]}>
              <Text style={styles.selectedBadgeText}>✓</Text>
            </View>
          )}

          {/* 카테고리 뱃지 */}
          <View style={[
            styles.categoryBadge,
            character.category === 'boy' && styles.categoryBadgeBoy,
            character.category === 'girl' && styles.categoryBadgeGirl,
          ]}>
            <Text style={styles.categoryBadgeText}>
              {character.category === 'boy' ? '👦' : character.category === 'girl' ? '👧' : '⭐'}
            </Text>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function CharacterSelectScreen() {
  const selectedCharacterId = useAppStore((s) => s.selectedCharacter);
  const selectCharacter = useAppStore((s) => s.selectCharacter);
  const childName = useAppStore((s) => s.childName);

  const [activeTab, setActiveTab] = useState<'all' | 'boy' | 'girl'>('all');

  const filteredCharacters = activeTab === 'all'
    ? CHARACTERS
    : CHARACTERS.filter(c => c.category === activeTab || c.category === 'default');

  const selectedCharacter = CHARACTERS.find(c => c.id === selectedCharacterId);

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
          <Text style={styles.headerTitle}>🎭 나의 친구 선택</Text>
          <Text style={styles.headerSubtitle}>{name}와 함께할 친구를 골라주세요!</Text>
        </Animated.View>

        {/* 선택된 캐릭터 프리뷰 */}
        {selectedCharacter && (
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <LinearGradient
              colors={selectedCharacter.theme.gradient}
              style={styles.previewCard}
            >
              <View style={styles.previewImageWrap}>
                <Image
                  source={selectedCharacter.asset}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                {/* 플로팅 이펙트 */}
                <View style={styles.floatingEffects}>
                  {[0, 1, 2].map((i) => (
                    <Animated.Text
                      key={i}
                      entering={FadeIn.delay(i * 200).duration(500)}
                      style={[styles.floatingEmoji, { 
                        left: 20 + i * 40,
                        top: 10 + (i % 2) * 20,
                      }]}
                    >
                      {selectedCharacter.theme.effectEmoji}
                    </Animated.Text>
                  ))}
                </View>
              </View>
              <View style={styles.previewInfo}>
                <Text style={[styles.previewName, { color: selectedCharacter.theme.primary }]}>
                  {selectedCharacter.emoji} {selectedCharacter.nameKo}
                </Text>
                <Text style={styles.previewDesc}>{selectedCharacter.description}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* 카테고리 탭 */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.tabContainer}>
          {[
            { key: 'all', label: '전체', emoji: '🌟', count: CHARACTERS.length },
            { key: 'boy', label: '남아용', emoji: '👦', count: CHARACTERS.filter(c => c.category === 'boy').length },
            { key: 'girl', label: '여아용', emoji: '👧', count: CHARACTERS.filter(c => c.category === 'girl').length },
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
              <View style={[styles.tabCount, activeTab === tab.key && styles.tabCountActive]}>
                <Text style={[styles.tabCountText, activeTab === tab.key && styles.tabCountTextActive]}>
                  {tab.count}
                </Text>
              </View>
            </Pressable>
          ))}
        </Animated.View>

        {/* 캐릭터 그리드 */}
        <View style={styles.characterGrid}>
          {filteredCharacters.map((character, idx) => (
            <CharacterCard
              key={character.id}
              character={character}
              isSelected={selectedCharacterId === character.id}
              onSelect={() => handleSelect(character.id)}
              index={idx}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
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
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  previewCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  previewImageWrap: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
  },
  floatingEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingEmoji: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.7,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 16,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  previewDesc: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabActive: {
    backgroundColor: '#FBBF24',
    borderColor: '#FBBF24',
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#FFFFFF',
  },
  tabCount: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tabCountActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  tabCountTextActive: {
    color: '#FFFFFF',
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  characterCard: {
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  effectContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  imageContainer: {
    width: 65,
    height: 65,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterImage: {
    width: 60,
    height: 60,
  },
  characterName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  categoryBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeBoy: {
    backgroundColor: '#DBEAFE',
  },
  categoryBadgeGirl: {
    backgroundColor: '#FCE7F3',
  },
  categoryBadgeText: {
    fontSize: 10,
  },
});
