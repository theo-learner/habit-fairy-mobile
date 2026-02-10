import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { playButtonHaptic, playStarHaptic } from '@/lib/sounds';
import { AVATAR_ITEMS } from '@/lib/items';
import { CHARACTERS } from '@/lib/characters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH - 48; // 1열 리스트

function ItemCard({
  item,
  canAfford,
  isOwned,
  isEquipped,
  onPress,
}: {
  item: (typeof AVATAR_ITEMS)[0];
  canAfford: boolean;
  isOwned: boolean;
  isEquipped: boolean;
  onPress: () => void;
}) {
  // ... (생략) ...

  // 아이템 배경색 (파스텔톤 랜덤 느낌)
  const bgColors = ['#E3F2FD', '#F3E5F5', '#E0F2F1', '#FFF3E0', '#FFEBEE'];
  const bgColor = bgColors[item.id.charCodeAt(0) % bgColors.length];

  return (
    <Animated.View style={[styles.itemWrapper, animStyle]}>
      <Pressable onPress={handlePress} style={[styles.itemCard, { backgroundColor: bgColor }]}>
        <View style={styles.itemContent}>
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {!isOwned && <Text style={styles.itemPrice}>{item.cost} ⭐</Text>}
          </View>
        </View>
        
        {/* 우측 버튼 영역 */}
        <View style={styles.itemAction}>
          {isEquipped ? (
            <View style={styles.equippedBadge}>
              <Text style={styles.equippedText}>장착 중</Text>
            </View>
          ) : isOwned ? (
            <View style={styles.ownedBadge}>
              <Text style={styles.ownedText}>보유</Text>
            </View>
          ) : (
            <View style={[styles.buyButton, !canAfford && { backgroundColor: '#BDBDBD' }]}>
              {/* 잠금 아이콘 또는 구매 텍스트 */}
              {!canAfford ? (
                <Text style={{ fontSize: 16 }}>🔒</Text>
              ) : (
                <Text style={styles.buyButtonText}>구매</Text>
              )}
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ... (생략) ...

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Jua',
    color: '#333',
  },
  starBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  starText: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: '#FBC02D',
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  previewCircleOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FFF',
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
  },
  previewCircleInner: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  characterImage: {
    width: 140,
    height: 140,
  },
  characterName: {
    marginTop: 10,
    fontSize: 24,
    fontFamily: 'Jua',
    color: '#333',
  },
  tabContainer: {
    marginBottom: 10,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#FFD54F', // 노란색 활성 탭
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: '#555',
  },
  tabTextActive: {
    color: '#333',
  },
  grid: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  itemWrapper: {
    width: ITEM_WIDTH,
    marginBottom: 12,
  },
  itemCard: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row', // 가로 배치 (1열 리스트)
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  itemInfo: {
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 48,
  },
  itemName: {
    fontSize: 20,
    fontFamily: 'Jua',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#F9A825',
    fontFamily: 'Jua',
  },
  itemAction: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  buyButton: {
    backgroundColor: '#FFD54F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: '#333',
  },
  equippedBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  equippedText: {
    fontSize: 14,
    fontFamily: 'Jua',
    color: '#555',
  },
  ownedBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ownedText: {
    fontSize: 14,
    fontFamily: 'Jua',
    color: '#1E88E5',
  },
  lockedOverlay: {
    display: 'none', // 리스트형에서는 오버레이 대신 버튼 비활성화로 처리
  },
});
