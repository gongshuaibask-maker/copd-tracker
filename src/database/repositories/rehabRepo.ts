// 肺康复训练数据操作
import { getDatabase } from '../index';
import type { PulmonaryRehab } from '../../types/models';

export async function getAllRehab(): Promise<PulmonaryRehab[]> {
  const db = await getDatabase();
  return db.getAllAsync<PulmonaryRehab>(
    'SELECT * FROM pulmonary_rehab ORDER BY record_date DESC, id DESC'
  );
}

export async function getLatestRehab(): Promise<PulmonaryRehab | null> {
  const db = await getDatabase();
  return db.getFirstAsync<PulmonaryRehab>(
    'SELECT * FROM pulmonary_rehab ORDER BY record_date DESC LIMIT 1'
  );
}

export async function createRehab(r: Omit<PulmonaryRehab, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const db = await getDatabase();
  const res = await db.runAsync(
    `INSERT INTO pulmonary_rehab (record_date, duration_min, pursed_lip_breathing_min,
     diaphragmatic_breathing_min, upper_limb_exercise_min, lower_limb_exercise_min,
     walking_distance_m, pre_spo2, post_spo2, borg_score, completed, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [r.record_date, r.duration_min, r.pursed_lip_breathing_min ?? null,
     r.diaphragmatic_breathing_min ?? null, r.upper_limb_exercise_min ?? null,
     r.lower_limb_exercise_min ?? null, r.walking_distance_m ?? null,
     r.pre_spo2 ?? null, r.post_spo2 ?? null, r.borg_score ?? null,
     r.completed, r.notes ?? null]
  );
  return res.lastInsertRowId;
}

export async function updateRehab(id: number, r: Omit<PulmonaryRehab, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE pulmonary_rehab SET record_date=?, duration_min=?, pursed_lip_breathing_min=?,
     diaphragmatic_breathing_min=?, upper_limb_exercise_min=?, lower_limb_exercise_min=?,
     walking_distance_m=?, pre_spo2=?, post_spo2=?, borg_score=?, completed=?, notes=?,
     updated_at=datetime('now','localtime') WHERE id=?`,
    [r.record_date, r.duration_min, r.pursed_lip_breathing_min ?? null,
     r.diaphragmatic_breathing_min ?? null, r.upper_limb_exercise_min ?? null,
     r.lower_limb_exercise_min ?? null, r.walking_distance_m ?? null,
     r.pre_spo2 ?? null, r.post_spo2 ?? null, r.borg_score ?? null,
     r.completed, r.notes ?? null, id]
  );
}

export async function deleteRehab(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM pulmonary_rehab WHERE id = ?', [id]);
}
