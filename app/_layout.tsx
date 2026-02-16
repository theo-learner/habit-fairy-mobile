import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Pressable, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Jua_400Regular } from '@expo-google-fonts/jua'; // Jua 폰트 사용 (귀여운 스타일)

import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppStore } from '@/lib/store';
import TabBar from '@/components/TabBar';
import ParentsGate from '@/components/ParentsGate';

export default function RootLayout() {
  const loadData = useAppStore((s) => s.loadData);
  const router = useRouter();
  const segments = useSegments();
  const [gateVisible, setGateVisible] = useState(false);

  // 폰트 로드
  const [fontsLoaded] = useFonts({
    'Jua': Jua_400Regular,
  });

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

  // 폰트 로딩 중이면 렌더링 지연 (또는 스플래시 유지)
  if (!fontsLoaded) {
    return null; 
  }

  const segment = segments[0] || 'index';
  const showTabBar = ['index', 'rewards', 'manage', 'dashboard', 'character'].includes(segment);

  const isWeb = Platform.OS === 'web';

  // 전역 폰트 스타일 적용
  const globalFont = { fontFamily: 'Jua' };

  return (
    <ErrorBoundary fallbackMessage="Something went wrong">
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#EDE7F6', '#E8DEF8', '#E0F2F1']}
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
          fontFamily: 'Jua, sans-serif',
        } : {}}
      >
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: 'transparent' },
            headerShadowVisible: false,
            headerTitleStyle: { ...globalFont, fontSize: 20, color: '#4A4A4A' },
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
