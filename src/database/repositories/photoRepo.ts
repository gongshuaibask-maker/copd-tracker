// 模块照片数据操作（通用 — 任何模块的记录均可关联照片）
import { getDatabase } from '../index';

export interface ModulePhoto {
  id: number;
  module_name: string;
  record_id: number;
  photo_uri: string;
  notes: string | null;
  created_at: string;
}

/** 获取某模块某记录的所有照片 */
export async function getPhotos(moduleName: string, recordId: number): Promise<ModulePhoto[]> {
  const db = await getDatabase();
  return db.getAllAsync<ModulePhoto>(
    'SELECT * FROM module_photos WHERE module_name = ? AND record_id = ? ORDER BY created_at ASC',
    [moduleName, recordId]
  );
}

/** 获取某模块某日期的所有照片（按日期查找） */
export async function getPhotosByDate(moduleName: string, recordDate: string): Promise<ModulePhoto[]> {
  const db = await getDatabase();
  return db.getAllAsync<ModulePhoto>(
    `SELECT mp.* FROM module_photos mp
     INNER JOIN pulmonary_function pf ON mp.record_id = pf.id
     WHERE mp.module_name = ? AND pf.record_date = ?
     UNION
     SELECT mp.* FROM module_photos mp
     INNER JOIN airway_inflammation ai ON mp.record_id = ai.id
     WHERE mp.module_name = ? AND ai.record_date = ?
     UNION
     SELECT mp.* FROM module_photos mp
     INNER JOIN comorbidity c ON mp.record_id = c.id
     WHERE mp.module_name = ? AND c.record_date = ?
     ORDER BY created_at ASC`,
    [moduleName, recordDate, moduleName, recordDate, moduleName, recordDate]
  );
}

/** 添加照片 */
export async function addPhoto(moduleName: string, recordId: number, photoUri: string, notes?: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    "INSERT INTO module_photos (module_name, record_id, photo_uri, notes) VALUES (?, ?, ?, ?)",
    [moduleName, recordId, photoUri, notes || null]
  );
  return result.lastInsertRowId;
}

/** 删除照片 */
export async function deletePhoto(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM module_photos WHERE id = ?', [id]);
}

/** 获取某模块的全部照片（用于列表页查看） */
export async function getAllPhotosByModule(moduleName: string): Promise<ModulePhoto[]> {
  const db = await getDatabase();
  return db.getAllAsync<ModulePhoto>(
    'SELECT * FROM module_photos WHERE module_name = ? ORDER BY created_at DESC',
    [moduleName]
  );
}
