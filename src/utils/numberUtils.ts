// 数值工具函数

/** 安全解析浮点数，非法输入返回 null */
export function parseFloatSafe(val: string): number | null {
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

/** 安全解析整数，非法输入返回 null */
export function parseIntSafe(val: string): number | null {
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}

/** 保留指定位数小数 */
export function roundTo(value: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** BMI 计算 */
export function calcBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  return roundTo(weightKg / ((heightCm / 100) ** 2), 1);
}

/** 数值范围校验 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/** 将空字符串转为 null */
export function emptyToNull(val: string): string | null {
  return val.trim() || null;
}
