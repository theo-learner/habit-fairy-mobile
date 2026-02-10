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
const ITEM_WIDTH = (SCREEN_WIDTH - 48) / 3; // 3열 그리드 (여백 16*2 + 간격 8*2)

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
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95);
    setTimeout(() => scale.value = withSpring(1), 100);
    onPress();
  };

  // 아이템 배경색 (파스텔톤 랜덤 느낌)
  const bgColors = ['#E3F2FD', '#F3E5F5', '#E0F2F1', '#FFF3E0', '#FFEBEE'];
  const bgColor = bgColors[item.id.charCodeAt(0) % bgColors.length];

  return (
    <Animated.View style={[styles.itemWrapper, animStyle]}>
      <Pressable onPress={handlePress} style={[styles.itemCard, { backgroundColor: bgColor }]}>
        {/* 장착 중 뱃지 */}
        {isEquipped && (
          <View style={styles.equippedBadge}>
            <Text style={styles.equippedText}>장착 중</Text>
          </View>
        )}

        {/* 잠금 오버레이 */}
        {!isOwned && !canAfford && (
          <View style={styles.lockedOverlay}>
            <Text style={{ fontSize: 10, color: '#FFF', fontWeight: 'bold' }}>잠김</Text>
          </View>
        )}

        <Text style={styles.itemEmoji}>{item.emoji}</Text>
        <Text style={styles.itemName}>{item.name}</Text>
        
        {!isOwned ? (
          <>
            <Text style={styles.itemPrice}>{item.cost} ⭐</Text>
            <View style={[styles.buyButton, !canAfford && { backgroundColor: '#BDBDBD' }]}>
              <Text style={styles.buyButtonText}>구매</Text>
            </View>
          </>
        ) : (
          <View style={{ height: 20 }} /> // 보유 중일 때 공간 확보
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function RewardsScreen() {
  const totalStars = useAppStore((s) => s.totalStars);
  const ownedItems = useAppStore((s) => s.ownedItems || []);
  const equippedItems = useAppStore((s) => s.equippedItems || {});
  const selectedCharacterId = useAppStore((s) => s.selectedCharacter);
  const purchaseItem = useAppStore((s) => s.purchaseItem);
  const toggleEquipItem = useAppStore((s) => s.toggleEquipItem);
  
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const categories = ['전체', '모자', '날개', '배경', '소품'];

  const filteredItems = useMemo(
    () => selectedCategory === '전체'
        ? AVATAR_ITEMS
        : AVATAR_ITEMS.filter((i) => i.category === selectedCategory),
    [selectedCategory],
  );

  const character = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];

  const handleItemPress = (item: typeof AVATAR_ITEMS[0]) => {
    playButtonHaptic();
    if (ownedItems.includes(item.id)) {
      toggleEquipItem(item.id, item.category);
    } else if (totalStars >= item.cost) {
      purchaseItem(item.id, item.cost);
      playStarHaptic();
    }
  };

  return (
    <LinearGradient
      colors={['#E0F7FA', '#FFF3E0', '#F3E5F5']} // 배경 그라데이션 (하늘 -> 오렌지 -> 보라)
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>캐릭터 꾸미기</Text>
          <View style={styles.starBadge}>
            <Text style={styles.starText}>{totalStars.toLocaleString()} ⭐</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 캐릭터 프리뷰 (빛나는 원형) */}
          <View style={styles.previewContainer}>
            <View style={styles.previewCircleOuter}>
              <View style={styles.previewCircleInner}>
                <Image 
                  source={character.asset} 
                  style={styles.characterImage} 
                  resizeMode="contain" 
                />
              </View>
            </View>
            <Text style={styles.characterName}>{character.nameKo}</Text>
          </View>

          {/* 카테고리 탭 */}
          <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      playButtonHaptic();
                      setSelectedCategory(cat);
                    }}
                    style={[styles.tab, isActive && styles.tabActive]}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{cat}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* 아이템 그리드 */}
          <View style={styles.grid}>
            {filteredItems.map((item, idx) => (
              <ItemCard
                key={item.id}
                item={item}
                canAfford={totalStars >= item.cost}
                isOwned={ownedItems.includes(item.id)}
                isEquipped={equippedItems[item.category] === item.id}
                onPress={() => handleItemPress(item)}
              />
            ))}
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

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
    fontSize: 22,
    fontWeight: '800',
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
    fontSize: 14,
    fontWeight: '700',
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
    fontSize: 20,
    fontWeight: '800',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  tabTextActive: {
    color: '#333',
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  itemWrapper: {
    width: ITEM_WIDTH,
    marginBottom: 8,
  },
  itemCard: {
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    height: 140,
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemEmoji: {
    fontSize: 32,
    marginTop: 8,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 11,
    color: '#F9A825',
    fontWeight: '700',
  },
  buyButton: {
    backgroundColor: '#FFD54F',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#333',
  },
  equippedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  equippedText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#555',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
