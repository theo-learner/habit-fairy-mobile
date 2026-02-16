import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── 차트 컴포넌트 ───
function AreaChart({ data }: { data: number[] }) {
  const width = SCREEN_WIDTH - 48; // padding
  const height = 150;
  const max = 100;
  
  // 데이터 포인트 좌표 계산
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (val / max) * height;
    return `${x},${y}`;
  });

  // 곡선 경로 생성 (Bezier)
  const pathData = `M0,${height} ` + points.map((p, i) => {
    if (i === 0) return `L${p}`;
    const [prevX, prevY] = points[i - 1].split(',').map(Number);
    const [currX, currY] = p.split(',').map(Number);
    const cp1X = prevX + (currX - prevX) / 2;
    const cp1Y = prevY;
    const cp2X = prevX + (currX - prevX) / 2;
    const cp2Y = currY;
    return `C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${currX},${currY}`;
  }).join(' ') + ` L${width},${height} Z`;

  // 라인 경로 (채우기 영역 제외)
  const linePathData = `M0,${height - (data[0] / max) * height} ` + points.map((p, i) => {
    if (i === 0) return `L${p}`;
    const [prevX, prevY] = points[i - 1].split(',').map(Number);
    const [currX, currY] = p.split(',').map(Number);
    const cp1X = prevX + (currX - prevX) / 2;
    const cp1Y = prevY;
    const cp2X = prevX + (currX - prevX) / 2;
    const cp2Y = currY;
    return `C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${currX},${currY}`;
  }).join(' ');

  return (
    <Svg width={width} height={height + 20}>
      <Defs>
        <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4FC3F7" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#4FC3F7" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {/* 영역 채우기 */}
      <Path d={pathData} fill="url(#gradient)" />
      {/* 라인 */}
      <Path d={linePathData} stroke="#29B6F6" strokeWidth="3" fill="none" />
      
      {/* 포인트 (수요일 강조 예시) */}
      <Circle cx={(2 / 6) * width} cy={height - (data[2] / max) * height} r="4" fill="#FFF" stroke="#29B6F6" strokeWidth="2" />
    </Svg>
  );
}

function DonutChart({ percent, color }: { percent: number; color: string }) {
  const size = 100;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F0F0F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: '#333' }}>{percent}%</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const missions = useAppStore((s) => s.missions);
  const completedMap = useAppStore((s) => s.completedMap);
  const totalStars = useAppStore((s) => s.totalStars);
  const getStreakDays = useAppStore((s) => s.getStreakDays);

  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = (completedMap[today] || []).length;
  const streakDays = getStreakDays();

  // 더미 데이터 (차트용)
  const weeklyData = [10, 45, 40, 5, 50, 10, 0]; // 월~일

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Text style={{ fontSize: 24 }}>{'<'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>부모 대시보드</Text>
        <Pressable onPress={() => {}} style={styles.iconButton}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 요약 카드 */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
              <Text style={{ fontSize: 20 }}>✅</Text>
            </View>
            <Text style={styles.summaryLabel}>오늘 달성</Text>
            <Text style={styles.summaryValue}>{todayCompleted}/{missions.length}</Text>
            <Text style={styles.summarySub}>아직 시작하지 않았어요</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFF8E1' }]}>
              <Text style={{ fontSize: 20 }}>⭐</Text>
            </View>
            <Text style={styles.summaryLabel}>모든 별</Text>
            <Text style={styles.summaryValue}>{totalStars}</Text>
            <Text style={styles.summarySub}>누적 별 개수</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFEBEE' }]}>
              <Text style={{ fontSize: 20 }}>🔥</Text>
            </View>
            <Text style={styles.summaryLabel}>연속 달성</Text>
            <Text style={styles.summaryValue}>{streakDays}일</Text>
            <Text style={styles.summarySub}>현재 연속 기록</Text>
          </View>
        </View>

        {/* 주간 달성률 */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>주간 달성률</Text>
          <View style={styles.chartContainer}>
            <AreaChart data={weeklyData} />
            <View style={styles.xAxis}>
              {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                <Text key={day} style={styles.dayLabel}>{day}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* 주요 습관 현황 */}
        <Text style={[styles.sectionTitle, { marginLeft: 4, marginBottom: 12 }]}>주요 습관 현황</Text>
        <View style={styles.habitGrid}>
          {missions.slice(0, 2).map((mission, idx) => (
            <View key={mission.id} style={styles.habitCard}>
              <Text style={styles.habitTitle}>{mission.name}</Text>
              <View style={styles.donutContainer}>
                <DonutChart percent={idx === 0 ? 75 : 50} color={idx === 0 ? '#4FC3F7' : '#81D4FA'} />
              </View>
              <Text style={styles.habitSub}>{idx === 0 ? '3/4회 완료' : '1/2회 완료'}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // 연한 회색 배경
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  iconButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    marginBottom: 4,
  },
  summarySub: {
    fontSize: 9,
    color: '#757575',
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  dayLabel: {
    fontSize: 12,
    color: '#999',
  },
  habitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  habitCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  donutContainer: {
    marginBottom: 12,
  },
  habitSub: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
});
