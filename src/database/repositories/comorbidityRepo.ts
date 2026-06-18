// 合并症数据操作
import { getDatabase } from '../index';
import type { Comorbidity } from '../../types/models';

export async function getAllComorbidity(): Promise<Comorbidity[]> {
  const db = await getDatabase();
  return db.getAllAsync<Comorbidity>(
    'SELECT * FROM comorbidity ORDER BY record_date DESC, id DESC'
  );
}

export async function getComorbidity(id: number): Promise<Comorbidity | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Comorbidity>(
    'SELECT * FROM comorbidity WHERE id = ?', [id]
  );
}

export async function createComorbidity(
  recordDate: string, papMmhg: number | null, boneDensityT: number | null,
  fbg: number | null, hba1c: number | null, tc: number | null,
  tg: number | null, hdl: number | null, ldl: number | null,
  photoUri: string | null, notes: string | null,
): Promise<number> {
  const db = await getDatabase();
  const r = await db.runAsync(
    `INSERT INTO comorbidity (record_date, pap_mmhg, bone_density_t, fbg, hba1c, tc, tg, hdl, ldl, photo_uri, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [recordDate, papMmhg ?? null, boneDensityT ?? null, fbg ?? null, hba1c ?? null,
     tc ?? null, tg ?? null, hdl ?? null, ldl ?? null, photoUri ?? null, notes ?? null]
  );
  return r.lastInsertRowId;
}

export async function updateComorbidity(
  id: number, recordDate: string, papMmhg: number | null, boneDensityT: number | null,
  fbg: number | null, hba1c: number | null, tc: number | null,
  tg: number | null, hdl: number | null, ldl: number | null,
  photoUri: string | null, notes: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE comorbidity SET record_date=?, pap_mmhg=?, bone_density_t=?,
     fbg=?, hba1c=?, tc=?, tg=?, hdl=?, ldl=?, photo_uri=?, notes=?,
     updated_at=datetime('now','localtime') WHERE id=?`,
    [recordDate, papMmhg ?? null, boneDensityT ?? null, fbg ?? null, hba1c ?? null,
     tc ?? null, tg ?? null, hdl ?? null, ldl ?? null, photoUri ?? null, notes ?? null, id]
  );
}

export async function deleteComorbidity(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM comorbidity WHERE id = ?', [id]);
}
