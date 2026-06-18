// 肺功能检查 — 主子表数据操作
import { getDatabase } from '../index';
import type { PulmonaryFunction, PulmonaryFunctionDetail, PulmonaryFunctionRecord } from '../../types/models';
import { PULMONARY_INDICATORS } from '../../constants/pulmonaryIndicators';

// ==================== 主表 CRUD ====================

export async function getAllPulmonaryRecords(): Promise<PulmonaryFunction[]> {
  const db = await getDatabase();
  return db.getAllAsync<PulmonaryFunction>(
    'SELECT * FROM pulmonary_function ORDER BY record_date DESC'
  );
}

export async function getPulmonaryRecord(id: number): Promise<PulmonaryFunctionRecord | null> {
  const db = await getDatabase();
  const record = await db.getFirstAsync<PulmonaryFunction>(
    'SELECT * FROM pulmonary_function WHERE id = ?', [id]
  );
  if (!record) return null;

  const details = await db.getAllAsync<PulmonaryFunctionDetail>(
    'SELECT * FROM pulmonary_function_detail WHERE record_id = ? ORDER BY indicator_level, indicator_key',
    [id]
  );
  return { ...record, details };
}

export async function createPulmonaryRecord(
  recordDate: string, photoUri: string | null, notes: string | null,
  details: Omit<PulmonaryFunctionDetail, 'id' | 'record_id'>[],
  conclusion?: string | null,
): Promise<number> {
  const db = await getDatabase();

  // 插入主表
  const result = await db.runAsync(
    `INSERT INTO pulmonary_function (record_date, photo_uri, conclusion, notes) VALUES (?, ?, ?, ?)`,
    [recordDate, photoUri, conclusion ?? null, notes ?? null]
  );
  const recordId = result.lastInsertRowId;

  // 批量插入子表（只插入有数据的）
  for (const d of details) {
    const hasData = d.predicted_value !== null || d.pre_actual !== null
      || d.post_actual !== null || d.pre_pct_predicted !== null
      || d.post_pct_predicted !== null || d.improvement_rate !== null;
    if (!hasData) continue;

    const def = PULMONARY_INDICATORS[d.indicator_key];
    await db.runAsync(
      `INSERT INTO pulmonary_function_detail
       (record_id, indicator_key, indicator_level, predicted_value, pre_actual,
        pre_pct_predicted, post_actual, post_pct_predicted, improvement_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [recordId, d.indicator_key, def?.level ?? 1,
       d.predicted_value ?? null, d.pre_actual ?? null,
       d.pre_pct_predicted ?? null, d.post_actual ?? null,
       d.post_pct_predicted ?? null, d.improvement_rate ?? null]
    );
  }

  return recordId;
}

export async function updatePulmonaryRecord(
  recordId: number, recordDate: string, photoUri: string | null, notes: string | null,
  details: Omit<PulmonaryFunctionDetail, 'id' | 'record_id'>[],
  conclusion?: string | null,
): Promise<void> {
  const db = await getDatabase();

  // 更新主表
  await db.runAsync(
    `UPDATE pulmonary_function SET record_date=?, photo_uri=?, conclusion=?, notes=?,
     updated_at=datetime('now','localtime') WHERE id=?`,
    [recordDate, photoUri, conclusion ?? null, notes ?? null, recordId]
  );

  // 删除旧子表数据
  await db.runAsync('DELETE FROM pulmonary_function_detail WHERE record_id = ?', [recordId]);

  // 重新插入子表数据
  for (const d of details) {
    const hasData = d.predicted_value !== null || d.pre_actual !== null
      || d.post_actual !== null;
    if (!hasData) continue;

    const def = PULMONARY_INDICATORS[d.indicator_key];
    await db.runAsync(
      `INSERT INTO pulmonary_function_detail
       (record_id, indicator_key, indicator_level, predicted_value, pre_actual,
        pre_pct_predicted, post_actual, post_pct_predicted, improvement_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [recordId, d.indicator_key, def?.level ?? 1,
       d.predicted_value ?? null, d.pre_actual ?? null,
       d.pre_pct_predicted ?? null, d.post_actual ?? null,
       d.post_pct_predicted ?? null, d.improvement_rate ?? null]
    );
  }
}

export async function deletePulmonaryRecord(id: number): Promise<void> {
  const db = await getDatabase();
  // 级联删除由外键 ON DELETE CASCADE 自动处理
  await db.runAsync('DELETE FROM pulmonary_function WHERE id = ?', [id]);
}

// ==================== 趋势查询 ====================

// 查询某个指标的历史趋势（用于折线图）
export async function getIndicatorTrend(
  indicatorKey: string,
  subField: 'pre_actual' | 'post_actual' | 'pre_pct_predicted' | 'post_pct_predicted' | 'improvement_rate' | 'predicted_value'
): Promise<Array<{ record_date: string; value: number }>> {
  const db = await getDatabase();
  return db.getAllAsync<{ record_date: string; value: number }>(
    `SELECT f.record_date, d.${subField} as value
     FROM pulmonary_function_detail d
     JOIN pulmonary_function f ON f.id = d.record_id
     WHERE d.indicator_key = ? AND d.${subField} IS NOT NULL
     ORDER BY f.record_date ASC`,
    [indicatorKey]
  );
}

// 获取含照片的肺功能记录（用于患者资料统一查看）
export async function getRecordsWithPhotos(): Promise<Array<{ id: number; record_date: string; photo_uri: string; summary: string }>> {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT id, record_date, photo_uri,
       (SELECT GROUP_CONCAT(indicator_key || '=' || pre_actual, ', ')
        FROM pulmonary_function_detail WHERE record_id = pf.id AND indicator_level = 1) as summary
     FROM pulmonary_function pf
     WHERE photo_uri IS NOT NULL AND photo_uri != ''
     ORDER BY record_date DESC, id DESC`
  );
}
