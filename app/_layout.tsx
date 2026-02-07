// ============================================
// 루트 레이아웃 — 탭 네비게이션
// ErrorBoundary로 각 탭 화면 감싸기
// ============================================

import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppStore } from '@/lib/store';

/** 탭 아이콘 컴포넌트 */
function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function RootLayout() {
  const loadData = useAppStore((s) => s.loadData);

  // 앱 시작 시 데이터 로드
  useEffect(() => {
    loadData().catch((e) => {
      console.error('[HabitFairy] 초기 데이터 로드 실패:', e);
    });
  }, []);

  return (
    <ErrorBoundary fallbackMessage="앱을 시작하는 중 문제가 발생했어요">
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🏠" label="홈" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="rewards"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="👗" label="꾸미기" focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📊" label="대시보드" focused={focused} />
            ),
          }}
        />
        {/* 미션 실행 화면 — 탭에서 숨김 */}
        <Tabs.Screen
          name="mission/[id]"
          options={{
            href: null, // 탭에 표시하지 않음
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    height: 80,
    paddingBottom: 16,
    paddingTop: 8,
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabEmoji: {
    fontSize: 24,
  },
  tabEmojiActive: {
    fontSize: 28,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  tabLabelActive: {
    color: '#F59E0B',
    fontWeight: '700',
  },
});
