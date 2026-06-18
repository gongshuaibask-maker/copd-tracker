// 行动计划数据操作
import { getDatabase } from '../index';
import type { ActionPlan } from '../../types/models';

export async function getActionPlan(): Promise<ActionPlan | null> {
  const db = await getDatabase();
  return db.getFirstAsync<ActionPlan>(
    'SELECT * FROM action_plan ORDER BY updated_at DESC LIMIT 1'
  );
}

export async function saveActionPlan(
  plan: Omit<ActionPlan, 'id' | 'created_at' | 'updated_at'>
): Promise<number> {
  const db = await getDatabase();

  // 先删除旧方案（每个患者只有一个行动计划）
  await db.runAsync('DELETE FROM action_plan');

  const r = await db.runAsync(
    `INSERT INTO action_plan (
      zone, green_daily_meds, green_exercise, green_oxygen,
      yellow_symptoms, yellow_actions, yellow_meds_adjust,
      red_emergency_symptoms, red_actions, red_contact,
      doctor_name, doctor_phone, last_reviewed, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      plan.zone,
      plan.green_daily_meds ?? null, plan.green_exercise ?? null, plan.green_oxygen ?? null,
      plan.yellow_symptoms ?? null, plan.yellow_actions ?? null, plan.yellow_meds_adjust ?? null,
      plan.red_emergency_symptoms ?? null, plan.red_actions ?? null, plan.red_contact ?? null,
      plan.doctor_name ?? null, plan.doctor_phone ?? null, plan.last_reviewed ?? null, plan.notes ?? null,
    ]
  );
  return r.lastInsertRowId;
}

export async function deleteActionPlan(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM action_plan');
}
