import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  Dimensions,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppStore } from '@/lib/store';
import { playButtonHaptic, playSuccessSound } from '@/lib/sounds';
import { CHARACTERS } from '@/lib/characters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── 원형 진행률 컴포넌트 ───
function CircularProgress({ 
  progress, 
  size = 280, 
  strokeWidth = 24,
  children 
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#4FACFE" stopOpacity="1" />
            <Stop offset="1" stopColor="#00F2FE" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E7FF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ 
        width: size - strokeWidth * 2, 
        height: size - strokeWidth * 2, 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: size / 2,
        backgroundColor: '#FFFFFF', 
        overflow: 'hidden',
        borderWidth: 1, 
        borderColor: '#F0F0F0'
      }}>
        {children}
      </View>
      
      <View style={styles.progressBadge}>
        <Text style={styles.progressText}>{Math.round(progress)}% 완료</Text>
      </View>
    </View>
  );
}

// ─── 미션 카드 컴포넌트 (그리드용) ───
function GridMissionCard({ 
  mission, 
  isCompleted, 
  onPress 
}: { 
  mission: any; 
  isCompleted: boolean; 
  onPress: () => void 
}) {
  const bgColors = {
    morning: '#FFDEE9', 
    daytime: '#B5FFFC', 
    evening: '#D9AFD9', 
    study: '#C2E9FB',   
    health: '#E0C3FC',  
  };
  const bgColor = isCompleted ? '#F0F0F0' : (bgColors[mission.category as keyof typeof bgColors] || '#FFF1EB');

  return (
    <Pressable onPress={onPress} style={[styles.missionCard, { backgroundColor: bgColor }]}>
      <Text style={styles.missionTitle}>{mission.name}</Text>
      <View style={styles.missionIconContainer}>
        <Text style={{ fontSize: 40 }}>{mission.icon}</Text>
      </View>
      {isCompleted && (
        <View style={styles.checkBadge}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </Pressable>
  );
}

function HomeScreenContent() {
  const router = useRouter();
  const missions = useAppStore((s) => s.missions);
  const childName = useAppStore((s) => s.childName) || '별이';
  const selectedCharacterId = useAppStore((s) => s.selectedCharacter);
  const loadData = useAppStore((s) => s.loadData);
  const isMissionCompletedToday = useAppStore((s) => s.isMissionCompletedToday);
  const getTodayCompleted = useAppStore((s) => s.getTodayCompleted);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const character = CHARACTERS.find(c => c.id === selectedCharacterId) || CHARACTERS[0];

  const safeMissions = Array.isArray(missions) ? missions : [];
  const todayCompleted = getTodayCompleted();
  const completedCount = Array.isArray(todayCompleted) ? todayCompleted.length : 0;
  const totalCount = safeMissions.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleMissionPress = (id: string) => {
    playButtonHaptic();
    router.push(`/mission/${id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => router.push('/manage')} style={styles.profileButton}>
          <Image 
            source={require('../assets/icon.png')} 
            style={{ width: 32, height: 32, borderRadius: 16 }} 
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4FACFE" />
        }
      >
        <View style={styles.mainSection}>
          <CircularProgress progress={progress}>
            <Animated.Image
              entering={FadeIn.duration(800)}
              source={character.asset}
              style={styles.characterImage}
              resizeMode="contain"
            />
          </CircularProgress>
        </View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>안녕, {childName}!</Text>
          <Text style={styles.greetingSubtitle}>오늘의 모험을 시작해볼까?</Text>
        </Animated.View>

        <View style={styles.gridContainer}>
          {safeMissions.map((mission, index) => (
            <Animated.View 
              key={mission.id} 
              entering={FadeInDown.delay(300 + index * 100)}
              style={styles.gridItemWrapper}
            >
              <GridMissionCard
                mission={mission}
                isCompleted={isMissionCompletedToday(mission.id)}
                onPress={() => handleMissionPress(mission.id)}
              />
            </Animated.View>
          ))}
          <Pressable 
            onPress={() => router.push('/manage')} 
            style={[styles.missionCard, styles.addCard]}
          >
            <Text style={{ fontSize: 32, color: '#A0A0A0' }}>+</Text>
          </Pressable>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  return (
    <ErrorBoundary fallbackMessage="홈 화면 오류">
      <HomeScreenContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F7', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  characterImage: {
    width: 180,
    height: 220,
    marginBottom: 10,
  },
  progressBadge: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: '#333',
  },
  greetingSection: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 24,
    fontFamily: 'Jua',
    color: '#111',
    marginBottom: 4,
  },
  greetingSubtitle: {
    fontSize: 16,
    fontFamily: 'Jua',
    color: '#666',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  gridItemWrapper: {
    width: '48%', 
    marginBottom: 16,
  },
  missionCard: {
    width: '100%',
    aspectRatio: 1, 
    borderRadius: 24,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addCard: {
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  missionTitle: {
    fontSize: 18,
    fontFamily: 'Jua',
    color: '#333',
  },
  missionIconContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CD964',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkText: {
    color: '#FFFFFF',
    fontFamily: 'Jua',
    fontSize: 14,
  },
});
