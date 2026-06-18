// 慢阻肺自我管理 APP — 全部 TypeScript 类型定义

// ==================== 个人档案 ====================
export interface User {
  id: number;
  nickname: string;
  birth_date: string;
  gender: 'male' | 'female';
  height_cm: number;
  weight_kg: number;
  diagnosis_date: string | null;
  gold_stage: 1 | 2 | 3 | 4 | null;
  created_at: string;
  updated_at: string;
}

// ==================== 肺功能 ====================
export interface PulmonaryFunction {
  id: number;
  record_date: string;
  photo_uri: string | null;
  /** OCR 识别的肺功能报告结论文字 */
  conclusion: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PulmonaryFunctionDetail {
  id: number;
  record_id: number;
  indicator_key: IndicatorKey;
  indicator_level: 1 | 2 | 3 | 4;
  predicted_value: number | null;
  pre_actual: number | null;
  pre_pct_predicted: number | null;
  post_actual: number | null;
  post_pct_predicted: number | null;
  improvement_rate: number | null;
}

export type IndicatorKey =
  | 'fvc' | 'fev1' | 'fev1_fvc_ratio' | 'fev1_predicted_pct'
  | 'pef' | 'mef75' | 'mef50' | 'mef25' | 'mmef'
  | 'tlc' | 'rv' | 'rv_tlc_ratio' | 'ic' | 'erv'
  | 've' | 'vt' | 'rr' | 'mvv' | 'raw' | 'dlco';

export interface PulmonaryFunctionRecord extends PulmonaryFunction {
  details: PulmonaryFunctionDetail[];
}

// ==================== 气道炎症 ====================
export interface AirwayInflammation {
  id: number;
  record_date: string;
  feno_ppb: number | null;
  blood_eos: number | null;
  sputum_eos_pct: number | null;
  sputum_neut_pct: number | null;
  photo_uri: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 症状评分 ====================
export interface SymptomScore {
  id: number;
  record_date: string;
  cat_total: number;
  cat_q1_cough: number | null;
  cat_q2_phlegm: number | null;
  cat_q3_chest_tight: number | null;
  cat_q4_breathless: number | null;
  cat_q5_home_activity: number | null;
  cat_q6_going_out: number | null;
  cat_q7_sleep: number | null;
  cat_q8_energy: number | null;
  mmrc_grade: number | null;
  /** 过去 12 个月急性加重次数（GOLD 分组必需） */
  exacerbation_count: number;
  /** 过去 12 个月是否因急性加重住院 */
  exacerbation_hospitalized: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 运动耐力 ====================
export interface ExerciseTest {
  id: number;
  record_date: string;
  distance_m: number | null;
  pre_spo2: number | null;
  post_spo2: number | null;
  pre_hr: number | null;
  post_hr: number | null;
  borg_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 日常生命体征 ====================
export interface DailyVitals {
  id: number;
  record_date: string;
  spo2: number | null;
  respiratory_rate: number | null;
  heart_rate: number | null;
  measurement_time: 'morning' | 'evening' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 营养体重 ====================
export interface NutritionWeight {
  id: number;
  record_date: string;
  weight_kg: number | null;
  bmi: number | null;
  albumin: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 急性加重 ====================
export interface ExacerbationLog {
  id: number;
  start_date: string;
  duration_days: number;
  symptoms_increased_breathless: number | null;
  sputum_volume_increased: number | null;
  sputum_purulent: number;
  used_antibiotics: number;
  used_oral_steroids: number;
  hospitalized: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 用药记录 ====================
export type InhalerType = 'MDI' | 'DPI' | 'SMI' | 'nebulizer' | 'other';

export interface MedicationLog {
  id: number;
  record_date: string;
  rescue_inhaler_times: number;
  inhaler_technique_score: number | null;
  /** 吸入器类型 */
  inhaler_type: InhalerType | null;
  /** 维持用药方案（如：噻托溴铵 18μg QD） */
  maintenance_meds: string | null;
  /** 急救用药方案（如：沙丁胺醇 100μg PRN） */
  rescue_meds: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 合并症 ====================
export interface Comorbidity {
  id: number;
  record_date: string;
  pap_mmhg: number | null;
  bone_density_t: number | null;
  fbg: number | null;
  hba1c: number | null;
  tc: number | null;
  tg: number | null;
  hdl: number | null;
  ldl: number | null;
  photo_uri: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 戒烟管理 ====================
export interface SmokingCessation {
  id: number;
  record_date: string;
  cigarettes_per_day: number;
  ftnd_total: number | null;
  ftnd_q1: number | null;
  ftnd_q2: number | null;
  ftnd_q3: number | null;
  ftnd_q4: number | null;
  ftnd_q5: number | null;
  ftnd_q6: number | null;
  quit_date: string | null;
  relapse_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 睡眠监测 ====================
export interface SleepMonitoring {
  id: number;
  record_date: string;
  nocturnal_min_spo2: number | null;
  nocturnal_mean_spo2: number | null;
  odi: number | null;
  t90_pct: number | null;
  nocturnal_mean_hr: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 患者资料（统一照片查看） ====================
export interface PatientDocument {
  id: string;           // 格式: "模块名_记录id"
  module: string;       // 模块标识
  moduleName: string;   // 中文模块名
  recordDate: string;   // 检查日期
  photoUri: string;     // 照片路径
  summary: string;      // 简要描述
  uploadOrder: number;  // 上传顺序（同日排序用）
}

// ==================== 行动计划（Action Plan） ====================
export interface ActionPlan {
  id: number;
  created_at: string;
  updated_at: string;
  zone: 'green' | 'yellow' | 'red';
  // 绿区（稳定期）方案
  green_daily_meds: string | null;
  green_exercise: string | null;
  green_oxygen: string | null;
  // 黄区（加重预警）方案
  yellow_symptoms: string | null;
  yellow_actions: string | null;
  yellow_meds_adjust: string | null;
  // 红区（紧急）方案
  red_emergency_symptoms: string | null;
  red_actions: string | null;
  red_contact: string | null;
  // 通用
  doctor_name: string | null;
  doctor_phone: string | null;
  last_reviewed: string | null;
  notes: string | null;
}

// ==================== 肺康复训练 ====================
export interface PulmonaryRehab {
  id: number;
  record_date: string;
  /** 训练分钟数 */
  duration_min: number;
  /** 缩唇呼吸 (min) */
  pursed_lip_breathing_min: number | null;
  /** 腹式呼吸 (min) */
  diaphragmatic_breathing_min: number | null;
  /** 上肢阻力训练 (min) */
  upper_limb_exercise_min: number | null;
  /** 下肢耐力训练 (min) */
  lower_limb_exercise_min: number | null;
  /** 步行距离 (m) */
  walking_distance_m: number | null;
  /** 训练前 SpO₂ */
  pre_spo2: number | null;
  /** 训练后 SpO₂ */
  post_spo2: number | null;
  /** Borg 评分 (0-10) */
  borg_score: number | null;
  /** 是否完成全部计划 */
  completed: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 疫苗接种 ====================
export interface Vaccination {
  id: number;
  vaccine_type: 'influenza' | 'pneumococcal' | 'covid19' | 'tdap' | 'rsv' | 'rsv_mrna' | 'other';
  vaccine_name: string;
  dose_number: number;
  vaccination_date: string;
  next_due_date: string | null;
  batch_number: string | null;
  /** 流感疫苗：是否为高剂量/佐剂 */
  high_dose: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== 用药使用记录（患者自述） ====================
export type MedicationUsageStatus = 'using' | 'long_term' | 'intermittent' | 'stopped' | 'switched' | 'combined';

export interface MedicationUsage {
  id: number;
  drug_name: string;
  usage_method: string | null;
  status: MedicationUsageStatus;
  record_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function getMedicationStatusLabel(status: MedicationUsageStatus): string {
  const labels: Record<MedicationUsageStatus, string> = {
    using: '使用中', long_term: '长期使用', intermittent: '间断使用',
    stopped: '已停用', switched: '已换用', combined: '联合使用',
  };
  return labels[status];
}
