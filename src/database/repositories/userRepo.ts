// 用户档案数据操作
import { getDatabase } from '../index';
import type { User } from '../../types/models';

export async function getUser(): Promise<User | null> {
  const db = await getDatabase();
  return db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
}

export async function createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO users (nickname, birth_date, gender, height_cm, weight_kg, diagnosis_date, gold_stage)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [user.nickname, user.birth_date, user.gender, user.height_cm, user.weight_kg,
     user.diagnosis_date ?? null, user.gold_stage ?? null]
  );
}

export async function updateUser(user: User): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE users SET nickname=?, birth_date=?, gender=?, height_cm=?, weight_kg=?,
     diagnosis_date=?, gold_stage=?, updated_at=datetime('now','localtime')
     WHERE id=?`,
    [user.nickname, user.birth_date, user.gender, user.height_cm, user.weight_kg,
     user.diagnosis_date ?? null, user.gold_stage ?? null, user.id]
  );
}
