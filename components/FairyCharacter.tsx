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

/** 감정별 눈 표현 (더 디테일하게) */
const EYE_PATHS: Record<FairyEmotion, { left: string; right: string; closed?: boolean }> = {
  happy: { 
    left: 'M36 44 Q40 40 44 44', 
    right: 'M56 44 Q60 40 64 44',
    closed: true 
  },
  excited: { 
    left: 'M36 42 A 4 4 0 0 1 44 42', 
    right: 'M56 42 A 4 4 0 0 1 64 42',
    closed: false
  },
  cheering: { 
    left: 'M36 44 Q40 38 44 44', 
    right: 'M56 44 Q60 38 64 44',
    closed: true
  },
  celebrating: { 
    left: 'M35 43 L39 40 L43 43', 
    right: 'M57 43 L61 40 L65 43',
    closed: true 
  },
  sleeping: { 
    left: 'M36 45 Q40 47 44 45', 
    right: 'M56 45 Q60 47 64 45',
    closed: true
  },
  waving: { 
    left: 'M36 42 A 3 5 0 0 1 42 42', 
    right: 'M58 42 A 3 5 0 0 1 64 42',
    closed: false
  },
};

/** 감정별 입 표현 */
const MOUTH_PATHS: Record<FairyEmotion, string> = {
  happy: 'M46 52 Q50 56 54 52',
  excited: 'M45 52 Q50 60 55 52 Z', // Open mouth
  cheering: 'M45 52 Q50 58 55 52',
  celebrating: 'M45 50 Q50 62 55 50', // Big smile
  sleeping: 'M48 54 Q50 55 52 54', // Small O
  waving: 'M46 52 Q50 55 54 52',
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
                   <Stop offset="0%" stopColor="#FFF7ED" stopOpacity={0.8} />
                   <Stop offset="70%" stopColor="#FEF3C7" stopOpacity={0.3} />
                   <Stop offset="100%" stopColor="#FEF3C7" stopOpacity={0} />
                </RadialGradient>
             </Defs>
             <Circle cx="50" cy="50" r="48" fill="url(#aura)" />
          </Svg>
        </Animated.View>

        <Svg width={cfg.svgSize} height={cfg.svgSize} viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FED7AA" />
              <Stop offset="100%" stopColor="#FDBA74" />
            </LinearGradient>
            <LinearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FB923C" />
              <Stop offset="100%" stopColor="#EA580C" />
            </LinearGradient>
            <LinearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#BAE6FD" stopOpacity={1} />
              <Stop offset="50%" stopColor="#7DD3FC" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#38BDF8" stopOpacity={0.8} />
            </LinearGradient>
             <RadialGradient id="cheek" cx="50%" cy="50%" rx="50%" ry="50%">
               <Stop offset="0%" stopColor="#FDA4AF" stopOpacity={0.6} />
               <Stop offset="100%" stopColor="#FDA4AF" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Wings - Animated via props not possible easily in SVG direct, so static base or group transform if supported. 
              Using Reanimated View for wings is better but complex layout. 
              Here we draw static wings for simplicity or use specific props if reanimated-svg.
              Let's keep them static in SVG but maybe slight path animation if possible? 
              For now, static elegant wings.
          */}
          <G transform="translate(0, 10)">
             {/* Left Wing */}
             <Path d="M20 40 C 0 20, 10 0, 40 30 C 10 40, 0 60, 25 55 Z" fill="url(#wingGrad)" stroke="#38BDF8" strokeWidth="1" transform="rotate(-10 40 40)" />
             {/* Right Wing */}
             <Path d="M80 40 C 100 20, 90 0, 60 30 C 90 40, 100 60, 75 55 Z" fill="url(#wingGrad)" stroke="#38BDF8" strokeWidth="1" transform="rotate(10 60 40)" />
          </G>

          {/* Hair Back */}
          <Circle cx="50" cy="45" r="26" fill="url(#hairGrad)" />

          {/* Face Shape */}
          <Circle cx="50" cy="50" r="22" fill="url(#faceGrad)" stroke="#FDBA74" strokeWidth="1" />

          {/* Hair Front (Bangs) */}
          <Path d="M28 40 Q 50 20 72 40 Q 75 45 72 48 Q 50 30 28 48 Q 25 45 28 40" fill="url(#hairGrad)" stroke="#F97316" strokeWidth="0.5" />

          {/* Eyes */}
          <Path d={eyes.left} stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <Path d={eyes.right} stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          
          {/* Eye Highlights (Sparkle) if open */}
          {!eyes.closed && (
             <>
               <Circle cx="39" cy="41" r="1.5" fill="white" />
               <Circle cx="61" cy="41" r="1.5" fill="white" />
             </>
          )}

          {/* Cheeks */}
          <Circle cx="34" cy="54" r="5" fill="url(#cheek)" />
          <Circle cx="66" cy="54" r="5" fill="url(#cheek)" />

          {/* Mouth */}
          <Path d={mouth} stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" fill={emotion === 'excited' ? '#F43F5E' : 'none'} />

          {/* Crown / Accessory */}
          <Path d="M42 20 L45 28 L50 22 L55 28 L58 20" stroke="#FBBF24" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx="42" cy="20" r="2" fill="#FCD34D" />
          <Circle cx="50" cy="22" r="2" fill="#FCD34D" />
          <Circle cx="58" cy="20" r="2" fill="#FCD34D" />
          
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
