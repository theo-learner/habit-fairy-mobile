// ============================================
// 요정 캐릭터 "별이" 리디자인 (v2)
// 더 세련되고 매력적인 요정 캐릭터
// ============================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Path,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
  FadeOut,
  ZoomIn,
} from 'react-native-reanimated';
import type { FairyEmotion } from '@/types';

interface FairyCharacterProps {
  emotion?: FairyEmotion;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

/** 감정별 눈 표현 (v2 스타일: 더 크고 반짝이는 눈) */
const EYE_PATHS: Record<FairyEmotion, { left: string; right: string; closed?: boolean; pupillary?: boolean }> = {
  happy: { 
    left: 'M35 44 Q40 40 45 44', 
    right: 'M55 44 Q60 40 65 44',
    closed: true 
  },
  excited: { 
    left: '', 
    right: '',
    closed: false,
    pupillary: true
  },
  cheering: { 
    left: 'M35 44 Q40 38 45 44', 
    right: 'M55 44 Q60 38 65 44',
    closed: true
  },
  celebrating: { 
    left: 'M34 43 L39 40 L44 43', 
    right: 'M56 43 L61 40 L66 43',
    closed: true 
  },
  sleeping: { 
    left: 'M35 45 Q40 47 45 45', 
    right: 'M55 45 Q60 47 65 45',
    closed: true
  },
  waving: { 
    left: '', 
    right: '',
    closed: false,
    pupillary: true
  },
};

/** 감정별 입 표현 */
const MOUTH_PATHS: Record<FairyEmotion, string> = {
  happy: 'M46 54 Q50 58 54 54',
  excited: 'M45 54 Q50 62 55 54 Z', // Open mouth
  cheering: 'M45 54 Q50 60 55 54',
  celebrating: 'M44 52 Q50 64 56 52', // Big smile
  sleeping: 'M48 56 Q50 57 52 56', // Small O
  waving: 'M46 54 Q50 57 54 54',
};

const SIZE_CONFIG = {
  sm: { svgSize: 80, container: 90 },
  md: { svgSize: 140, container: 160 },
  lg: { svgSize: 200, container: 220 },
};

export default function FairyCharacter({
  emotion = 'happy',
  message,
  size = 'md',
  showMessage = true,
}: FairyCharacterProps) {
  const cfg = SIZE_CONFIG[size];
  const eyes = EYE_PATHS[emotion];
  const mouth = MOUTH_PATHS[emotion];
  const isSleeping = emotion === 'sleeping';

  // Animations
  const floatY = useSharedValue(0);
  const wingRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    // Floating
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true
    );

    // Wing Flapping
    wingRotate.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 200, easing: Easing.inOut(Easing.quad) }),
        withTiming(-10, { duration: 200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true
    );

    // Glow Pulse (Higher contrast)
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 1500 }),
        withTiming(0.6, { duration: 1500 }),
      ),
      -1,
      true
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const leftWingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wingRotate.value}deg` }, { translateX: 5 }],
  }));

  const rightWingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-wingRotate.value}deg` }, { translateX: -5 }],
  }));
  
  const auraStyle = useAnimatedStyle(() => ({
     opacity: glowOpacity.value
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.characterWrap, { width: cfg.container, height: cfg.container }, containerStyle]}>
        
        {/* Aura / Glow behind */}
        <Animated.View style={[{ position: 'absolute', width: cfg.svgSize, height: cfg.svgSize }, auraStyle]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
             <Defs>
                <RadialGradient id="aura" cx="50%" cy="50%" rx="50%" ry="50%">
                   <Stop offset="0%" stopColor="#FFF7ED" stopOpacity={1} />
                   <Stop offset="70%" stopColor="#FDE68A" stopOpacity={0.6} />
                   <Stop offset="100%" stopColor="#FDE68A" stopOpacity={0} />
                </RadialGradient>
             </Defs>
             <Circle cx="50" cy="50" r="48" fill="url(#aura)" />
          </Svg>
        </Animated.View>

        <Svg width={cfg.svgSize} height={cfg.svgSize} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FFF1F2" />
              <Stop offset="100%" stopColor="#FEE2E2" />
            </LinearGradient>
            <LinearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FB923C" />
              <Stop offset="100%" stopColor="#C2410C" />
            </LinearGradient>
            <LinearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#BAE6FD" stopOpacity={1} />
              <Stop offset="50%" stopColor="#38BDF8" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.8} />
            </LinearGradient>
             <RadialGradient id="cheek" cx="50%" cy="50%" rx="50%" ry="50%">
               <Stop offset="0%" stopColor="#FDA4AF" stopOpacity={0.6} />
               <Stop offset="100%" stopColor="#FDA4AF" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Wings */}
          <G transform="translate(0, 15)">
             <Path d="M25 40 C 0 10, 5 0, 45 35 C 15 50, 0 70, 30 60 Z" fill="url(#wingGrad)" stroke="#0284C7" strokeWidth="0.5" />
             <Path d="M75 40 C 100 10, 95 0, 55 35 C 85 50, 100 70, 70 60 Z" fill="url(#wingGrad)" stroke="#0284C7" strokeWidth="0.5" />
          </G>

          {/* Hair Back Layer */}
          <Path d="M25 50 Q 50 15 75 50 Q 75 70 50 65 Q 25 70 25 50" fill="url(#hairGrad)" />

          {/* Face Shape (Human-like rounded V) */}
          <Path d="M32 45 Q 32 75 50 82 Q 68 75 68 45 Q 68 35 50 35 Q 32 35 32 45" fill="url(#faceGrad)" stroke="#FECACA" strokeWidth="0.5" />

          {/* Hair Front (Bangs) */}
          <Path d="M30 45 Q 40 30 50 40 Q 60 30 70 45 Q 70 40 50 35 Q 30 40 30 45" fill="url(#hairGrad)" />

          {/* Eyes Logic */}
          {eyes.pupillary ? (
            <G>
              {/* Large Anime Eyes */}
              <Ellipse cx="40" cy="52" rx="4" ry="6" fill="#1F2937" />
              <Ellipse cx="60" cy="52" rx="4" ry="6" fill="#1F2937" />
              {/* Eye Highlights */}
              <Circle cx="41.5" cy="49" r="1.5" fill="white" />
              <Circle cx="61.5" cy="49" r="1.5" fill="white" />
              <Circle cx="39" cy="55" r="0.8" fill="white" fillOpacity={0.6} />
              <Circle cx="59" cy="55" r="0.8" fill="white" fillOpacity={0.6} />
            </G>
          ) : (
            <G>
              <Path d={eyes.left} stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <Path d={eyes.right} stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </G>
          )}

          {/* Cheeks */}
          <Circle cx="36" cy="62" r="4" fill="url(#cheek)" />
          <Circle cx="64" cy="62" r="4" fill="url(#cheek)" />

          {/* Mouth */}
          <Path d={mouth} stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" fill={emotion === 'excited' ? '#F43F5E' : 'none'} />

          {/* Crown */}
          <Path d="M44 28 L46 33 L50 30 L54 33 L56 28" stroke="#FBBF24" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <Circle cx="44" cy="28" r="1.5" fill="#FCD34D" />
          <Circle cx="50" cy="30" r="1.5" fill="#FCD34D" />
          <Circle cx="56" cy="28" r="1.5" fill="#FCD34D" />
          
          {/* Sleeping Zzz */}
          {isSleeping && (
             <G>
               <Path d="M75 30 L85 30 L75 40 L85 40" stroke="#8B5CF6" strokeWidth="2" fill="none" transform="scale(0.8)" />
             </G>
          )}
        </Svg>
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
  bubble: {
    marginTop: 8,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 260,
  },
  bubbleTail: {
    position: 'absolute',
    top: -6,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#E5E7EB',
    transform: [{ rotate: '45deg' }],
  },
  bubbleText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Jua',
  },
});
