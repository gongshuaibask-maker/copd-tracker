// 通用趋势折线图组件 — 含正常范围参考、趋势方向、临床洞察
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useT } from '../i18n';
import { NORMAL_RANGES, getIndicatorStatus } from '../constants/normalRanges';

const SCREEN_WIDTH = Dimensions.get('window').width - 32;

export interface ChartDataPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  title: string;
  data: ChartDataPoint[];
  color?: string;
  unit?: string;
  yAxisSuffix?: string;
  /** 指标 key，用于查找正常范围（如 'spo2', 'heart_rate', 'weight_kg' 等） */
  indicatorKey?: string;
  /** 手动指定正常范围（优先级高于 indicatorKey） */
  normalMin?: number;
  normalMax?: number;
}

export default function TrendChart({
  title,
  data,
  color = '#2E7D32',
  unit,
  yAxisSuffix,
  indicatorKey,
  normalMin,
  normalMax,
}: TrendChartProps) {
  const t = useT();
  // 计算趋势信息
  const trendInfo = useMemo(() => {
    if (data.length < 2) return null;
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    const change = latest.value - previous.value;
    const pctChange = previous.value !== 0
      ? ((change / previous.value) * 100).toFixed(1)
      : null;
    return {
      latestValue: latest.value,
      latestDate: latest.date,
      previousValue: previous.value,
      change,
      pctChange,
      isImproving: change > 0,
      isWorsening: change < 0,
    };
  }, [data]);

  // 获取正常范围
  const rangeInfo = useMemo(() => {
    if (normalMin !== undefined && normalMax !== undefined) {
      return { min: normalMin, max: normalMax, label: `${normalMin}-${normalMax}` };
    }
    if (indicatorKey && NORMAL_RANGES[indicatorKey]) {
      const range = NORMAL_RANGES[indicatorKey];
      return { min: range.min, max: range.max, label: range.label };
    }
    return null;
  }, [indicatorKey, normalMin, normalMax]);

  // 最新值状态
  const lastStatus = useMemo(() => {
    if (!trendInfo || !indicatorKey) return null;
    return getIndicatorStatus(indicatorKey, trendInfo.latestValue);
  }, [trendInfo, indicatorKey]);

  if (data.length < 2) {
    return (
      <Surface style={styles.emptyCard}>
        <MaterialCommunityIcons name="chart-line" size={40} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyHint}>{t.trendChart.needMore}</Text>
      </Surface>
    );
  }

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const labels = sorted.map((d) => d.date.slice(5)); // 'MM-DD'
  const values = sorted.map((d) => d.value);

  const chartData = {
    labels,
    datasets: [{ data: values, color: () => color, strokeWidth: 2 }],
  };

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalCount: 1,
    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    labelColor: () => '#666',
    propsForDots: { r: '5', strokeWidth: '2', stroke: color },
    propsForLabels: { fontSize: 10 },
    formatYLabel: (v: string) => `${v}${yAxisSuffix ?? ''}`,
  };

  const statusConfig = {
    normal: { icon: '✅', color: '#2E7D32', label: t.trendChart.normal },
    borderline: { icon: '⚠️', color: '#F57F17', label: t.trendChart.borderline },
    abnormal: { icon: '🔴', color: '#C62828', label: t.trendChart.abnormal },
    unknown: { icon: '—', color: '#9E9E9E', label: t.trendChart.unknown },
  };
  const status = lastStatus ? statusConfig[lastStatus] : null;

  return (
    <Surface style={styles.card}>
      {/* 标题行 + 状态徽章 */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight}>
          {status && (
            <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.icon} {status.label}
              </Text>
            </View>
          )}
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </View>
      </View>

      {/* 正常范围参考 */}
      {rangeInfo && (
        <View style={styles.rangeRow}>
          <MaterialCommunityIcons name="target" size={14} color="#888" />
          <Text style={styles.rangeText}>
            {t.trendChart.normalRange.replace('{range}', rangeInfo.label)}
            {rangeInfo.min !== undefined && rangeInfo.max !== undefined
              ? ` (${rangeInfo.min}–${rangeInfo.max})` : ''}
          </Text>
        </View>
      )}

      {/* 趋势线图 */}
      <LineChart
        data={chartData}
        width={SCREEN_WIDTH - 40}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero={false}
        yAxisSuffix={yAxisSuffix ?? ''}
        yAxisInterval={1}
      />

      {/* 趋势方向指示 */}
      {trendInfo && (
        <View style={styles.trendRow}>
          <View style={styles.trendLeft}>
            <Text style={styles.latestValue}>
              {trendInfo.latestValue}{yAxisSuffix ?? ''}
            </Text>
            <Text style={styles.latestDate}>（{trendInfo.latestDate}）</Text>
          </View>
          <View style={[
            styles.trendBadge,
            trendInfo.isWorsening ? styles.trendBadgeDown :
            trendInfo.isImproving ? styles.trendBadgeUp : styles.trendBadgeFlat,
          ]}>
            <MaterialCommunityIcons
              name={trendInfo.isWorsening ? 'arrow-down' : trendInfo.isImproving ? 'arrow-up' : 'arrow-right'}
              size={16}
              color={trendInfo.isWorsening ? '#C62828' : trendInfo.isImproving ? '#2E7D32' : '#999'}
            />
            <Text style={[
              styles.trendText,
              trendInfo.isWorsening ? styles.trendDown :
              trendInfo.isImproving ? styles.trendUp : styles.trendFlat,
            ]}>
              {t.trendChart.lastTime.replace('{value}', `${trendInfo.previousValue}${yAxisSuffix ?? ''}`)}
              {trendInfo.change !== 0 && (
                ` · ${trendInfo.change > 0 ? '+' : ''}${trendInfo.change}${yAxisSuffix ?? ''}`
              )}
              {trendInfo.pctChange !== null && trendInfo.change !== 0 && (
                ` (${trendInfo.change > 0 ? '+' : ''}${trendInfo.pctChange}%)`
              )}
            </Text>
          </View>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12, elevation: 2, backgroundColor: '#FFF', marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '600', color: '#424242' },
  unit: { fontSize: 12, color: '#888' },
  // 状态徽章
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  // 正常范围
  rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  rangeText: { fontSize: 12, color: '#888' },
  // 图表
  chart: { borderRadius: 8, marginLeft: -8 },
  // 趋势方向
  trendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  trendLeft: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  latestValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  latestDate: { fontSize: 12, color: '#999' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, gap: 4 },
  trendBadgeUp: { backgroundColor: '#E8F5E9' },
  trendBadgeDown: { backgroundColor: '#FFEBEE' },
  trendBadgeFlat: { backgroundColor: '#F5F5F5' },
  trendText: { fontSize: 12 },
  trendUp: { color: '#2E7D32', fontWeight: '600' },
  trendDown: { color: '#C62828', fontWeight: '600' },
  trendFlat: { color: '#999' },
  // 空数据
  emptyCard: { padding: 24, borderRadius: 12, elevation: 1, backgroundColor: '#FFF', alignItems: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#424242', marginTop: 8 },
  emptyHint: { fontSize: 13, color: '#999', marginTop: 4 },
});
