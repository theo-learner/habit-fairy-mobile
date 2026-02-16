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
  activeIcon: string;
  path: string;
  protected?: boolean;
}

const TABS: TabConfig[] = [
  { name: 'index', label: '홈', icon: '🏠', activeIcon: '🏡', path: '/' },
  { name: 'character', label: '친구', icon: '🧚', activeIcon: '🧚‍♀️', path: '/character' },
  { name: 'rewards', label: '꾸미기', icon: '🎨', activeIcon: '🎨', path: '/rewards' },
  { name: 'dashboard', label: '기록', icon: '📊', activeIcon: '📊', path: '/dashboard' },
  { name: 'manage', label: '설정', icon: '⚙️', activeIcon: '⚙️', path: '/manage', protected: true },
];

function TabButton({
  tab,
  isActive,
  onPress,
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
      <Text style={[styles.tabIcon, { opacity: isActive ? 1 : 0.45 }]}>
        {isActive ? tab.activeIcon : tab.icon}
      </Text>
      <Text
        style={[
          styles.tabLabel,
          {
            color: isActive ? '#C0392B' : '#636E72',
            fontWeight: isActive ? '700' : '500',
          },
        ]}
      >
        {tab.label}
      </Text>
      {isActive && <View style={styles.activeIndicator} />}
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

  const bottomPadding = Math.max(20, insets.bottom + 10);

  const handlePress = (tab: TabConfig) => {
    playButtonHaptic();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (tab.protected && onProtectedPress) {
      onProtectedPress();
    } else {
      router.replace(tab.path as any);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.bar}>
        {TABS.map((tab) => {
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    justifyContent: 'space-around',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    minWidth: 56,
    position: 'relative',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Jua',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E8744F',
  },
});
