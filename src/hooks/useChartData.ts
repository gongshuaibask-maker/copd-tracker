// 图表数据 Hook — 通用数据转化
import { useMemo } from 'react';
import type { ChartDataPoint } from '../components/TrendChart';

type Range = '3m' | '6m' | '1y' | 'all';

/** 按时间范围过滤数据 */
export function useFilterByRange<T extends { record_date: string }>(
  records: T[],
  range: Range,
): T[] {
  return useMemo(() => {
    if (range === 'all') return records;
    const now = new Date();
    const months = range === '3m' ? 3 : range === '6m' ? 6 : 12;
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, 1);
    return records.filter(r => r.record_date >= cutoff.toISOString().slice(0, 10));
  }, [records, range]);
}

/** 将记录数组转为图表数据点 */
export function useToChartData<T, K extends keyof T>(
  records: T[],
  field: K,
  dateField: keyof T = 'record_date' as keyof T,
): ChartDataPoint[] {
  return useMemo(() =>
    records
      .map(r => ({ date: String(r[dateField]), value: Number(r[field]) ?? 0 }))
      .filter(p => p.value !== 0),
    [records, field, dateField]
  );
}
