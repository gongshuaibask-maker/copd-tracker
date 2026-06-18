// 用药使用记录数据操作（患者自述药物名称+用法+状态）
import { getDatabase } from '../index';
import type { MedicationUsage, MedicationUsageStatus } from '../../types/models';

export async function getAllMedicationUsage(): Promise<MedicationUsage[]> {
  const db = await getDatabase();
  return db.getAllAsync<MedicationUsage>(
    'SELECT * FROM medication_usage ORDER BY record_date DESC, id DESC'
  );
}

export async function getMedicationUsage(id: number): Promise<MedicationUsage | null> {
  const db = await getDatabase();
  return db.getFirstAsync<MedicationUsage>(
    'SELECT * FROM medication_usage WHERE id = ?', [id]
  );
}

export async function createMedicationUsage(
  drugName: string,
  status: MedicationUsageStatus,
  recordDate: string,
  usageMethod?: string,
  notes?: string,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO medication_usage (drug_name, usage_method, status, record_date, notes) VALUES (?, ?, ?, ?, ?)`,
    [drugName, usageMethod ?? null, status, recordDate, notes ?? null]
  );
  return result.lastInsertRowId;
}

export async function updateMedicationUsage(
  id: number,
  drugName: string,
  status: MedicationUsageStatus,
  recordDate: string,
  usageMethod?: string,
  notes?: string,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE medication_usage SET drug_name=?, usage_method=?, status=?, record_date=?, notes=?, updated_at=datetime('now','localtime') WHERE id=?`,
    [drugName, usageMethod ?? null, status, recordDate, notes ?? null, id]
  );
}

export async function deleteMedicationUsage(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM medication_usage WHERE id = ?', [id]);
}
