// 数据库初始化模块
import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('copd_tracker.db');

  // 启用外键约束
  await db.execAsync('PRAGMA foreign_keys = ON');

  // 逐条执行建表语句
  for (const sql of CREATE_TABLES_SQL) {
    await db.execAsync(sql);
  }

  // 数据库迁移：为已存在的表添加新字段
  try {
    await db.execAsync('ALTER TABLE symptom_scores ADD COLUMN exacerbation_count INTEGER DEFAULT 0');
  } catch { /* 字段已存在则忽略 */ }
  try {
    await db.execAsync('ALTER TABLE symptom_scores ADD COLUMN exacerbation_hospitalized INTEGER DEFAULT 0');
  } catch { /* 字段已存在则忽略 */ }
  try {
    await db.execAsync('ALTER TABLE pulmonary_function ADD COLUMN conclusion TEXT');
  } catch { /* 字段已存在则忽略 */ }
  try {
    await db.execAsync('CREATE TABLE IF NOT EXISTS medication_usage (id INTEGER PRIMARY KEY AUTOINCREMENT, drug_name TEXT NOT NULL, usage_method TEXT, status TEXT NOT NULL CHECK(status IN (\'using\',\'long_term\',\'intermittent\',\'stopped\',\'switched\',\'combined\')), record_date TEXT NOT NULL, notes TEXT, created_at TEXT NOT NULL DEFAULT (datetime(\'now\',\'localtime\')), updated_at TEXT NOT NULL DEFAULT (datetime(\'now\',\'localtime\')))');
  } catch { /* 表已存在则忽略 */ }

  return db;
}

// 检查数据库是否已初始化（users 表存在且无数据 → 需要注册）
export async function needsRegistration(): Promise<boolean> {
  const database = await getDatabase();
  try {
    const result = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM users'
    );
    return (result?.count ?? 0) === 0;
  } catch {
    return true;
  }
}

// 关闭数据库
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
