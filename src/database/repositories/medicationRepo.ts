// 用药记录数据操作
import { getDatabase } from '../index';
import type { MedicationLog } from '../../types/models';

export async function getAllMedications(): Promise<MedicationLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<MedicationLog>(
    'SELECT * FROM medication_log ORDER BY record_date DESC, id DESC'
  );
}

export async function getMedication(id: number): Promise<MedicationLog | null> {
  const db = await getDatabase();
  return db.getFirstAsync<MedicationLog>(
    'SELECT * FROM medication_log WHERE id = ?', [id]
  );
}

export async function createMedication(
  recordDate: string,
  rescueInhalerTimes: number,
  inhalerTechniqueScore: number | null,
  inhalerType: string | null,
  maintenanceMeds: string | null,
  rescueMeds: string | null,
  notes: string | null,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO medication_log (record_date, rescue_inhaler_times, inhaler_technique_score, inhaler_type, maintenance_meds, rescue_meds, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [recordDate, rescueInhalerTimes, inhalerTechniqueScore ?? null,
     inhalerType ?? null, maintenanceMeds ?? null, rescueMeds ?? null, notes ?? null]
  );
  return result.lastInsertRowId;
}

export async function updateMedication(
  id: number,
  recordDate: string,
  rescueInhalerTimes: number,
  inhalerTechniqueScore: number | null,
  inhalerType: string | null,
  maintenanceMeds: string | null,
  rescueMeds: string | null,
  notes: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE medication_log SET record_date=?, rescue_inhaler_times=?,
     inhaler_technique_score=?, inhaler_type=?, maintenance_meds=?, rescue_meds=?,
     notes=?, updated_at=datetime('now','localtime')
     WHERE id=?`,
    [recordDate, rescueInhalerTimes, inhalerTechniqueScore ?? null,
     inhalerType ?? null, maintenanceMeds ?? null, rescueMeds ?? null, notes ?? null, id]
  );
}

export async function deleteMedication(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM medication_log WHERE id = ?', [id]);
}
