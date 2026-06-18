// 数据库表结构定义 — 全部建表 SQL

export const CREATE_TABLES_SQL = [
  // 1. 个人档案
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nickname TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
    height_cm REAL NOT NULL,
    weight_kg REAL NOT NULL,
    diagnosis_date TEXT,
    gold_stage INTEGER CHECK(gold_stage BETWEEN 1 AND 4),
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 2. 肺功能 — 主表
  `CREATE TABLE IF NOT EXISTS pulmonary_function (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    photo_uri TEXT,
    conclusion TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 3. 肺功能 — 子表（每条 = 一个指标的 6 子字段）
  `CREATE TABLE IF NOT EXISTS pulmonary_function_detail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL,
    indicator_key TEXT NOT NULL,
    indicator_level INTEGER NOT NULL,
    predicted_value REAL,
    pre_actual REAL,
    pre_pct_predicted REAL,
    post_actual REAL,
    post_pct_predicted REAL,
    improvement_rate REAL,
    FOREIGN KEY (record_id) REFERENCES pulmonary_function(id) ON DELETE CASCADE,
    UNIQUE(record_id, indicator_key)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_pf_detail_record ON pulmonary_function_detail(record_id)`,
  `CREATE INDEX IF NOT EXISTS idx_pf_detail_indicator ON pulmonary_function_detail(indicator_key)`,

  // 4. 气道炎症
  `CREATE TABLE IF NOT EXISTS airway_inflammation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    feno_ppb REAL,
    blood_eos REAL,
    sputum_eos_pct REAL,
    sputum_neut_pct REAL,
    photo_uri TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 5. 症状评分（含 GOLD 分组所需数据）
  `CREATE TABLE IF NOT EXISTS symptom_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    cat_total INTEGER NOT NULL CHECK(cat_total BETWEEN 0 AND 40),
    cat_q1_cough INTEGER CHECK(cat_q1_cough BETWEEN 0 AND 5),
    cat_q2_phlegm INTEGER CHECK(cat_q2_phlegm BETWEEN 0 AND 5),
    cat_q3_chest_tight INTEGER CHECK(cat_q3_chest_tight BETWEEN 0 AND 5),
    cat_q4_breathless INTEGER CHECK(cat_q4_breathless BETWEEN 0 AND 5),
    cat_q5_home_activity INTEGER CHECK(cat_q5_home_activity BETWEEN 0 AND 5),
    cat_q6_going_out INTEGER CHECK(cat_q6_going_out BETWEEN 0 AND 5),
    cat_q7_sleep INTEGER CHECK(cat_q7_sleep BETWEEN 0 AND 5),
    cat_q8_energy INTEGER CHECK(cat_q8_energy BETWEEN 0 AND 5),
    mmrc_grade INTEGER CHECK(mmrc_grade BETWEEN 0 AND 4),
    exacerbation_count INTEGER DEFAULT 0,
    exacerbation_hospitalized INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 6. 运动耐力
  `CREATE TABLE IF NOT EXISTS exercise_test (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    distance_m REAL,
    pre_spo2 REAL,
    post_spo2 REAL,
    pre_hr INTEGER,
    post_hr INTEGER,
    borg_score INTEGER CHECK(borg_score BETWEEN 0 AND 10),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 7. 日常生命体征
  `CREATE TABLE IF NOT EXISTS daily_vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    spo2 REAL,
    respiratory_rate INTEGER,
    heart_rate INTEGER,
    measurement_time TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,


  // 8. 营养体重
  `CREATE TABLE IF NOT EXISTS nutrition_weight (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    weight_kg REAL,
    bmi REAL,
    albumin REAL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 9. 急性加重
  `CREATE TABLE IF NOT EXISTS exacerbation_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    symptoms_increased_breathless INTEGER CHECK(symptoms_increased_breathless BETWEEN 1 AND 5),
    sputum_volume_increased INTEGER CHECK(sputum_volume_increased BETWEEN 1 AND 5),
    sputum_purulent INTEGER NOT NULL DEFAULT 1,
    used_antibiotics INTEGER NOT NULL DEFAULT 0,
    used_oral_steroids INTEGER NOT NULL DEFAULT 0,
    hospitalized INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 10. 用药记录
  `CREATE TABLE IF NOT EXISTS medication_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    rescue_inhaler_times INTEGER DEFAULT 0,
    inhaler_technique_score INTEGER CHECK(inhaler_technique_score BETWEEN 1 AND 5),
    inhaler_type TEXT,
    maintenance_meds TEXT,
    rescue_meds TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 11. 合并症
  `CREATE TABLE IF NOT EXISTS comorbidity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    pap_mmhg REAL,
    bone_density_t REAL,
    fbg REAL,
    hba1c REAL,
    tc REAL,
    tg REAL,
    hdl REAL,
    ldl REAL,
    photo_uri TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 12. 戒烟管理
  `CREATE TABLE IF NOT EXISTS smoking_cessation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    cigarettes_per_day INTEGER DEFAULT 0,
    ftnd_total INTEGER CHECK(ftnd_total BETWEEN 0 AND 10),
    ftnd_q1 INTEGER CHECK(ftnd_q1 BETWEEN 0 AND 3),
    ftnd_q2 INTEGER CHECK(ftnd_q2 BETWEEN 0 AND 1),
    ftnd_q3 INTEGER CHECK(ftnd_q3 BETWEEN 0 AND 1),
    ftnd_q4 INTEGER CHECK(ftnd_q4 BETWEEN 0 AND 3),
    ftnd_q5 INTEGER CHECK(ftnd_q5 BETWEEN 0 AND 1),
    ftnd_q6 INTEGER CHECK(ftnd_q6 BETWEEN 0 AND 1),
    quit_date TEXT,
    relapse_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 13. 睡眠监测
  `CREATE TABLE IF NOT EXISTS sleep_monitoring (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    nocturnal_min_spo2 REAL,
    nocturnal_mean_spo2 REAL,
    odi REAL,
    t90_pct REAL,
    nocturnal_mean_hr INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 14. 行动计划（绿/黄/红三区）
  `CREATE TABLE IF NOT EXISTS action_plan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    zone TEXT NOT NULL DEFAULT 'green' CHECK(zone IN ('green','yellow','red')),
    green_daily_meds TEXT,
    green_exercise TEXT,
    green_oxygen TEXT,
    yellow_symptoms TEXT,
    yellow_actions TEXT,
    yellow_meds_adjust TEXT,
    red_emergency_symptoms TEXT,
    red_actions TEXT,
    red_contact TEXT,
    doctor_name TEXT,
    doctor_phone TEXT,
    last_reviewed TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 15. 疫苗接种（GOLD 2026 更新：+ mRNA RSV + 高剂量标记）
  `CREATE TABLE IF NOT EXISTS vaccinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vaccine_type TEXT NOT NULL CHECK(vaccine_type IN ('influenza','pneumococcal','covid19','tdap','rsv','rsv_mrna','other')),
    vaccine_name TEXT NOT NULL,
    dose_number INTEGER NOT NULL DEFAULT 1,
    vaccination_date TEXT NOT NULL,
    next_due_date TEXT,
    batch_number TEXT,
    high_dose INTEGER DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 16. 肺康复训练
  `CREATE TABLE IF NOT EXISTS pulmonary_rehab (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_date TEXT NOT NULL,
    duration_min INTEGER NOT NULL,
    pursed_lip_breathing_min INTEGER,
    diaphragmatic_breathing_min INTEGER,
    upper_limb_exercise_min INTEGER,
    lower_limb_exercise_min INTEGER,
    walking_distance_m INTEGER,
    pre_spo2 REAL,
    post_spo2 REAL,
    borg_score INTEGER CHECK(borg_score BETWEEN 0 AND 10),
    completed INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  // 17. 模块照片（通用 — 每个模块的记录可关联多张照片）
  `CREATE TABLE IF NOT EXISTS module_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    photo_uri TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_module_photos_record ON module_photos(module_name, record_id)`,

  // 18. 用药记录（患者自述药物名称+用法+状态）
  `CREATE TABLE IF NOT EXISTS medication_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_name TEXT NOT NULL,
    usage_method TEXT,
    status TEXT NOT NULL CHECK(status IN ('using','long_term','intermittent','stopped','switched','combined')),
    record_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  )`,
];
