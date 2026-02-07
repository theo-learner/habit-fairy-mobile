// ============================================
// 요정 캐릭터 "별이" — React Native SVG + Reanimated
// 감정 표현, 반짝임 파티클, 말풍선
// ============================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  Path,
  Polygon,
  Defs,
  RadialGradient,
  Stop,
  G,
  Line,
  Text as SvgText,
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
} from 'react-native-reanimated';
import type { FairyEmotion } from '@/types';

interface FairyCharacterProps {
  emotion?: FairyEmotion;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}

/** 감정별 입 표현 */
const MOUTH_PATHS: Record<FairyEmotion, string> = {
  happy: 'M35 52 Q40 58 45 52',
  excited: 'M34 50 Q40 60 46 50',
  cheering: 'M33 50 Q40 62 47 50',
  celebrating: 'M33 50 Q40 62 47 50',
  sleeping: 'M37 54 Q40 56 43 54',
  waving: 'M35 52 Q40 58 45 52',
};

/** 감정별 눈 표현 */
const EYE_PATHS: Record<FairyEmotion, { left: string; right: string }> = {
  happy: { left: 'M28 42 Q30 38 32 42', right: 'M48 42 Q50 38 52 42' },
  excited: { left: 'M28 40 Q30 36 32 40', right: 'M48 40 Q50 36 52 40' },
  cheering: { left: 'M28 42 Q30 37 32 42', right: 'M48 42 Q50 37 52 42' },
  celebrating: { left: 'M28 41 Q30 36 32 41', right: 'M48 41 Q50 36 52 41' },
  sleeping: { left: 'M28 42 L32 42', right: 'M48 42 L52 42' },
  waving: { left: 'M28 42 Q30 38 32 42', right: 'M48 42 Q50 38 52 42' },
};

/** 사이즈별 설정 */
const SIZE_CONFIG = {
  sm: { svgSize: 80, container: 96 },
  md: { svgSize: 120, container: 144 },
  lg: { svgSize: 180, container: 208 },
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

  // 떠다니는 애니메이션
  const floatY = useSharedValue(0);
  // 반짝임 opacity
  const sparkle1 = useSharedValue(0);
  const sparkle2 = useSharedValue(0);
  const sparkle3 = useSharedValue(0);

  useEffect(() => {
    // 위아래로 둥실둥실
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    // 반짝임 파티클 사이클
    sparkle1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0, { duration: 600 }),
        withDelay(1200, withTiming(0, { duration: 0 })),
      ),
      -1,
    );
    sparkle2.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 600 }),
          withDelay(1200, withTiming(0, { duration: 0 })),
        ),
        -1,
      ),
    );
    sparkle3.value = withDelay(
      1600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 600 }),
          withDelay(1200, withTiming(0, { duration: 0 })),
        ),
        -1,
      ),
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const sparkle1Style = useAnimatedStyle(() => ({ opacity: sparkle1.value }));
  const sparkle2Style = useAnimatedStyle(() => ({ opacity: sparkle2.value }));
  const sparkle3Style = useAnimatedStyle(() => ({ opacity: sparkle3.value }));

  return (
    <View style={styles.container}>
      {/* 요정 캐릭터 본체 */}
      <Animated.View
        style={[{ width: cfg.container, height: cfg.container, alignItems: 'center', justifyContent: 'center' }, floatStyle]}
      >
        {/* 반짝임 파티클 */}
        <Animated.Text style={[styles.sparkle, { top: -4, right: -4 }, sparkle1Style]}>
          ✨
        </Animated.Text>
        <Animated.Text style={[styles.sparkle, { bottom: 0, left: -8 }, sparkle2Style]}>
          ⭐
        </Animated.Text>
        <Animated.Text style={[styles.sparkle, { top: '25%', right: -12 }, sparkle3Style]}>
          💫
        </Animated.Text>

        {/* SVG 요정 */}
        <Svg width={cfg.svgSize} height={cfg.svgSize} viewBox="0 0 80 80">
          <Defs>
            <RadialGradient id="bodyGrad" cx="40%" cy="35%" rx="60%" ry="60%">
              <Stop offset="0%" stopColor="#FFF8E8" />
              <Stop offset="50%" stopColor="#FFE4B5" />
              <Stop offset="100%" stopColor="#FFDAA0" />
            </RadialGradient>
            <RadialGradient id="wingGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#E8D4FF" stopOpacity={0.8} />
              <Stop offset="100%" stopColor="#C4B0FF" stopOpacity={0.3} />
            </RadialGradient>
          </Defs>

          {/* 날개 */}
          <Ellipse cx={18} cy={40} rx={12} ry={16} fill="url(#wingGrad)" opacity={0.6} />
          <Ellipse cx={62} cy={40} rx={12} ry={16} fill="url(#wingGrad)" opacity={0.6} />

          {/* 몸체 */}
          <Circle cx={40} cy={42} r={22} fill="url(#bodyGrad)" />
          <Ellipse cx={35} cy={35} rx={8} ry={6} fill="white" opacity={0.15} />

          {/* 별 왕관 */}
          <Polygon
            points="40,12 42,18 48,18 43,22 45,28 40,25 35,28 37,22 32,18 38,18"
            fill="#FBBF24"
            stroke="#F59E0B"
            strokeWidth={0.5}
          />
          <Circle cx={40} cy={20} r={2} fill="#FEF3C7" opacity={0.8} />

          {/* 눈 */}
          <Path d={eyes.left} stroke="#5B4530" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d={eyes.right} stroke="#5B4530" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          {!isSleeping && (
            <>
              <Circle cx={29.5} cy={40} r={0.8} fill="white" />
              <Circle cx={49.5} cy={40} r={0.8} fill="white" />
            </>
          )}

          {/* 볼 터치 */}
          <Circle cx={25} cy={47} r={4} fill="#FFB8D0" opacity={0.5} />
          <Circle cx={55} cy={47} r={4} fill="#FFB8D0" opacity={0.5} />

          {/* 입 */}
          <Path d={mouth} stroke="#D97082" strokeWidth={1.8} strokeLinecap="round" fill="none" />

          {/* Zzz (수면) */}
          {isSleeping && (
            <G>
              <SvgText x={58} y={32} fontSize={8} fill="#A78BFA" fontWeight="bold">z</SvgText>
              <SvgText x={63} y={27} fontSize={6} fill="#A78BFA" fontWeight="bold" opacity={0.7}>z</SvgText>
              <SvgText x={66} y={23} fontSize={4} fill="#A78BFA" fontWeight="bold" opacity={0.4}>z</SvgText>
            </G>
          )}
        </Svg>
      </Animated.View>

      {/* 말풍선 */}
      {showMessage && message && (
        <Animated.View
          entering={FadeIn.duration(300).springify()}
          exiting={FadeOut.duration(200)}
          style={styles.bubble}
        >
          {/* 말풍선 꼬리 */}
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
    gap: 12,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 16,
    zIndex: 10,
  },
  bubble: {
    position: 'relative',
    maxWidth: 280,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.6)',
    // 그림자 (iOS + Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bubbleTail: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    backgroundColor: '#FFFBEB',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.6)',
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },
});
