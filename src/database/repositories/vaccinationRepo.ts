// 疫苗接种数据操作
import { getDatabase } from '../index';
import type { Vaccination } from '../../types/models';

export async function getAllVaccinations(): Promise<Vaccination[]> {
  const db = await getDatabase();
  return db.getAllAsync<Vaccination>(
    'SELECT * FROM vaccinations ORDER BY vaccination_date DESC, id DESC'
  );
}

export async function getVaccination(id: number): Promise<Vaccination | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Vaccination>(
    'SELECT * FROM vaccinations WHERE id = ?', [id]
  );
}

export async function createVaccination(v: Omit<Vaccination, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
  const db = await getDatabase();
  const r = await db.runAsync(
    `INSERT INTO vaccinations (vaccine_type, vaccine_name, dose_number, vaccination_date, next_due_date, batch_number, high_dose, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [v.vaccine_type, v.vaccine_name, v.dose_number, v.vaccination_date,
     v.next_due_date ?? null, v.batch_number ?? null, v.high_dose ?? 0, v.notes ?? null]
  );
  return r.lastInsertRowId;
}

export async function deleteVaccination(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM vaccinations WHERE id = ?', [id]);
}
