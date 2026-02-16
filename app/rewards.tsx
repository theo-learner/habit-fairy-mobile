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
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { playButtonHaptic, playStarHaptic } from '@/lib/sounds';
import { AVATAR_ITEMS } from '@/lib/items';
import { CHARACTERS } from '@/lib/characters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH - 48;

const C = {
  lavender: '#8E97C8',
  lavenderLight: '#B8C0E8',
  sage: '#7DB89E',
  dark: '#4A5568',
  coral: '#E8744F',
  white: '#FFFFFF',
  textDark: '#2D3436',
  textMid: '#636E72',
};

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
    setTimeout(() => (scale.value = withSpring(1)), 100);
    onPress();
  };

  return (
    <Animated.View style={[styles.itemWrapper, animStyle]}>
      <Pressable onPress={handlePress} style={styles.itemCard}>
        <View style={styles.itemContent}>
          <View style={styles.itemEmojiCircle}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {!isOwned && <Text style={styles.itemPrice}>{item.cost} ⭐</Text>}
          </View>
        </View>

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
            <View style={[styles.buyButton, !canAfford && { backgroundColor: '#DDD' }]}>
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
    () =>
      selectedCategory === '전체'
        ? AVATAR_ITEMS
        : AVATAR_ITEMS.filter((i) => i.category === selectedCategory),
    [selectedCategory],
  );

  const character = CHARACTERS.find((c) => c.id === selectedCharacterId) || CHARACTERS[0];

  const handleItemPress = (item: (typeof AVATAR_ITEMS)[0]) => {
    playButtonHaptic();
    if (ownedItems.includes(item.id)) {
      toggleEquipItem(item.id, item.category);
    } else if (totalStars >= item.cost) {
      purchaseItem(item.id, item.cost);
      playStarHaptic();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 캐릭터 미리보기 */}
        <View style={styles.previewContainer}>
          <View style={styles.previewCircle}>
            <Image source={character.asset} style={styles.characterImage} resizeMode="contain" />
          </View>
          <Text style={styles.characterName}>{character.nameKo}</Text>
          <View style={styles.starBadge}>
            <Text style={styles.starText}>{totalStars.toLocaleString()} ⭐</Text>
          </View>
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

        {/* 아이템 리스트 */}
        <View style={styles.grid}>
          {filteredItems.map((item) => (
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

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  previewCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: C.white,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  characterImage: {
    width: 130,
    height: 130,
  },
  characterName: {
    marginTop: 12,
    fontSize: 22,
    fontFamily: 'Jua',
    color: C.white,
  },
  starBadge: {
    marginTop: 8,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  starText: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: C.coral,
  },
  tabContainer: {
    marginBottom: 12,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabActive: {
    backgroundColor: C.white,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Jua',
    color: 'rgba(255,255,255,0.8)',
  },
  tabTextActive: {
    color: C.coral,
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
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 88,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  itemEmojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: C.textDark,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: C.coral,
    fontFamily: 'Jua',
  },
  itemAction: {
    minWidth: 72,
    alignItems: 'flex-end',
  },
  buyButton: {
    backgroundColor: C.coral,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9999,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 14,
    fontFamily: 'Jua',
    color: C.white,
  },
  equippedBadge: {
    backgroundColor: C.sage,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  equippedText: {
    fontSize: 12,
    fontFamily: 'Jua',
    color: C.white,
  },
  ownedBadge: {
    backgroundColor: 'rgba(142,151,200,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  ownedText: {
    fontSize: 12,
    fontFamily: 'Jua',
    color: C.lavender,
  },
});
