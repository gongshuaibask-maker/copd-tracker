// 患者疾病总结 — 数据聚合服务
// 每个模块只取最近一条记录，汇总展示

import { getDatabase } from '../database';
import { PULMONARY_INDICATORS } from '../constants/pulmonaryIndicators';
import type {
  User, PulmonaryFunctionRecord, PulmonaryFunctionDetail,
  AirwayInflammation, SymptomScore, ExerciseTest,
  DailyVitals, NutritionWeight, ExacerbationLog, MedicationLog,
  Comorbidity, SmokingCessation, SleepMonitoring, PulmonaryRehab,
  Vaccination, MedicationUsage,
} from '../types/models';

// ==================== 汇总数据类型 ====================

/** 一个模块的汇总结果 */
export interface ModuleSummary<T = unknown> {
  hasData: boolean;
  moduleName: string;
  moduleIcon: string;
  recordDate: string | null;
  data: T | null;
}

/** 肺功能汇总（含所有有数据的指标） */
export interface PulmonarySummaryData {
  recordDate: string;
  indicators: PulmonaryFunctionDetail[];
  conclusion: string | null;
}

/** 症状评分汇总 */
export interface SymptomSummaryData {
  recordDate: string;
  catTotal: number;
  mmrcGrade: number | null;
  /** 过去12个月急性加重次数（GOLD分组必需） */
  exacerbationCount: number;
  /** 过去12个月是否曾因加重住院 */
  exacerbationHospitalized: number;
}

/** 全部汇总 */
export interface PatientSummary {
  user: User | null;
  generatedAt: string;
  pulmonary: ModuleSummary<PulmonarySummaryData>;
  inflammation: ModuleSummary<AirwayInflammation>;
  symptom: ModuleSummary<SymptomSummaryData>;
  exercise: ModuleSummary<ExerciseTest>;
  vitals: ModuleSummary<DailyVitals>;
  nutrition: ModuleSummary<NutritionWeight>;
  exacerbation: ModuleSummary<ExacerbationLog>;
  medication: ModuleSummary<MedicationLog>;
  comorbidity: ModuleSummary<Comorbidity>;
  smoking: ModuleSummary<SmokingCessation>;
  sleep: ModuleSummary<SleepMonitoring>;
  rehab: ModuleSummary<PulmonaryRehab>;
  vaccination: ModuleSummary<Vaccination[]>;
  medicationUsage: ModuleSummary<MedicationUsage[]>;
}

// ==================== 各模块取最近一条记录 ====================

async function getLatestPulmonary(): Promise<ModuleSummary<PulmonarySummaryData>> {
  try {
    const db = await getDatabase();
    const record = await db.getFirstAsync<{ id: number; record_date: string; conclusion: string | null }>(
      'SELECT id, record_date, conclusion FROM pulmonary_function ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!record) return { hasData: false, moduleName: '肺功能检查', moduleIcon: 'lungs', recordDate: null, data: null };

    const details = await db.getAllAsync<PulmonaryFunctionDetail>(
      'SELECT * FROM pulmonary_function_detail WHERE record_id = ? ORDER BY indicator_level, indicator_key',
      [record.id]
    );
    // 只返回有实际数据的指标（至少有一个字段有值）
    const validDetails = details.filter(d =>
      d.predicted_value != null || d.pre_actual != null || d.post_actual != null
    );

    return {
      hasData: true,
      moduleName: '肺功能检查',
      moduleIcon: 'lungs',
      recordDate: record.record_date,
      data: { recordDate: record.record_date, indicators: validDetails, conclusion: record.conclusion },
    };
  } catch {
    return { hasData: false, moduleName: '肺功能检查', moduleIcon: 'lungs', recordDate: null, data: null };
  }
}

async function getLatestInflammation(): Promise<ModuleSummary<AirwayInflammation>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<AirwayInflammation>(
      'SELECT * FROM airway_inflammation ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '气道炎症', moduleIcon: 'flask', recordDate: null, data: null };
    return { hasData: true, moduleName: '气道炎症', moduleIcon: 'flask', recordDate: r.record_date, data: r };
  } catch {
    return { hasData: false, moduleName: '气道炎症', moduleIcon: 'flask', recordDate: null, data: null };
  }
}

async function getLatestSymptom(): Promise<ModuleSummary<SymptomSummaryData>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<{ record_date: string; cat_total: number; mmrc_grade: number | null; exacerbation_count: number; exacerbation_hospitalized: number }>(
      'SELECT record_date, cat_total, mmrc_grade, exacerbation_count, exacerbation_hospitalized FROM symptom_scores ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '症状评分', moduleIcon: 'clipboard-list', recordDate: null, data: null };
    return {
      hasData: true, moduleName: '症状评分', moduleIcon: 'clipboard-list',
      recordDate: r.record_date,
      data: {
        recordDate: r.record_date, catTotal: r.cat_total, mmrcGrade: r.mmrc_grade,
        exacerbationCount: r.exacerbation_count ?? 0,
        exacerbationHospitalized: r.exacerbation_hospitalized ?? 0,
      },
    };
  } catch {
    return { hasData: false, moduleName: '症状评分', moduleIcon: 'clipboard-list', recordDate: null, data: null };
  }
}

async function getLatestExercise(): Promise<ModuleSummary<ExerciseTest>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<ExerciseTest>(
      'SELECT * FROM exercise_test ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '运动耐力', moduleIcon: 'run-fast', recordDate: null, data: null };
    return { hasData: true, moduleName: '运动耐力', moduleIcon: 'run-fast', recordDate: r.record_date, data: r };
  } catch {
    return { hasData: false, moduleName: '运动耐力', moduleIcon: 'run-fast', recordDate: null, data: null };
  }
}

async function getLatestVitals(): Promise<ModuleSummary<DailyVitals>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<DailyVitals>(
      'SELECT * FROM daily_vitals ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '氧合呼吸', moduleIcon: 'heart-pulse', recordDate: null, data: null };
    return { hasData: true, moduleName: '氧合呼吸', moduleIcon: 'heart-pulse', recordDate: r.record_date, data: r };
  } catch {
    return { hasData: false, moduleName: '氧合呼吸', moduleIcon: 'heart-pulse', recordDate: null, data: null };
  }
}

async function getLatestNutrition(): Promise<ModuleSummary<NutritionWeight>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<NutritionWeight>(
      'SELECT * FROM nutrition_weight ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '营养体重', moduleIcon: 'scale-bathroom', recordDate: null, data: null };
    return { hasData: true, moduleName: '营养体重', moduleIcon: 'scale-bathroom', recordDate: r.record_date, data: r };
  } catch {
    return { hasData: false, moduleName: '营养体重', moduleIcon: 'scale-bathroom', recordDate: null, data: null };
  }
}

async function getLatestExacerbation(): Promise<ModuleSummary<ExacerbationLog>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<ExacerbationLog>(
      'SELECT * FROM exacerbation_log ORDER BY start_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '急性加重', moduleIcon: 'alert-octagon', recordDate: null, data: null };
    return { hasData: true, moduleName: '急性加重', moduleIcon: 'alert-octagon', recordDate: r.start_date, data: r };
  } catch {
    return { hasData: false, moduleName: '急性加重', moduleIcon: 'alert-octagon', recordDate: null, data: null };
  }
}

async function getLatestMedication(): Promise<ModuleSummary<MedicationLog>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<MedicationLog>(
      'SELECT * FROM medication_log ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '用药疗效', moduleIcon: 'pill', recordDate: null, data: null };
    return { hasData: true, moduleName: '用药疗效', moduleIcon: 'pill', recordDate: r.record_date, data: r };
  } catch {
    return { hasData: false, moduleName: '用药疗效', moduleIcon: 'pill', recordDate: null, data: null };
  }
}

async function getLatestComorbidity(): Promise<ModuleSummary<Comorbidity>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<Comorbidity>(
      'SELECT * FROM comorbidity ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '合并症', moduleIcon: 'hospital-box', recordDate: null, data: null };
    return { hasData: true, moduleName: '合并症', moduleIcon: 'hospital-box', recordDate: r.record_date, data: r };
  } catch {
    return { hasData: false, moduleName: '合并症', moduleIcon: 'hospital-box', recordDate: null, data: null };
  }
}

async function getLatestSmoking(): Promise<ModuleSummary<SmokingCessation>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<SmokingCessation>(
      'SELECT * FROM smoking_cessation ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '戒烟管理', moduleIcon: 'smoking-off', recordDate: null, data: null };
    return { hasData: true, moduleName: '戒烟管理', moduleIcon: 'smoking-off', recordDate: r.record_date, data: r };
  } catch {
    return { hasData: false, moduleName: '戒烟管理', moduleIcon: 'smoking-off', recordDate: null, data: null };
  }
}

async function getLatestSleep(): Promise<ModuleSummary<SleepMonitoring>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<SleepMonitoring>(
      'SELECT * FROM sleep_monitoring ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '睡眠监测', moduleIcon: 'sleep', recordDate: null, data: null };
    return { hasData: true, moduleName: '睡眠监测', moduleIcon: 'sleep', recordDate: r.record_date, data: r };
  } catch {
    return { hasData: false, moduleName: '睡眠监测', moduleIcon: 'sleep', recordDate: null, data: null };
  }
}

async function getLatestRehab(): Promise<ModuleSummary<PulmonaryRehab>> {
  try {
    const db = await getDatabase();
    const r = await db.getFirstAsync<PulmonaryRehab>(
      'SELECT * FROM pulmonary_rehab ORDER BY record_date DESC, id DESC LIMIT 1'
    );
    if (!r) return { hasData: false, moduleName: '肺康复训练', moduleIcon: 'run', recordDate: null, data: null };
    return { hasData: true, moduleName: '肺康复训练', moduleIcon: 'run', recordDate: r.record_date, data: r };
  } catch {
    return { hasData: false, moduleName: '肺康复训练', moduleIcon: 'run', recordDate: null, data: null };
  }
}

async function getLatestVaccinations(): Promise<ModuleSummary<Vaccination[]>> {
  try {
    const db = await getDatabase();
    const all = await db.getAllAsync<Vaccination>(
      'SELECT * FROM vaccinations ORDER BY vaccination_date DESC, id DESC'
    );
    if (all.length === 0) return { hasData: false, moduleName: '疫苗接种', moduleIcon: 'needle', recordDate: null, data: null };
    // 疫苗每种只取最近一次
    const latestByType = new Map<string, Vaccination>();
    for (const v of all) {
      if (!latestByType.has(v.vaccine_type)) {
        latestByType.set(v.vaccine_type, v);
      }
    }
    const vaccines = Array.from(latestByType.values());
    return {
      hasData: true, moduleName: '疫苗接种', moduleIcon: 'needle',
      recordDate: vaccines[0]?.vaccination_date ?? null,
      data: vaccines,
    };
  } catch {
    return { hasData: false, moduleName: '疫苗接种', moduleIcon: 'needle', recordDate: null, data: null };
  }
}

async function getLatestMedicationUsage(): Promise<ModuleSummary<MedicationUsage[]>> {
  try {
    const db = await getDatabase();
    const all = await db.getAllAsync<MedicationUsage>(
      'SELECT * FROM medication_usage ORDER BY record_date DESC, id DESC'
    );
    if (all.length === 0) return { hasData: false, moduleName: '用药记录', moduleIcon: 'pill', recordDate: null, data: null };
    return {
      hasData: true, moduleName: '用药记录', moduleIcon: 'pill',
      recordDate: all[0].record_date, data: all,
    };
  } catch {
    return { hasData: false, moduleName: '用药记录', moduleIcon: 'pill', recordDate: null, data: null };
  }
}

// ==================== 主入口 ====================

/**
 * 获取患者疾病总结
 * 每个模块只取最近一条记录
 */
export async function getPatientSummary(): Promise<PatientSummary> {
  const [user, pulmonary, inflammation, symptom, exercise, vitals,
    nutrition, exacerbation, medication, comorbidity, smoking, sleep,
    rehab, vaccination, medicationUsage] = await Promise.all([
    getUserSummary(),
    getLatestPulmonary(),
    getLatestInflammation(),
    getLatestSymptom(),
    getLatestExercise(),
    getLatestVitals(),
    getLatestNutrition(),
    getLatestExacerbation(),
    getLatestMedication(),
    getLatestComorbidity(),
    getLatestSmoking(),
    getLatestSleep(),
    getLatestRehab(),
    getLatestVaccinations(),
    getLatestMedicationUsage(),
  ]);

  return {
    user,
    generatedAt: new Date().toISOString(),
    pulmonary, inflammation, symptom, exercise, vitals,
    nutrition, exacerbation, medication, comorbidity, smoking, sleep,
    rehab, vaccination, medicationUsage,
  };
}

async function getUserSummary(): Promise<User | null> {
  try {
    const db = await getDatabase();
    return db.getFirstAsync<User>('SELECT * FROM users ORDER BY id ASC LIMIT 1');
  } catch {
    return null;
  }
}
