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
import { getAppWidth } from '@/lib/layout';

const SCREEN_WIDTH = getAppWidth();

const C = {
  lavender: '#8E97C8',
  lavenderLight: '#B8C0E8',
  sage: '#7DB89E',
  dark: '#4A5568',
  coral: '#E8744F',
  white: '#FFFFFF',
  textDark: '#2D3436',
  textMid: '#636E72',
};

function AreaChart({ data }: { data: number[] }) {
  const width = Math.min(SCREEN_WIDTH, 480) - 80;
  const height = 150;
  const max = 100;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (val / max) * height;
    return `${x},${y}`;
  });

  const pathData =
    `M0,${height} ` +
    points
      .map((p, i) => {
        if (i === 0) return `L${p}`;
        const [prevX, prevY] = points[i - 1].split(',').map(Number);
        const [currX, currY] = p.split(',').map(Number);
        const cp1X = prevX + (currX - prevX) / 2;
        return `C${cp1X},${prevY} ${cp1X},${currY} ${currX},${currY}`;
      })
      .join(' ') +
    ` L${width},${height} Z`;

  const linePathData =
    `M0,${height - (data[0] / max) * height} ` +
    points
      .map((p, i) => {
        if (i === 0) return `L${p}`;
        const [prevX, prevY] = points[i - 1].split(',').map(Number);
        const [currX, currY] = p.split(',').map(Number);
        const cp1X = prevX + (currX - prevX) / 2;
        return `C${cp1X},${prevY} ${cp1X},${currY} ${currX},${currY}`;
      })
      .join(' ');

  return (
    <Svg width={width} height={height + 20}>
      <Defs>
        <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={C.lavender} stopOpacity="0.4" />
          <Stop offset="1" stopColor={C.lavender} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={pathData} fill="url(#gradient)" />
      <Path d={linePathData} stroke={C.lavender} strokeWidth="3" fill="none" />
      <Circle
        cx={(2 / 6) * width}
        cy={height - (data[2] / max) * height}
        r="4"
        fill="#FFF"
        stroke={C.lavender}
        strokeWidth="2"
      />
    </Svg>
  );
}

function DonutChart({ percent, color }: { percent: number; color: string }) {
  const size = 90;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#EDF0F7" strokeWidth={strokeWidth} fill="none" />
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
        <Text style={{ fontSize: 16, fontWeight: '800', color: C.textDark, fontFamily: 'Jua' }}>{percent}%</Text>
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

  const weeklyData = [10, 45, 40, 5, 50, 10, 0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 요약 카드 */}
        <View style={styles.summaryRow}>
          {[
            { icon: '✅', label: '오늘 달성', value: `${todayCompleted}/${missions.length}`, bg: C.sage },
            { icon: '⭐', label: '모은 별', value: `${totalStars}`, bg: C.coral },
            { icon: '🔥', label: '연속 달성', value: `${streakDays}일`, bg: C.lavender },
          ].map((item, idx) => (
            <Animated.View key={idx} entering={FadeInDown.delay(idx * 80)} style={styles.summaryCard}>
              <View style={[styles.summaryIconCircle, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
              </View>
              <Text style={styles.summaryValue}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* 주간 달성률 */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.chartCard}>
          <Text style={styles.cardTitle}>주간 달성률</Text>
          <View style={styles.chartContainer}>
            <AreaChart data={weeklyData} />
            <View style={styles.xAxis}>
              {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                <Text key={day} style={styles.dayLabel}>{day}</Text>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* 주요 습관 */}
        <Animated.View entering={FadeInDown.delay(350)}>
          <Text style={[styles.cardTitle, { marginLeft: 4, marginBottom: 12, color: '#1A1A2E' }]}>주요 습관 현황</Text>
          <View style={styles.habitGrid}>
            {missions.slice(0, 2).map((mission, idx) => (
              <View key={mission.id} style={styles.habitCard}>
                <Text style={styles.habitTitle}>{mission.name}</Text>
                <DonutChart percent={idx === 0 ? 75 : 50} color={idx === 0 ? C.lavender : C.sage} />
                <Text style={styles.habitSub}>{idx === 0 ? '3/4회 완료' : '1/2회 완료'}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textDark,
    fontFamily: 'Jua',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.textMid,
    fontFamily: 'Jua',
  },
  chartCard: {
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.textDark,
    fontFamily: 'Jua',
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
    color: C.textMid,
    fontFamily: 'Jua',
  },
  habitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  habitCard: {
    width: '48%',
    backgroundColor: C.white,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textDark,
    fontFamily: 'Jua',
    marginBottom: 14,
  },
  habitSub: {
    fontSize: 12,
    color: C.textMid,
    fontWeight: '600',
    fontFamily: 'Jua',
    marginTop: 10,
  },
});
