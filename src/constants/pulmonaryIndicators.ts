// 肺功能指标键值对照表
// 每个指标对应 pulmonary_function_detail 中的一行

export interface IndicatorDef {
  level: 1 | 2 | 3 | 4;
  label: string;
  name: string;
  unit: string;
  hasBronchodilator: boolean;  // 是否有支气管舒张试验（用药前/后）
}

export const PULMONARY_INDICATORS: Record<string, IndicatorDef> = {
  // ===== 一级：通气分型核心指标 =====
  fvc:               { level: 1, label: 'FVC',        name: '用力肺活量',                   unit: 'L',      hasBronchodilator: true },
  fev1:              { level: 1, label: 'FEV₁',       name: '第1秒用力呼气容积',             unit: 'L',      hasBronchodilator: true },
  fev1_fvc_ratio:    { level: 1, label: 'FEV₁/FVC',   name: '一秒率',                        unit: '%',      hasBronchodilator: false },
  fev1_predicted_pct:{ level: 1, label: 'FEV₁%pred',  name: 'FEV₁实测/预计值百分比',         unit: '%',      hasBronchodilator: false },
  // ===== 二级：小气道功能指标 =====
  pef:               { level: 2, label: 'PEF',        name: '呼气峰值流量',                  unit: 'L/s',    hasBronchodilator: true },
  mef75:             { level: 2, label: 'MEF75',      name: '呼出75%肺活量瞬间呼气流量',     unit: 'L/s',    hasBronchodilator: false },
  mef50:             { level: 2, label: 'MEF50',      name: '呼出50%肺活量瞬间呼气流量',     unit: 'L/s',    hasBronchodilator: false },
  mef25:             { level: 2, label: 'MEF25',      name: '呼出25%肺活量瞬间呼气流量',     unit: 'L/s',    hasBronchodilator: false },
  mmef:              { level: 2, label: 'MMEF',       name: '最大中期呼气流量(FEF25-75)',    unit: 'L/s',    hasBronchodilator: false },
  // ===== 三级：肺容积指标 =====
  tlc:               { level: 3, label: 'TLC',        name: '肺总量',                        unit: 'L',      hasBronchodilator: true },
  rv:                { level: 3, label: 'RV',         name: '残气量',                        unit: 'L',      hasBronchodilator: true },
  rv_tlc_ratio:      { level: 3, label: 'RV/TLC%',    name: '残总比值',                      unit: '%',      hasBronchodilator: false },
  ic:                { level: 3, label: 'IC',         name: '深吸气量',                      unit: 'L',      hasBronchodilator: true },
  erv:               { level: 3, label: 'ERV',        name: '补呼气量',                      unit: 'L',      hasBronchodilator: false },
  // ===== 四级：分钟通气与通气效率指标 =====
  ve:                { level: 4, label: 'VE',         name: '每分钟静息通气量',              unit: 'L/min',  hasBronchodilator: false },
  vt:                { level: 4, label: 'VT',         name: '潮气量',                        unit: 'L',      hasBronchodilator: false },
  rr:                { level: 4, label: 'RR',         name: '呼吸频率',                      unit: '次/分',  hasBronchodilator: false },
  mvv:               { level: 4, label: 'MVV',        name: '最大分钟通气量(通气储备)',      unit: 'L/min',  hasBronchodilator: false },
  raw:               { level: 4, label: 'Raw',        name: '气道阻力',                      unit: 'cmH₂O/(L/s)', hasBronchodilator: false },
  dlco:              { level: 4, label: 'DLCO',       name: '一氧化碳弥散量(换气效率)',      unit: 'mL/(min·mmHg)', hasBronchodilator: false },
};

// 按级别分组的指标列表
export const PULMONARY_LEVELS = [
  {
    level: 1 as const,
    title: '一级：通气分型核心指标',
    subtitle: '确诊阻塞/限制、功能分级',
    keys: ['fvc', 'fev1', 'fev1_fvc_ratio', 'fev1_predicted_pct'] as const,
  },
  {
    level: 2 as const,
    title: '二级：小气道功能指标',
    subtitle: '筛查早期小气道损伤',
    keys: ['pef', 'mef75', 'mef50', 'mef25', 'mmef'] as const,
  },
  {
    level: 3 as const,
    title: '三级：肺容积指标',
    subtitle: '判断肺气肿、限制性胸腔/肺实质病变',
    keys: ['tlc', 'rv', 'rv_tlc_ratio', 'ic', 'erv'] as const,
  },
  {
    level: 4 as const,
    title: '四级：分钟通气与通气效率指标',
    subtitle: '评估通气代偿、换气效率',
    keys: ['ve', 'vt', 'rr', 'mvv', 'raw', 'dlco'] as const,
  },
];
