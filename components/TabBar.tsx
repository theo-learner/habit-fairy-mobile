import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { playButtonHaptic } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TABS = [
  { name: 'index', label: '홈', icon: '🏠', path: '/', activeColor: '#9333EA' },
  { name: 'character', label: '친구', icon: '🎭', path: '/character', activeColor: '#EC4899' },
  { name: 'rewards', label: '꾸미기', icon: '👗', path: '/rewards', activeColor: '#F97316' },
  { name: 'dashboard', label: '기록', icon: '📊', path: '/dashboard', activeColor: '#06B6D4' },
];

function TabButton({ 
  tab, 
  isActive, 
  onPress 
}: { 
  tab: typeof TABS[0]; 
  isActive: boolean; 
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: pressed.value * 2 },
    ],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: isActive 
      ? `${tab.activeColor}15` 
      : 'transparent',
    borderRadius: 16,
    padding: 8,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
    pressed.value = withSpring(1, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    pressed.value = withSpring(0, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle]}
      className="items-center justify-center"
    >
      <Animated.View style={bgStyle} className="items-center">
        <Text 
          className={`text-2xl mb-0.5`}
          style={{ 
            transform: [{ scale: isActive ? 1.15 : 1 }],
            opacity: isActive ? 1 : 0.5,
          }}
        >
          {tab.icon}
        </Text>
        {isActive && (
          <Text 
            className="text-[10px] font-bold font-sans"
            style={{ color: tab.activeColor }}
          >
            {tab.label}
          </Text>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding: minimum 12px, or safe area + 8px
  const bottomPadding = Math.max(12, insets.bottom + 8);

  const handlePress = (path: string) => {
    playButtonHaptic();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (pathname !== path) {
      router.replace(path as any);
    }
  };

  return (
    <View 
      className="absolute left-3 right-3 items-center"
      style={{ bottom: bottomPadding }}
    >
      {/* Glass + Clay style container */}
      <View 
        className="flex-row bg-white/95 rounded-2xl px-3 py-1.5 items-center justify-around w-full max-w-sm border-2 border-white"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {TABS.map((tab) => {
          const isActive = pathname === tab.path || (pathname === '/' && tab.name === 'index');
          return (
            <TabButton
              key={tab.name}
              tab={tab}
              isActive={isActive}
              onPress={() => handlePress(tab.path)}
            />
          );
        })}
      </View>
    </View>
  );
}
