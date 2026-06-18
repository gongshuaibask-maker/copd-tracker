// 戒烟管理数据操作
import { getDatabase } from '../index';
import type { SmokingCessation } from '../../types/models';

export async function getAllSmoking(): Promise<SmokingCessation[]> {
  const db = await getDatabase();
  return db.getAllAsync<SmokingCessation>(
    'SELECT * FROM smoking_cessation ORDER BY record_date DESC, id DESC'
  );
}

export async function getSmoking(id: number): Promise<SmokingCessation | null> {
  const db = await getDatabase();
  return db.getFirstAsync<SmokingCessation>(
    'SELECT * FROM smoking_cessation WHERE id = ?', [id]
  );
}

export async function createSmoking(
  recordDate: string, cigarettesPerDay: number,
  ftndTotal: number | null, ftndQ1: number | null, ftndQ2: number | null,
  ftndQ3: number | null, ftndQ4: number | null, ftndQ5: number | null, ftndQ6: number | null,
  quitDate: string | null, relapseCount: number,
  notes: string | null,
): Promise<number> {
  const db = await getDatabase();
  const r = await db.runAsync(
    `INSERT INTO smoking_cessation (record_date, cigarettes_per_day, ftnd_total,
     ftnd_q1, ftnd_q2, ftnd_q3, ftnd_q4, ftnd_q5, ftnd_q6,
     quit_date, relapse_count, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [recordDate, cigarettesPerDay, ftndTotal ?? null,
     ftndQ1 ?? null, ftndQ2 ?? null, ftndQ3 ?? null, ftndQ4 ?? null, ftndQ5 ?? null, ftndQ6 ?? null,
     quitDate ?? null, relapseCount, notes ?? null]
  );
  return r.lastInsertRowId;
}

export async function updateSmoking(
  id: number, recordDate: string, cigarettesPerDay: number,
  ftndTotal: number | null, ftndQ1: number | null, ftndQ2: number | null,
  ftndQ3: number | null, ftndQ4: number | null, ftndQ5: number | null, ftndQ6: number | null,
  quitDate: string | null, relapseCount: number,
  notes: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE smoking_cessation SET record_date=?, cigarettes_per_day=?, ftnd_total=?,
     ftnd_q1=?, ftnd_q2=?, ftnd_q3=?, ftnd_q4=?, ftnd_q5=?, ftnd_q6=?,
     quit_date=?, relapse_count=?, notes=?, updated_at=datetime('now','localtime')
     WHERE id=?`,
    [recordDate, cigarettesPerDay, ftndTotal ?? null,
     ftndQ1 ?? null, ftndQ2 ?? null, ftndQ3 ?? null, ftndQ4 ?? null, ftndQ5 ?? null, ftndQ6 ?? null,
     quitDate ?? null, relapseCount, notes ?? null, id]
  );
}

export async function deleteSmoking(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM smoking_cessation WHERE id = ?', [id]);
}
