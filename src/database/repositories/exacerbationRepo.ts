// 急性加重记录数据操作
import { getDatabase } from '../index';
import type { ExacerbationLog } from '../../types/models';
import { getLatestCATScore, getLatestMmrcGrade } from './symptomRepo';

export async function getAllExacerbations(): Promise<ExacerbationLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<ExacerbationLog>(
    'SELECT * FROM exacerbation_log ORDER BY start_date DESC, id DESC'
  );
}

export async function getExacerbation(id: number): Promise<ExacerbationLog | null> {
  const db = await getDatabase();
  return db.getFirstAsync<ExacerbationLog>(
    'SELECT * FROM exacerbation_log WHERE id = ?', [id]
  );
}

export async function createExacerbation(
  startDate: string,
  durationDays: number,
  symptomsIncreasedBreathless: number | null,
  sputumVolumeIncreased: number | null,
  sputumPurulent: number,
  usedAntibiotics: number,
  usedOralSteroids: number,
  hospitalized: number,
  notes: string | null,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO exacerbation_log
     (start_date, duration_days, symptoms_increased_breathless, sputum_volume_increased,
      sputum_purulent, used_antibiotics, used_oral_steroids, hospitalized, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [startDate, durationDays,
     symptomsIncreasedBreathless ?? null, sputumVolumeIncreased ?? null,
     sputumPurulent, usedAntibiotics, usedOralSteroids, hospitalized, notes ?? null]
  );
  return result.lastInsertRowId;
}

export async function updateExacerbation(
  id: number,
  startDate: string,
  durationDays: number,
  symptomsIncreasedBreathless: number | null,
  sputumVolumeIncreased: number | null,
  sputumPurulent: number,
  usedAntibiotics: number,
  usedOralSteroids: number,
  hospitalized: number,
  notes: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE exacerbation_log SET
     start_date=?, duration_days=?, symptoms_increased_breathless=?,
     sputum_volume_increased=?, sputum_purulent=?, used_antibiotics=?,
     used_oral_steroids=?, hospitalized=?, notes=?,
     updated_at=datetime('now','localtime')
     WHERE id=?`,
    [startDate, durationDays,
     symptomsIncreasedBreathless ?? null, sputumVolumeIncreased ?? null,
     sputumPurulent, usedAntibiotics, usedOralSteroids, hospitalized, notes ?? null, id]
  );
}

export async function deleteExacerbation(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM exacerbation_log WHERE id = ?', [id]);
}

/** 获取最近一年的急性加重次数（用于首页风险评级） */
export async function getExacerbationCountLastYear(): Promise<number> {
  const db = await getDatabase();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const dateStr = oneYearAgo.toISOString().slice(0, 10);
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM exacerbation_log WHERE start_date >= ?`,
    [dateStr]
  );
  return result?.count ?? 0;
}

/** 检查过去一年是否住过院 */
export async function hasHospitalizedLastYear(): Promise<boolean> {
  const db = await getDatabase();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const dateStr = oneYearAgo.toISOString().slice(0, 10);
  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM exacerbation_log
     WHERE start_date >= ? AND hospitalized = 1`,
    [dateStr]
  );
  return (result?.count ?? 0) > 0;
}

/**
 * 获取 GOLD 2026 综合风险分组: 'A' | 'B' | 'E'
 *
 * GOLD 2026 A/B/E 分组规则（2025年11月更新）：
 * - A 组：0次中重度加重 + 症状少（CAT<10 且 mMRC 0-1）
 * - B 组：0次中重度加重 + 症状多（CAT≥10 或 mMRC≥2）
 * - E 组：≥1次中重度加重（零容忍原则）
 *
 * ⚠️ 核心变更：GOLD 2026 将 E 组阈值从 ≥2次 降为 ≥1次
 *
 * 加重次数来源：优先使用症状评分模块录入的"过去12个月急性加重史"，
 * 若无则回退到 exacerbation_log 表中的记录数。
 */
export async function getGoldGroup(): Promise<'A' | 'B' | 'E'> {
  // 从症状评分表和加重日志表分别获取急性加重数据
  const [logCount, exacHistory] = await Promise.all([
    getExacerbationCountLastYear(),
    getLatestExacerbationHistory(),
  ]);

  // 使用综合加重次数：优先用症状评分中录入的加重史
  const effectiveCount = exacHistory !== null ? exacHistory.count : logCount;

  // GOLD 2026: ≥1 次中重度加重即归 E 组
  if (effectiveCount >= 1) return 'E';

  // A/B 分组依赖于症状负担
  const catScore = await getLatestCATScore();
  const mmrcGrade = await getLatestMmrcGrade();

  const hasHighSymptoms = (catScore !== null && catScore >= 10) || (mmrcGrade !== null && mmrcGrade >= 2);

  if (hasHighSymptoms) return 'B';
  return 'A';
}

/**
 * 获取综合风险评估等级: 'low' | 'medium' | 'high'
 * - 'low' = A 组（健康稳定）
 * - 'medium' = B 组（症状负担重，但无加重）
 * - 'high' = E 组（年≥1次加重）
 */
export async function getExacerbationRiskLevel(): Promise<'low' | 'medium' | 'high'> {
  const goldGroup = await getGoldGroup();
  if (goldGroup === 'E') return 'high';
  if (goldGroup === 'B') return 'medium';
  return 'low';
}

/**
 * 评估疾病活动度（GOLD 2026 新概念）
 * 低疾病活动状态：无加重 + 症状稳定 + 肺功能无加速下降
 */
export async function getDiseaseActivity(): Promise<'low' | 'active'> {
  // 同时检查加重日志表和症状评分表
  const [logCount, exacHistory] = await Promise.all([
    getExacerbationCountLastYear(),
    getLatestExacerbationHistory(),
  ]);

  const effectiveCount = exacHistory !== null ? exacHistory.count : logCount;
  if (effectiveCount > 0) return 'active';

  // 检查 CAT 是否上升（简化：最近2次 CAT 对比）
  const db = await getDatabase();
  const catRows = await db.getAllAsync<{ cat_total: number }>(
    'SELECT cat_total FROM symptom_scores ORDER BY record_date DESC LIMIT 2'
  );
  if (catRows.length === 2 && catRows[0].cat_total > catRows[1].cat_total) {
    return 'active';
  }
  return 'low';
}

/**
 * 获取详细风险评估信息（供首页展示）
 * 已更新为 GOLD 2026 标准
 */
export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  goldGroup: 'A' | 'B' | 'E';
  exacerbationCount: number;
  wasHospitalized: boolean;
  catScore: number | null;
  mmrcGrade: number | null;
  diseaseActivity: 'low' | 'active';
  summary: string;
  /** 是否有足够的GOLD分组数据（CAT评分+加重史都录入了） */
  hasGoldData: boolean;
}

/** 获取最新的症状评分中录入的急性加重史 */
async function getLatestExacerbationHistory(): Promise<{ count: number; hospitalized: number } | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ exacerbation_count: number; exacerbation_hospitalized: number }>(
    'SELECT exacerbation_count, exacerbation_hospitalized FROM symptom_scores WHERE exacerbation_count IS NOT NULL ORDER BY record_date DESC, id DESC LIMIT 1'
  );
  if (!row) return null;
  return { count: row.exacerbation_count ?? 0, hospitalized: row.exacerbation_hospitalized ?? 0 };
}

export async function getRiskAssessment(): Promise<RiskAssessment> {
  const [count, hospitalized, catScore, mmrcGrade, goldGroup, activity, exacHistory] = await Promise.all([
    getExacerbationCountLastYear(),
    hasHospitalizedLastYear(),
    getLatestCATScore(),
    getLatestMmrcGrade(),
    getGoldGroup(),
    getDiseaseActivity(),
    getLatestExacerbationHistory(),
  ]);

  // 统一使用症状评分中输入的加重史数据（用户主动录入）
  // 若症状评分中有加重史，则优先使用；否则回退到急性加重日志表
  const effectiveCount = exacHistory !== null ? exacHistory.count : count;
  const effectiveHospitalized = exacHistory !== null ? exacHistory.hospitalized > 0 : hospitalized;

  // GOLD分组要求：必须同时有 CAT 数据和加重史数据
  const hasCatData = catScore !== null;
  const hasExacData = exacHistory !== null || count > 0;
  const hasGoldData = hasCatData && hasExacData;

  const level = goldGroup === 'E' ? 'high' : goldGroup === 'B' ? 'medium' : 'low';

  let summary = '';
  if (goldGroup === 'E') {
    if (effectiveHospitalized) {
      summary = `Hospitalized for exacerbation in past year (GOLD Group E: ≥1 exacerbation/year is high risk).`;
    } else {
      summary = `${effectiveCount} exacerbation(s) in past year (GOLD 2026 E group: ≥1 is high risk).`;
    }
  } else if (goldGroup === 'B') {
    summary = 'High symptom burden (CAT≥10 or mMRC≥2) without exacerbation (GOLD Group B).';
  } else {
    summary = activity === 'low'
      ? 'Low disease activity (GOLD 2026 treatment goal): no exacerbations, stable symptoms.'
      : 'No exacerbations, but symptoms fluctuating. Continue monitoring.';
  }

  return { level, goldGroup, exacerbationCount: effectiveCount, wasHospitalized: effectiveHospitalized, catScore, mmrcGrade, diseaseActivity: activity, summary, hasGoldData };
}
