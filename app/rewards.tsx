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
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95);
    setTimeout(() => scale.value = withSpring(1), 100);
    onPress();
  };

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
      colors={['#E0F7FA', '#FFF3E0', '#F3E5F5']} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>캐릭터 꾸미기</Text>
          <View style={styles.starBadge}>
            <Text style={styles.starText}>{totalStars.toLocaleString()} ⭐</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
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
    backgroundColor: '#FFD54F', 
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
    flexDirection: 'row', 
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
    display: 'none',
  },
});
