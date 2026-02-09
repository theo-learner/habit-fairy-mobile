import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Pressable, Text, Platform } from 'react-native';
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
  const showTabBar = ['index', 'rewards', 'manage', 'dashboard', 'character'].includes(segment);

  const isWeb = Platform.OS === 'web';

  return (
    <ErrorBoundary fallbackMessage="Something went wrong">
      <StatusBar style="dark" />
      {/* 
        On Web, we constrain the app to a mobile-like frame.
        We center it and apply a max-width.
      */}
      <View 
        className="flex-1 bg-magic-bg"
        style={isWeb ? {
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
          height: '100%',
          // On web, View maps to a div, so these styles work.
          // We add a subtle shadow and rounded corners for effect if not full screen on mobile.
          // But usually mobile apps are full screen. Let's stick to the prompt's request.
          boxShadow: '0 0 40px rgba(0,0,0,0.2)',
          minHeight: '100vh',
          fontFamily: 'Jua',
        } : {}}
      >
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#F5F3FF' }, // magic-bg
            headerShadowVisible: false,
            // Use Jua font for headers too, fallback to system
            headerTitleStyle: { fontFamily: 'Jua', color: '#4B5563' },
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: '#F5F3FF' },
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              title: '습관요정 별이',
            }} 
          />
          <Stack.Screen name="character" options={{ title: '내 친구' }} />
          <Stack.Screen name="rewards" options={{ title: '꾸미기' }} />
          <Stack.Screen name="manage" options={{ title: '미션 관리' }} />
          <Stack.Screen name="dashboard" options={{ title: '기록' }} />
          <Stack.Screen name="mission/[id]" options={{ title: '미션 수행', headerShown: false }} />
        </Stack>

        {showTabBar && <TabBar onProtectedPress={handleSettingsPress} />}

        <ParentsGate 
          visible={gateVisible} 
          onClose={() => setGateVisible(false)} 
          onSuccess={handleGateSuccess} 
        />
      </View>
    </ErrorBoundary>
  );
}
