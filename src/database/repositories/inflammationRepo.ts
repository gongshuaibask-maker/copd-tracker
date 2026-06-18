// 气道炎症数据操作
import { getDatabase } from '../index';
import type { AirwayInflammation } from '../../types/models';

export async function getAllInflammation(): Promise<AirwayInflammation[]> {
  const db = await getDatabase();
  return db.getAllAsync<AirwayInflammation>(
    'SELECT * FROM airway_inflammation ORDER BY record_date DESC, id DESC'
  );
}

export async function getInflammation(id: number): Promise<AirwayInflammation | null> {
  const db = await getDatabase();
  return db.getFirstAsync<AirwayInflammation>(
    'SELECT * FROM airway_inflammation WHERE id = ?', [id]
  );
}

export async function createInflammation(
  recordDate: string, fenoPpb: number | null, bloodEos: number | null,
  sputumEosPct: number | null, sputumNeutPct: number | null,
  photoUri: string | null, notes: string | null,
): Promise<number> {
  const db = await getDatabase();
  const r = await db.runAsync(
    `INSERT INTO airway_inflammation (record_date, feno_ppb, blood_eos, sputum_eos_pct, sputum_neut_pct, photo_uri, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [recordDate, fenoPpb ?? null, bloodEos ?? null, sputumEosPct ?? null, sputumNeutPct ?? null,
     photoUri ?? null, notes ?? null]
  );
  return r.lastInsertRowId;
}

export async function updateInflammation(
  id: number, recordDate: string, fenoPpb: number | null, bloodEos: number | null,
  sputumEosPct: number | null, sputumNeutPct: number | null,
  photoUri: string | null, notes: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE airway_inflammation SET record_date=?, feno_ppb=?, blood_eos=?,
     sputum_eos_pct=?, sputum_neut_pct=?, photo_uri=?, notes=?,
     updated_at=datetime('now','localtime') WHERE id=?`,
    [recordDate, fenoPpb ?? null, bloodEos ?? null, sputumEosPct ?? null, sputumNeutPct ?? null,
     photoUri ?? null, notes ?? null, id]
  );
}

export async function deleteInflammation(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM airway_inflammation WHERE id = ?', [id]);
}
