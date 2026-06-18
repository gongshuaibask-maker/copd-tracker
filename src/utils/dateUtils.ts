// 日期工具函数
import { format, parseISO, isValid, differenceInYears, differenceInMonths, subMonths } from 'date-fns';

/** 格式化日期为 yyyy-MM-dd */
export function fmtDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, 'yyyy-MM-dd') : '';
}

/** 格式化日期为 yyyy年M月d日 */
export function fmtDateCN(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isValid(d) ? format(d, 'yyyy年M月d日') : '';
}

/** 计算年龄 */
export function calcAge(birthDate: string): number {
  return differenceInYears(new Date(), parseISO(birthDate));
}

/** 计算距今天数 */
export function daysSince(dateStr: string): number {
  return differenceInMonths(new Date(), parseISO(dateStr));
}

/** 获取 N 个月前的日期字符串 */
export function monthsAgo(n: number): string {
  return format(subMonths(new Date(), n), 'yyyy-MM-dd');
}

/** 判断日期是否在指定月数范围内 */
export function isWithinMonths(dateStr: string, months: number): boolean {
  const cutoff = subMonths(new Date(), months);
  return parseISO(dateStr) >= cutoff;
}
