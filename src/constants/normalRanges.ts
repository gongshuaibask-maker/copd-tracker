// 各指标正常参考范围
// 用于自动判断正常/临界/异常状态

export interface NormalRange {
  min?: number;
  max?: number;
  label: string;
  unit: string;
}

export const NORMAL_RANGES: Record<string, NormalRange> = {
  // === 肺功能 ===
  fev1_fvc_ratio:      { min: 70,  label: '≥70%',        unit: '%' },
  fev1_predicted_pct:  { min: 80,  label: '≥80%预计值',  unit: '%' },
  rv_tlc_ratio:        { max: 40,  label: '<40%',         unit: '%' },
  dlco:                { min: 80,  label: '≥80%预计值',   unit: '%预计值' },

  // === 支气管舒张试验 ===
  bronchodilator_improvement:  { min: 12,  label: '≥12%',     unit: '%' },
  bronchodilator_absolute:     { min: 200, label: '≥200mL',   unit: 'mL' },

  // === 气道炎症 ===
  feno_ppb:            { max: 25,  label: '<25 ppb',       unit: 'ppb' },
  blood_eos:           { max: 0.3, label: '<0.3×10⁹/L',    unit: '×10⁹/L' },

  // === 氧合 ===
  spo2:                { min: 95,  label: '≥95%',          unit: '%' },
  respiratory_rate:    { min: 12, max: 20, label: '12-20', unit: '次/分' },
  heart_rate:          { min: 60, max: 100, label: '60-100', unit: 'bpm' },

  // === 睡眠 ===
  nocturnal_min_spo2:  { min: 90,  label: '≥90%',          unit: '%' },
  odi:                 { max: 5,   label: '<5 次/小时',    unit: '次/小时' },
  t90_pct:             { max: 10,  label: '<10%',          unit: '%' },

  // === 营养 ===
  bmi:                 { min: 18.5, max: 24, label: '18.5-24', unit: 'kg/m²' },
  albumin:             { min: 35,  label: '≥35 g/L',       unit: 'g/L' },

  // === 合并症 ===
  fbg:                 { min: 3.9, max: 6.1, label: '3.9-6.1 mmol/L', unit: 'mmol/L' },
  hba1c:               { max: 6.0, label: '<6.0%',         unit: '%' },
  pap_mmhg:            { max: 25,  label: '<25 mmHg',      unit: 'mmHg' },
};

// 判断指标状态: 'normal' | 'borderline' | 'abnormal' | 'unknown'
export function getIndicatorStatus(
  key: string,
  value: number | null,
  age?: number | null,
): 'normal' | 'borderline' | 'abnormal' | 'unknown' {
  if (value === null || value === undefined) return 'unknown';
  const range = NORMAL_RANGES[key];
  if (!range) return 'unknown';

  // 对特定指标进行年龄分层调整
  let adjustedRange = { min: range.min, max: range.max };

  if (age !== null && age !== undefined) {
    // FEV₁%pred：年龄 ≥70 岁时，正常下限从 80% 降至 70%（LLN 随年龄下降）
    if (key === 'fev1_predicted_pct' && age >= 70) {
      adjustedRange.min = 70;
    }
    // SpO₂：年龄 ≥75 岁，正常下限从 95% 降至 93%
    if (key === 'spo2' && age >= 75) {
      adjustedRange.min = 93;
    }
    // 心率：年龄 ≥65 岁，正常上限从 100 调整为 105
    if (key === 'heart_rate' && age >= 65) {
      adjustedRange.max = 105;
    }
  }

  const deviation = adjustedRange.min !== undefined
    ? (value - adjustedRange.min) / adjustedRange.min
    : adjustedRange.max !== undefined
      ? (adjustedRange.max - value) / adjustedRange.max
      : 0;

  if (adjustedRange.min !== undefined && value >= adjustedRange.min) {
    // 上限也需满足
    if (adjustedRange.max !== undefined && value > adjustedRange.max) {
      return Math.abs(deviation) < 0.2 ? 'borderline' : 'abnormal';
    }
    return 'normal';
  }
  if (adjustedRange.max !== undefined && value <= adjustedRange.max) {
    // 下限也需满足
    if (adjustedRange.min !== undefined && value < adjustedRange.min) {
      return Math.abs(deviation) < 0.2 ? 'borderline' : 'abnormal';
    }
    return 'normal';
  }
  if (adjustedRange.min !== undefined && adjustedRange.max !== undefined) {
    if (value >= adjustedRange.min && value <= adjustedRange.max) return 'normal';
  }

  if (Math.abs(deviation) < 0.2) return 'borderline';
  return 'abnormal';
}

/** 获取年龄分层后的调整正常范围 */
export function getAgeAdjustedRange(
  key: string,
  age?: number | null,
): { min?: number; max?: number; label: string; unit: string } | null {
  const range = NORMAL_RANGES[key];
  if (!range) return null;

  let min = range.min;
  let max = range.max;
  let label = range.label;

  if (age !== null && age !== undefined) {
    if (key === 'fev1_predicted_pct' && age >= 70) {
      min = 70;
      label = '≥70%预计值（年龄调整）';
    }
    if (key === 'spo2' && age >= 75) {
      min = 93;
      label = '≥93%（年龄调整）';
    }
    if (key === 'heart_rate' && age >= 65) {
      max = 105;
      label = '60-105（年龄调整）';
    }
  }

  return { min, max, label, unit: range.unit };
}
