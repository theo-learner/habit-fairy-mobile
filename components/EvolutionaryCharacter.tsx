// ============================================
// 요정 3단 진화 시스템 - 진화형 캐릭터 컴포넌트
// Reanimated 기반 인터랙티브 UI
// ============================================

import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { usePetStore } from '@/store/usePetStore';
import { useAppStore } from '@/lib/store';
import { getItemById } from '@/lib/items';
import PetFactory from '@/utils/petFactory';

interface EvolutionaryCharacterProps {
  size?: 'sm' | 'md' | 'lg';
  onTap?: () => void;
  showExpBar?: boolean;
  showDialogue?: boolean;
}

const SIZE_CONFIG = {
  sm: { size: 100, container: 120 },
  md: { size: 180, container: 200 },
  lg: { size: 260, container: 290 },
};

export default function EvolutionaryCharacter({
  size = 'md',
  onTap,
  showExpBar = true,
  showDialogue = true,
}: EvolutionaryCharacterProps) {
  const cfg = SIZE_CONFIG[size];
  
  // Store
  const pet = usePetStore((s) => s.pet);
  const gainExp = usePetStore((s) => s.gainExp);
  const evolve = usePetStore((s) => s.evolve);
  const canEvolve = usePetStore((s) => s.canEvolve);
  const getExpProgress = usePetStore((s) => s.getExpProgress);

  // Get current stage config
  const stageConfig = PetFactory.getStageConfig(pet.type, pet.currentStage);
  const asset = stageConfig.asset;

  // Decoration items from app store
  const equippedItems = useAppStore((s) => s.equippedItems || {});
  const hatItem = equippedItems['모자'] ? getItemById(equippedItems['모자']!) : null;
  const accItem = equippedItems['소품'] ? getItemById(equippedItems['소품']!) : null;

  // Animation values
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const [dialogue, setDialogue] = React.useState('');

  // Floating animation
  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true
    );
  }, []);

  // Glow effect when can evolve
  useEffect(() => {
    if (canEvolve()) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800 }),
          withTiming(0.2, { duration: 800 }),
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0);
    }
  }, [canEvolve()]);

  // Random dialogue on mount
  useEffect(() => {
    if (showDialogue) {
      setDialogue(PetFactory.getRandomDialogue(pet.type, pet.currentStage));
    }
  }, [pet.currentStage, showDialogue]);

  const handlePress = useCallback(() => {
    // Bounce animation
    scale.value = withSequence(
      withSpring(0.85, { damping: 10 }),
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 15 }),
    );

    // Gain exp on tap (for testing/interaction)
    gainExp(1);

    // Update dialogue
    if (showDialogue) {
      setDialogue(PetFactory.getRandomDialogue(pet.type, pet.currentStage));
    }

    onTap?.();
  }, [gainExp, onTap, showDialogue, pet.type, pet.currentStage]);

  const handleEvolve = useCallback(() => {
    if (canEvolve()) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(0.8, { damping: 8 }),
        withSpring(1, { damping: 10 }),
      );
      evolve();
    }
  }, [evolve, canEvolve]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const expProgress = getExpProgress();

  return (
    <View style={styles.wrapper}>
      {/* Character */}
      <Pressable onPress={handlePress}>
        <Animated.View style={[styles.container, { width: cfg.container, height: cfg.container }, containerStyle]}>
          {/* Glow effect */}
          {canEvolve() && (
            <Animated.View style={[styles.glowLayer, { 
              width: cfg.size * 1.3, 
              height: cfg.size * 1.3,
              borderRadius: cfg.size * 0.65,
            }, glowStyle]} />
          )}
          
          {/* Character image */}
          <View style={styles.characterImageContainer}>
            <Image
              source={asset}
              style={{ width: cfg.size, height: cfg.size }}
              resizeMode="contain"
            />
            
            {/* Hat decoration */}
            {hatItem && (
              <View style={[styles.hatDecor, { top: cfg.size * 0.02 }]}>
                <Text style={{ fontSize: cfg.size * 0.2 }}>{hatItem.emoji}</Text>
              </View>
            )}
            
            {/* Accessory decoration */}
            {accItem && (
              <View style={[styles.accDecor, { right: 0, bottom: cfg.size * 0.2 }]}>
                <Text style={{ fontSize: cfg.size * 0.15 }}>{accItem.emoji}</Text>
              </View>
            )}
          </View>

          {/* Stage badge */}
          <View style={styles.stageBadge}>
            <Text style={styles.stageBadgeText}>
              {pet.currentStage === 1 ? '🥚' : pet.currentStage === 2 ? '🐣' : '⭐'}
            </Text>
          </View>
        </Animated.View>
      </Pressable>

      {/* Dialogue bubble */}
      {showDialogue && dialogue && (
        <View style={styles.dialogueBubble}>
          <Text style={styles.dialogueText}>{dialogue}</Text>
        </View>
      )}

      {/* Experience bar */}
      {showExpBar && pet.currentStage < 3 && (
        <View style={styles.expBarContainer}>
          <View style={styles.expBarBg}>
            <View style={[styles.expBarFill, { width: `${expProgress * 100}%` }]} />
          </View>
          <Text style={styles.expText}>
            {pet.currentExp} / {stageConfig.maxExp} EXP
          </Text>
        </View>
      )}

      {/* Evolve button */}
      {canEvolve() && (
        <Pressable style={styles.evolveButton} onPress={handleEvolve}>
          <Text style={styles.evolveButtonText}>✨ 진화하기!</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowLayer: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  characterImageContainer: {
    position: 'relative',
  },
  hatDecor: {
    position: 'absolute',
    left: '50%',
    marginLeft: -15,
    zIndex: 10,
  },
  accDecor: {
    position: 'absolute',
    zIndex: 10,
  },
  stageBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stageBadgeText: {
    fontSize: 16,
  },
  dialogueBubble: {
    marginTop: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    maxWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dialogueText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
  },
  expBarContainer: {
    marginTop: 16,
    alignItems: 'center',
    width: '80%',
  },
  expBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  expBarFill: {
    height: '100%',
    backgroundColor: '#FBBF24',
    borderRadius: 4,
  },
  expText: {
    marginTop: 4,
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  evolveButton: {
    marginTop: 16,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  evolveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});
