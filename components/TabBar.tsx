import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
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
  protected?: boolean;
}

// 레퍼런스와 동일한 탭 구성
const TABS: TabConfig[] = [
  { name: 'index', label: '홈', icon: '🏠', path: '/' },
  { name: 'character', label: '친구', icon: '🧸', path: '/character' },
  { name: 'rewards', label: '꾸미기', icon: '🎀', path: '/rewards' },
  { name: 'dashboard', label: '기록', icon: '📈', path: '/dashboard' },
  { name: 'manage', label: '설정', icon: '🔧', path: '/manage', protected: true },
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tabButton, animatedStyle]}
      accessibilityRole="tab"
      accessibilityLabel={`${tab.label} 탭`}
      accessibilityState={{ selected: isActive }}
    >
      <Text style={[styles.tabIcon, { opacity: isActive ? 1 : 0.5 }]}>
        {tab.icon}
      </Text>
      <Text style={[styles.tabLabel, { color: isActive ? '#333' : '#666', fontWeight: isActive ? '700' : '500' }]}>
        {tab.label}
      </Text>
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
  
  // 하단 여백 확보 (iOS Safe Area)
  const bottomPadding = Math.max(20, insets.bottom + 10);

  const handlePress = (tab: TabConfig) => {
    playButtonHaptic();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (tab.protected && onProtectedPress) {
      onProtectedPress();
    } else {
      // Use absolute paths but rely on Expo Router to handle baseUrl
      router.replace(tab.path as any);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
          // Normalize pathname for matching on GitHub Pages
          // pathname might be "/habit-fairy-mobile/character" or "/character"
          const normalizedPath = pathname.replace(/^\/habit-fairy-mobile/, '') || '/';
          const isActive = normalizedPath === tab.path || (normalizedPath === '' && tab.path === '/');
          
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    minWidth: 60,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
  },
});
