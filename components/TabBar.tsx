import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { playButtonHaptic } from '@/lib/sounds';

const TABS = [
  { name: 'index', label: '홈', icon: '🏠', path: '/' },
  { name: 'character', label: '친구', icon: '🎭', path: '/character' },
  { name: 'rewards', label: '꾸미기', icon: '👗', path: '/rewards' },
  { name: 'dashboard', label: '기록', icon: '📊', path: '/dashboard' },
];

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = (path: string) => {
    playButtonHaptic();
    // Prevent pushing the same route
    if (pathname !== path) {
      // Use replace to avoid building a huge stack
      router.replace(path as any);
    }
  };

  return (
    <View className="absolute bottom-8 left-4 right-4 items-center">
      <View className="flex-row bg-white rounded-full px-6 py-3 shadow-clay-md items-center justify-between w-full max-w-sm">
        {TABS.map((tab) => {
          const isActive = pathname === tab.path || (pathname === '/' && tab.name === 'index');
          return (
            <Pressable
              key={tab.name}
              onPress={() => handlePress(tab.path)}
              className="items-center justify-center w-16"
            >
              <Text className={`text-2xl mb-1 ${isActive ? 'scale-125' : 'opacity-50'}`}>
                {tab.icon}
              </Text>
              {isActive && (
                <Text className="text-[10px] font-bold text-magic-purple font-sans">
                  {tab.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
