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
const CARD_WIDTH = SCREEN_WIDTH - 48; // 1열 리스트 (좌우 여백 24*2)

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
  // ... (생략) ...

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

// ... (생략) ...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0', // 아주 연한 베이지
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Jua', // 폰트 적용
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
    alignItems: 'center', // 중앙 정렬
    paddingBottom: 40,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 16, // 간격 늘림
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    height: 240, // 카드 높이 증가 (캐릭터 더 크게)
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
    width: 150, // 이미지 크기 확대
    height: 150,
    marginBottom: 16,
  },
  cardName: {
    fontSize: 24, // 이름 크기 확대
    fontFamily: 'Jua',
    color: '#3E2723',
  },
  cardNameSelected: {
    color: '#E65100',
  },
});
