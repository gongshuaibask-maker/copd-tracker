// 运动耐力数据操作
import { getDatabase } from '../index';
import type { ExerciseTest } from '../../types/models';

export async function getAllExercise(): Promise<ExerciseTest[]> {
  const db = await getDatabase();
  return db.getAllAsync<ExerciseTest>(
    'SELECT * FROM exercise_test ORDER BY record_date DESC, id DESC'
  );
}

export async function getExercise(id: number): Promise<ExerciseTest | null> {
  const db = await getDatabase();
  return db.getFirstAsync<ExerciseTest>(
    'SELECT * FROM exercise_test WHERE id = ?', [id]
  );
}

export async function createExercise(
  recordDate: string, distanceM: number | null,
  preSpo2: number | null, postSpo2: number | null,
  preHr: number | null, postHr: number | null,
  borgScore: number | null, notes: string | null,
): Promise<number> {
  const db = await getDatabase();
  const r = await db.runAsync(
    `INSERT INTO exercise_test (record_date, distance_m, pre_spo2, post_spo2, pre_hr, post_hr, borg_score, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [recordDate, distanceM ?? null, preSpo2 ?? null, postSpo2 ?? null,
     preHr ?? null, postHr ?? null, borgScore ?? null, notes ?? null]
  );
  return r.lastInsertRowId;
}

export async function updateExercise(
  id: number, recordDate: string, distanceM: number | null,
  preSpo2: number | null, postSpo2: number | null,
  preHr: number | null, postHr: number | null,
  borgScore: number | null, notes: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE exercise_test SET record_date=?, distance_m=?, pre_spo2=?, post_spo2=?,
     pre_hr=?, post_hr=?, borg_score=?, notes=?, updated_at=datetime('now','localtime')
     WHERE id=?`,
    [recordDate, distanceM ?? null, preSpo2 ?? null, postSpo2 ?? null,
     preHr ?? null, postHr ?? null, borgScore ?? null, notes ?? null, id]
  );
}

export async function deleteExercise(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM exercise_test WHERE id = ?', [id]);
}
