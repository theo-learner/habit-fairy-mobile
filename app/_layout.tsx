import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Pressable, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppStore } from '@/lib/store';
import TabBar from '@/components/TabBar';
import ParentsGate from '@/components/ParentsGate';

export default function RootLayout() {
  const loadData = useAppStore((s) => s.loadData);
  const router = useRouter();
  const segments = useSegments();
  const [gateVisible, setGateVisible] = useState(false);

  // Load data on startup
  useEffect(() => {
    loadData().catch((e) => {
      console.error('[HabitFairy] Data load failed:', e);
    });
  }, []);

  const handleSettingsPress = () => {
    setGateVisible(true);
  };

  const handleGateSuccess = () => {
    router.push('/manage');
  };

  // Determine if we should show the TabBar
  // Show only on main screens: index, rewards, dashboard
  // Manage is also a main screen but protected. 
  // We'll show tab bar on these pages.
  const segment = segments[0] || 'index';
  const showTabBar = ['index', 'rewards', 'manage', 'dashboard'].includes(segment);

  return (
    <ErrorBoundary fallbackMessage="Something went wrong">
      <StatusBar style="dark" />
      <View className="flex-1 bg-magic-bg">
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#F5F3FF' }, // magic-bg
            headerShadowVisible: false,
            headerTitleStyle: { fontFamily: 'Nunito', fontWeight: 'bold', color: '#4B5563' },
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: '#F5F3FF' },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: '습관요정 별이',
              headerRight: () => (
                <Pressable onPress={handleSettingsPress} className="p-2">
                  <Text className="text-2xl">⚙️</Text>
                </Pressable>
              ),
            }} 
          />
          <Stack.Screen name="rewards" options={{ title: '꾸미기' }} />
          <Stack.Screen name="manage" options={{ title: '미션 관리' }} />
          <Stack.Screen name="dashboard" options={{ title: '대시보드' }} />
          <Stack.Screen name="mission/[id]" options={{ title: '미션 수행', headerShown: false }} />
        </Stack>

        {showTabBar && <TabBar />}

        <ParentsGate 
          visible={gateVisible} 
          onClose={() => setGateVisible(false)} 
          onSuccess={handleGateSuccess} 
        />
      </View>
    </ErrorBoundary>
  );
}
