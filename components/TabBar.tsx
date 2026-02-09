import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { playButtonHaptic } from '@/lib/sounds';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TabConfig {
  name: string;
  label: string;
  icon: string;
  path: string;
  activeColor: string;
  protected?: boolean;
}

const TABS: TabConfig[] = [
  { name: 'index', label: '홈', icon: '🏠', path: '/', activeColor: '#FFB7B2' },
  { name: 'character', label: '친구', icon: '🎭', path: '/character', activeColor: '#C7CEEA' },
  { name: 'rewards', label: '꾸미기', icon: '👗', path: '/rewards', activeColor: '#FFDAC1' },
  { name: 'dashboard', label: '기록', icon: '📊', path: '/dashboard', activeColor: '#B5EAD7' },
  { name: 'manage', label: '관리', icon: '⚙️', path: '/manage', activeColor: '#888888', protected: true },
];

function TabButton({ 
  tab, 
  isActive, 
  onPress 
}: { 
  tab: TabConfig; 
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
    borderRadius: 12,
    padding: 6,
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
          className="text-xl mb-0.5"
          style={{ 
            transform: [{ scale: isActive ? 1.1 : 1 }],
            opacity: isActive ? 1 : 0.5,
          }}
        >
          {tab.icon}
        </Text>
        {isActive && (
          <Text 
            className="text-[9px] font-bold font-sans"
            style={{ color: tab.activeColor }}
          >
            {tab.label}
          </Text>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

interface TabBarProps {
  onProtectedPress?: () => void;
}

export default function TabBar({ onProtectedPress }: TabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  const bottomPadding = Math.max(12, insets.bottom + 8);

  const handlePress = (tab: TabConfig) => {
    playButtonHaptic();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (tab.protected && onProtectedPress) {
      // Protected tab - trigger parent gate
      onProtectedPress();
    } else if (pathname !== tab.path) {
      router.replace(tab.path as any);
    }
  };

  return (
    <View 
      className="absolute left-3 right-3 items-center"
      style={{ bottom: bottomPadding }}
    >
      <View 
        className="flex-row rounded-3xl px-2 py-2 items-center justify-around w-full max-w-md"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(12px)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.6)',
          shadowColor: '#1f2687',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.07,
          shadowRadius: 32,
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
              onPress={() => handlePress(tab)}
            />
          );
        })}
      </View>
    </View>
  );
}
