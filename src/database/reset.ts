// 重置数据库 — 清空所有数据保留表结构
import { getDatabase } from './index';

export async function resetAllData(): Promise<void> {
  const db = await getDatabase();
  const tables = [
    'pulmonary_function_detail', 'pulmonary_function',
    'airway_inflammation', 'symptom_scores', 'exercise_test',
    'daily_vitals', 'nutrition_weight', 'exacerbation_log',
    'medication_log', 'comorbidity', 'smoking_cessation',
    'sleep_monitoring', 'pulmonary_rehab', 'vaccinations',
    'action_plan', 'app_settings', 'users',
  ];
  for (const t of tables) {
    await db.execAsync(`DELETE FROM ${t}`);
  }
  await db.execAsync("DELETE FROM sqlite_sequence");
}
