import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Pressable, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      <LinearGradient
        colors={['#FFD1DC', '#E6E6FA', '#D1F2EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1"
        style={isWeb ? {
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
          height: '100%',
          boxShadow: '0 0 40px rgba(0,0,0,0.1)',
          minHeight: '100vh',
          fontFamily: 'Quicksand, sans-serif',
        } : {}}
      >
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: 'transparent' },
            headerShadowVisible: false,
            headerTitleStyle: { fontFamily: 'Quicksand', fontWeight: '700', color: '#4A4A4A' },
            headerTitleAlign: 'center',
            contentStyle: { backgroundColor: 'transparent' },
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
      </LinearGradient>
    </ErrorBoundary>
  );
}
