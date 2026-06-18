// 营养体重（体重、BMI、白蛋白）数据操作
import { getDatabase } from '../index';
import type { NutritionWeight } from '../../types/models';

export async function getAllNutritionRecords(): Promise<NutritionWeight[]> {
  const db = await getDatabase();
  return db.getAllAsync<NutritionWeight>(
    'SELECT * FROM nutrition_weight ORDER BY record_date DESC, id DESC'
  );
}

export async function getNutritionRecord(id: number): Promise<NutritionWeight | null> {
  const db = await getDatabase();
  return db.getFirstAsync<NutritionWeight>(
    'SELECT * FROM nutrition_weight WHERE id = ?', [id]
  );
}

export async function getLatestNutrition(): Promise<NutritionWeight | null> {
  const db = await getDatabase();
  return db.getFirstAsync<NutritionWeight>(
    'SELECT * FROM nutrition_weight ORDER BY record_date DESC, id DESC LIMIT 1'
  );
}

export async function createNutritionRecord(
  recordDate: string,
  weightKg: number | null,
  bmi: number | null,
  albumin: number | null,
  notes: string | null,
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO nutrition_weight (record_date, weight_kg, bmi, albumin, notes)
     VALUES (?, ?, ?, ?, ?)`,
    [recordDate, weightKg ?? null, bmi ?? null, albumin ?? null, notes ?? null]
  );
  return result.lastInsertRowId;
}

export async function updateNutritionRecord(
  id: number,
  recordDate: string,
  weightKg: number | null,
  bmi: number | null,
  albumin: number | null,
  notes: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE nutrition_weight SET record_date=?, weight_kg=?, bmi=?, albumin=?,
     notes=?, updated_at=datetime('now','localtime') WHERE id=?`,
    [recordDate, weightKg ?? null, bmi ?? null, albumin ?? null, notes ?? null, id]
  );
}

export async function deleteNutritionRecord(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM nutrition_weight WHERE id = ?', [id]);
}
