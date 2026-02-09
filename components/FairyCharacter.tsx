import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
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
  emotion = 'happy',
  message,
  size = 'md',
  showMessage = true,
}: FairyCharacterProps) {
  const cfg = SIZE_CONFIG[size];
  const equippedItems = useAppStore((s) => s.equippedItems || {});
  const selectedCharacter = useAppStore((s) => s.selectedCharacter || DEFAULT_CHARACTER_ID);
  
  // Get character asset
  const character = getCharacterById(selectedCharacter);
  const characterAsset = character?.asset || require('@/assets/fairy_v2.png');

  // Animations
  const floatY = useSharedValue(0);

  useEffect(() => {
    // Floating Animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  // Resolve equipped emojis
  const hatItem = equippedItems['모자'] ? getItemById(equippedItems['모자']!) : null;
  const wingItem = equippedItems['날개'] ? getItemById(equippedItems['날개']!) : null;
  const accItem = equippedItems['소품'] ? getItemById(equippedItems['소품']!) : null;
  const bgItem = equippedItems['배경'] ? getItemById(equippedItems['배경']!) : null;

  // Calculate offsets - position items relative to fairy image center
  const hatOffset = cfg.size * 0.35; // Distance from center to top of head
  const hatFontSize = cfg.size * 0.25;
  const wingFontSize = cfg.size * 0.5;
  const accFontSize = cfg.size * 0.2;

  return (
    <View style={styles.container}>
      {/* Background Decor */}
      {bgItem && (
        <View style={styles.backgroundDecor}>
          <Text style={{ fontSize: cfg.size * 0.8, opacity: 0.4 }}>{bgItem.emoji}</Text>
        </View>
      )}

      <Animated.View style={[styles.characterWrap, { width: cfg.container, height: cfg.container }, containerStyle]}>
        {/* Wings Decor (Behind character - positioned at back) */}
        {wingItem && (
          <View style={[styles.wingDecor, { 
            top: cfg.container * 0.25,
            zIndex: 5,
          }]}>
            <Text style={{ fontSize: wingFontSize, opacity: 0.7 }}>{wingItem.emoji}</Text>
          </View>
        )}

        {/* Fairy Image Container - items positioned relative to this */}
        <View style={styles.fairyImageContainer}>
          <Image 
            source={characterAsset} 
            style={{ 
              width: cfg.size, 
              height: cfg.size,
            }}
            resizeMode="contain"
          />
          
          {/* Hat Decor - positioned on fairy's head */}
          {hatItem && (
            <View style={[styles.hatDecor, { 
              top: cfg.size * 0.02, // Slightly inside the top of the image
              left: '50%',
              marginLeft: -hatFontSize / 2,
            }]}>
              <Text style={{ fontSize: hatFontSize }}>{hatItem.emoji}</Text>
            </View>
          )}

          {/* Accessory Decor - positioned to the side of fairy */}
          {accItem && (
            <View style={[styles.accDecor, { 
              right: cfg.size * 0.05,
              bottom: cfg.size * 0.25,
            }]}>
              <Text style={{ fontSize: accFontSize }}>{accItem.emoji}</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Message Bubble */}
      {showMessage && message && (
        <Animated.View 
          entering={ZoomIn.duration(400).springify()}
          style={styles.bubble}
        >
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
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    // Enhanced clay shadow
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 300,
  },
  bubbleTail: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -8,
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#ffffff',
    transform: [{ rotate: '45deg' }],
    // Clay effect on tail
    shadowColor: '#000',
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'Jua',
    lineHeight: 24,
  },
});
