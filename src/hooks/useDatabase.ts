// 数据库 Hook — 获取数据库实例
import { useState, useEffect } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';
import { getDatabase } from '../database';

export function useDatabase() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getDatabase().then(setDb).catch(setError);
  }, []);

  return { db, error, isReady: db !== null };
}
