import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  ZoomIn,
} from 'react-native-reanimated';
import { useAppStore } from '@/lib/store';
import { getItemById } from '@/lib/items';
import { getCharacterById, DEFAULT_CHARACTER_ID } from '@/lib/characters';
import type { FairyEmotion } from '@/types';

interface FairyCharacterProps {
  emotion?: FairyEmotion;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

const SIZE_CONFIG = {
  sm: { size: 90, container: 100 },
  md: { size: 160, container: 180 },
  lg: { size: 240, container: 260 },
};

export default function FairyCharacter({
  emotion: _emotion = 'happy',
  message,
  size = 'md',
  showMessage = true,
}: FairyCharacterProps) {
  const cfg = SIZE_CONFIG[size];
  // 꾸미기 기능 비활성화 - 기본 캐릭터만 표시
  const equippedItems: Record<string, string> = {};
  const selectedCharacter = useAppStore((s) => s.selectedCharacter || DEFAULT_CHARACTER_ID);

  const character = getCharacterById(selectedCharacter);
  const characterAsset = character?.asset || require('@/assets/fairy_v2.png');

  const floatY = useSharedValue(0);
  const breathScale = useSharedValue(1);
  const swayRotate = useSharedValue(0);

  useEffect(() => {
    // 둥실 떠다니기
    floatY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    // 숨쉬기 (scale 1.0 ↔ 1.03, 3초)
    breathScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
    // 살랑거림 (rotate -2deg ↔ 2deg, 4초)
    swayRotate.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(2, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: breathScale.value },
      { rotate: `${swayRotate.value}deg` },
    ],
  }));

  const hatItem = equippedItems['모자'] ? getItemById(equippedItems['모자']!) : null;
  const wingItem = equippedItems['날개'] ? getItemById(equippedItems['날개']!) : null;
  const accItem = equippedItems['소품'] ? getItemById(equippedItems['소품']!) : null;
  const bgItem = equippedItems['배경'] ? getItemById(equippedItems['배경']!) : null;

  const hatFontSize = cfg.size * 0.25;
  const wingFontSize = cfg.size * 0.5;
  const accFontSize = cfg.size * 0.2;

  return (
    <View style={styles.container}>
      {bgItem && (
        <View style={styles.backgroundDecor}>
          <Text style={{ fontSize: cfg.size * 0.8, opacity: 0.4 }}>{bgItem.emoji}</Text>
        </View>
      )}

      <Animated.View style={[styles.characterWrap, { width: cfg.container, height: cfg.container }, containerStyle]}>
        {wingItem && (
          <View style={[styles.wingDecor, { top: cfg.container * 0.25, zIndex: 5 }]}>
            <Text style={{ fontSize: wingFontSize, opacity: 0.7 }}>{wingItem.emoji}</Text>
          </View>
        )}

        <View style={styles.fairyImageContainer}>
          <Image
            source={characterAsset}
            style={{ width: cfg.size, height: cfg.size }}
            resizeMode="contain"
          />

          {hatItem && (
            <View style={[styles.hatDecor, { top: cfg.size * 0.02, left: '50%', marginLeft: -hatFontSize / 2 }]}>
              <Text style={{ fontSize: hatFontSize }}>{hatItem.emoji}</Text>
            </View>
          )}

          {accItem && (
            <View style={[styles.accDecor, { right: cfg.size * 0.05, bottom: cfg.size * 0.25 }]}>
              <Text style={{ fontSize: accFontSize }}>{accItem.emoji}</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {showMessage && message && (
        <Animated.View entering={ZoomIn.duration(400).springify()} style={styles.bubble}>
          <View style={styles.bubbleTail} />
          <Text style={styles.bubbleText}>{message}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  fairyImageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hatDecor: {
    position: 'absolute',
    zIndex: 20,
  },
  wingDecor: {
    position: 'absolute',
    zIndex: 5,
  },
  accDecor: {
    position: 'absolute',
    zIndex: 20,
  },
  backgroundDecor: {
    position: 'absolute',
    zIndex: 1,
  },
  bubble: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    maxWidth: 280,
  },
  bubbleTail: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  bubbleText: {
    fontSize: 15,
    color: '#2D3436',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Jua',
    lineHeight: 22,
  },
});
