// 睡眠监测数据操作
import { getDatabase } from '../index';
import type { SleepMonitoring } from '../../types/models';

export async function getAllSleep(): Promise<SleepMonitoring[]> {
  const db = await getDatabase();
  return db.getAllAsync<SleepMonitoring>(
    'SELECT * FROM sleep_monitoring ORDER BY record_date DESC, id DESC'
  );
}

export async function getSleep(id: number): Promise<SleepMonitoring | null> {
  const db = await getDatabase();
  return db.getFirstAsync<SleepMonitoring>(
    'SELECT * FROM sleep_monitoring WHERE id = ?', [id]
  );
}

export async function createSleep(
  recordDate: string, nocturnalMinSpo2: number | null, nocturnalMeanSpo2: number | null,
  odi: number | null, t90Pct: number | null, nocturnalMeanHr: number | null,
  notes: string | null,
): Promise<number> {
  const db = await getDatabase();
  const r = await db.runAsync(
    `INSERT INTO sleep_monitoring (record_date, nocturnal_min_spo2, nocturnal_mean_spo2, odi, t90_pct, nocturnal_mean_hr, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [recordDate, nocturnalMinSpo2 ?? null, nocturnalMeanSpo2 ?? null,
     odi ?? null, t90Pct ?? null, nocturnalMeanHr ?? null, notes ?? null]
  );
  return r.lastInsertRowId;
}

export async function updateSleep(
  id: number, recordDate: string, nocturnalMinSpo2: number | null, nocturnalMeanSpo2: number | null,
  odi: number | null, t90Pct: number | null, nocturnalMeanHr: number | null,
  notes: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE sleep_monitoring SET record_date=?, nocturnal_min_spo2=?, nocturnal_mean_spo2=?,
     odi=?, t90_pct=?, nocturnal_mean_hr=?, notes=?, updated_at=datetime('now','localtime')
     WHERE id=?`,
    [recordDate, nocturnalMinSpo2 ?? null, nocturnalMeanSpo2 ?? null,
     odi ?? null, t90Pct ?? null, nocturnalMeanHr ?? null, notes ?? null, id]
  );
}

export async function deleteSleep(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sleep_monitoring WHERE id = ?', [id]);
}
