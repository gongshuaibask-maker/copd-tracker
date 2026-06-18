// 日常生命体征（SpO₂、呼吸频率、心率）数据操作
import { getDatabase } from '../index';
import type { DailyVitals } from '../../types/models';

export async function getAllVitalsRecords(): Promise<DailyVitals[]> {
  const db = await getDatabase();
  return db.getAllAsync<DailyVitals>(
    'SELECT * FROM daily_vitals ORDER BY record_date DESC, id DESC'
  );
}

export async function getVitalsRecord(id: number): Promise<DailyVitals | null> {
  const db = await getDatabase();
  return db.getFirstAsync<DailyVitals>(
    'SELECT * FROM daily_vitals WHERE id = ?', [id]
  );
}

export async function getLatestVitals(): Promise<DailyVitals | null> {
  const db = await getDatabase();
  return db.getFirstAsync<DailyVitals>(
    'SELECT * FROM daily_vitals ORDER BY record_date DESC, id DESC LIMIT 1'
  );
}

export async function createVitalsRecord(
  recordDate: string,
  spo2: number | null,
  respiratoryRate: number | null,
  heartRate: number | null,
  measurementTime: 'morning' | 'evening' | null,
  notes: string | null,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO daily_vitals (record_date, spo2, respiratory_rate, heart_rate, measurement_time, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [recordDate, spo2 ?? null, respiratoryRate ?? null, heartRate ?? null,
     measurementTime ?? null, notes ?? null]
  );
  return result.lastInsertRowId;
}

export async function updateVitalsRecord(
  id: number,
  recordDate: string,
  spo2: number | null,
  respiratoryRate: number | null,
  heartRate: number | null,
  measurementTime: 'morning' | 'evening' | null,
  notes: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE daily_vitals SET record_date=?, spo2=?, respiratory_rate=?, heart_rate=?,
     measurement_time=?, notes=?, updated_at=datetime('now','localtime') WHERE id=?`,
    [recordDate, spo2 ?? null, respiratoryRate ?? null, heartRate ?? null,
     measurementTime ?? null, notes ?? null, id]
  );
}

export async function deleteVitalsRecord(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM daily_vitals WHERE id = ?', [id]);
}
