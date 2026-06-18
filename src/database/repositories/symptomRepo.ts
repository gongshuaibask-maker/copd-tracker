// 症状评分数据操作
import { getDatabase } from '../index';
import type { SymptomScore } from '../../types/models';

/** 获取最近一次 CAT 总分数 */
export async function getLatestCATScore(): Promise<number | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ cat_total: number }>(
    `SELECT cat_total FROM symptom_scores ORDER BY record_date DESC, id DESC LIMIT 1`
  );
  return row?.cat_total ?? null;
}

/** 获取最近一次 mMRC 分级 */
export async function getLatestMmrcGrade(): Promise<number | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ mmrc_grade: number }>(
    `SELECT mmrc_grade FROM symptom_scores ORDER BY record_date DESC, id DESC LIMIT 1`
  );
  return row?.mmrc_grade ?? null;
}

export async function getAllSymptomScores(): Promise<SymptomScore[]> {
  const db = await getDatabase();
  return db.getAllAsync<SymptomScore>(
    'SELECT * FROM symptom_scores ORDER BY record_date DESC, id DESC'
  );
}

export async function getSymptomScore(id: number): Promise<SymptomScore | null> {
  const db = await getDatabase();
  return db.getFirstAsync<SymptomScore>(
    'SELECT * FROM symptom_scores WHERE id = ?',
    [id]
  );
}

export async function createSymptomScore(
  recordDate: string,
  catTotal: number,
  answers: Record<string, number | null>,
  mmrcGrade: number | null,
  notes: string | null,
  exacerbationCount: number = 0,
  exacerbationHospitalized: number = 0,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO symptom_scores (
      record_date, cat_total, cat_q1_cough, cat_q2_phlegm, cat_q3_chest_tight,
      cat_q4_breathless, cat_q5_home_activity, cat_q6_going_out,
      cat_q7_sleep, cat_q8_energy, mmrc_grade,
      exacerbation_count, exacerbation_hospitalized, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recordDate,
      catTotal,
      answers.cat_q1_cough ?? null,
      answers.cat_q2_phlegm ?? null,
      answers.cat_q3_chest_tight ?? null,
      answers.cat_q4_breathless ?? null,
      answers.cat_q5_home_activity ?? null,
      answers.cat_q6_going_out ?? null,
      answers.cat_q7_sleep ?? null,
      answers.cat_q8_energy ?? null,
      mmrcGrade ?? null,
      exacerbationCount,
      exacerbationHospitalized,
      notes ?? null,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateSymptomScore(
  id: number,
  recordDate: string,
  catTotal: number,
  answers: Record<string, number | null>,
  mmrcGrade: number | null,
  notes: string | null,
  exacerbationCount: number = 0,
  exacerbationHospitalized: number = 0,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE symptom_scores SET
      record_date=?, cat_total=?, cat_q1_cough=?, cat_q2_phlegm=?, cat_q3_chest_tight=?,
      cat_q4_breathless=?, cat_q5_home_activity=?, cat_q6_going_out=?,
      cat_q7_sleep=?, cat_q8_energy=?, mmrc_grade=?,
      exacerbation_count=?, exacerbation_hospitalized=?, notes=?, updated_at=datetime('now','localtime')
     WHERE id=?`,
    [
      recordDate,
      catTotal,
      answers.cat_q1_cough ?? null,
      answers.cat_q2_phlegm ?? null,
      answers.cat_q3_chest_tight ?? null,
      answers.cat_q4_breathless ?? null,
      answers.cat_q5_home_activity ?? null,
      answers.cat_q6_going_out ?? null,
      answers.cat_q7_sleep ?? null,
      answers.cat_q8_energy ?? null,
      mmrcGrade ?? null,
      exacerbationCount,
      exacerbationHospitalized,
      notes ?? null,
      id,
    ]
  );
}

export async function deleteSymptomScore(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM symptom_scores WHERE id = ?', [id]);
}
