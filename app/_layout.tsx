import '../global.css';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { View, Pressable, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Jua_400Regular } from '@expo-google-fonts/jua';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppStore } from '@/lib/store';
import TabBar from '@/components/TabBar';
import ParentsGate from '@/components/ParentsGate';

export default function RootLayout() {
  const loadData = useAppStore((s) => s.loadData);
  const router = useRouter();
  const segments = useSegments();
  const [gateVisible, setGateVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    'Jua': Jua_400Regular,
  });

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

  if (!fontsLoaded) {
    return null;
  }

  const segment = segments[0] || 'index';
  const showTabBar = ['index', 'rewards', 'manage', 'dashboard', 'character'].includes(segment);

  const isWeb = Platform.OS === 'web';

  const globalFont = { fontFamily: 'Jua' };

  return (
    <ErrorBoundary fallbackMessage="Something went wrong">
      <StatusBar style="light" />
      <LinearGradient
        colors={['#8E97C8', '#B8C0E8', '#C8CEE8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.3, y: 1 }}
        style={[
          { flex: 1 },
          isWeb ? {
            maxWidth: 480,
            width: '100%',
            alignSelf: 'center' as any,
            height: '100vh' as any,
            boxShadow: '0 0 40px rgba(0,0,0,0.15)',
            overflow: 'hidden' as any,
            position: 'relative' as any,
          } : {},
        ]}
      >
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: 'transparent' },
            headerShadowVisible: false,
            headerTitleStyle: { ...globalFont, fontSize: 20, color: '#FFFFFF' },
            headerTitleAlign: 'center',
            headerTintColor: '#FFFFFF',
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: '습관요정 별이',
              headerShown: false,
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
