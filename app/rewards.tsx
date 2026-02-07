// ============================================
// 보상 화면 — 별 모아보기 + 캐릭터 꾸미기
// Phase 1: 별 통계 + 아이템 미리보기
// ============================================

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import FairyCharacter from '@/components/FairyCharacter';
import { useAppStore } from '@/lib/store';
import { playButtonHaptic, playStarHaptic } from '@/lib/sounds';

/** 꾸미기 아이템 (Phase 1 — 프리뷰) */
const AVATAR_ITEMS = [
  { id: 'hat-ribbon', name: '파란 리본', emoji: '🎀', cost: 5, category: '모자' },
  { id: 'hat-wizard', name: '마법사 모자', emoji: '🎩', cost: 10, category: '모자' },
  { id: 'hat-crown', name: '왕관', emoji: '👑', cost: 20, category: '모자' },
  { id: 'hat-flower', name: '꽃 머리띠', emoji: '🌸', cost: 15, category: '모자' },
  { id: 'wing-butterfly', name: '나비 날개', emoji: '🦋', cost: 30, category: '날개' },
  { id: 'wing-angel', name: '천사 날개', emoji: '🕊️', cost: 50, category: '날개' },
  { id: 'bg-rainbow', name: '무지개 배경', emoji: '🌈', cost: 25, category: '배경' },
  { id: 'bg-stars', name: '별빛 배경', emoji: '🌌', cost: 40, category: '배경' },
  { id: 'acc-wand', name: '마법 지팡이', emoji: '🪄', cost: 35, category: '소품' },
  { id: 'acc-heart', name: '하트 목걸이', emoji: '💖', cost: 15, category: '소품' },
  { id: 'acc-star', name: '별빛 안경', emoji: '🤩', cost: 20, category: '소품' },
  { id: 'acc-unicorn', name: '유니콘 뿔', emoji: '🦄', cost: 100, category: '소품' },
];

/** 아이템 카드 */
function ItemCard({
  item,
  canAfford,
  isOwned,
}: {
  item: (typeof AVATAR_ITEMS)[0];
  canAfford: boolean;
  isOwned: boolean;
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
    }, 150);
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.itemCard,
          isOwned && styles.itemCardOwned,
          !canAfford && !isOwned && styles.itemCardLocked,
        ]}
      >
        <Text style={[styles.itemEmoji, !canAfford && !isOwned && styles.itemEmojiLocked]}>
          {item.emoji}
        </Text>
        <Text
          style={[styles.itemName, !canAfford && !isOwned && styles.itemNameLocked]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        {isOwned ? (
          <Text style={styles.itemOwnedLabel}>✅ 보유</Text>
        ) : (
          <Text style={[styles.itemCost, canAfford && styles.itemCostAffordable]}>
            ⭐{item.cost}
          </Text>
        )}
        {!canAfford && !isOwned && (
          <Text style={styles.lockIcon}>🔒</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function RewardsScreen() {
  const totalStars = useAppStore((s) => s.totalStars);
  const childName = useAppStore((s) => s.childName);

  // 카테고리 탭
  const categories = ['전체', '모자', '날개', '배경', '소품'];
  const [selectedCategory, setSelectedCategory] = React.useState('전체');

  const filteredItems = useMemo(
    () =>
      selectedCategory === '전체'
        ? AVATAR_ITEMS
        : AVATAR_ITEMS.filter((i) => i.category === selectedCategory),
    [selectedCategory],
  );

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
          <Text style={styles.headerTitle}>👗 꾸미기</Text>
          <View style={styles.starBadge}>
            <Text style={styles.starBadgeText}>⭐ {totalStars}</Text>
          </View>
        </Animated.View>

        {/* 캐릭터 미리보기 */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.previewSection}>
          <View style={styles.previewBox}>
            <FairyCharacter emotion="happy" size="lg" showMessage={false} />
          </View>
          <Text style={styles.previewLabel}>{name}의 별이</Text>
        </Animated.View>

        {/* 별 통계 */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{totalStars}</Text>
            <Text style={styles.statLabel}>모은 별</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎁</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>보유 아이템</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔒</Text>
            <Text style={styles.statValue}>{AVATAR_ITEMS.length}</Text>
            <Text style={styles.statLabel}>전체 아이템</Text>
          </View>
        </Animated.View>

        {/* 카테고리 탭 */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.categoryTabs}>
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => {
                playButtonHaptic();
                setSelectedCategory(cat);
              }}
              style={[
                styles.categoryTab,
                selectedCategory === cat && styles.categoryTabActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === cat && styles.categoryTabTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        {/* 아이템 그리드 */}
        <View style={styles.itemGrid}>
          {filteredItems.map((item, idx) => (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(idx * 50).duration(300)}
              style={styles.itemGridCell}
            >
              <ItemCard
                item={item}
                canAfford={totalStars >= item.cost}
                isOwned={false}
              />
            </Animated.View>
          ))}
        </View>

        {/* 안내 */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            🧚 미션을 완료해서 별을 모으면{'\n'}
            별이를 꾸밀 수 있어요!
          </Text>
        </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  starBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  starBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#B45309',
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewBox: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  previewLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  categoryTabActive: {
    backgroundColor: '#FBBF24',
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemGridCell: {
    width: '31%',
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    minHeight: 120,
    justifyContent: 'center',
  },
  itemCardOwned: {
    borderColor: '#34D399',
    backgroundColor: '#F0FDF4',
  },
  itemCardLocked: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    opacity: 0.6,
  },
  itemEmoji: {
    fontSize: 32,
    marginBottom: 6,
  },
  itemEmojiLocked: {
    opacity: 0.5,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemNameLocked: {
    color: '#9CA3AF',
  },
  itemCost: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  itemCostAffordable: {
    color: '#F59E0B',
  },
  itemOwnedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
  },
  lockIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 12,
  },
  notice: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  noticeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
