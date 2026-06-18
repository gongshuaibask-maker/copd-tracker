// CAT 评分量表（COPD Assessment Test）— 8 个问题
// 每题 0-5 分，总分 0-40

export interface CATQuestion {
  id: string;
  text: string;
  leftLabel: string;   // 0 分标签
  rightLabel: string;  // 5 分标签
}

export const CAT_QUESTIONS: CATQuestion[] = [
  {
    id: 'cat_q1_cough',
    text: '我从不咳嗽',
    leftLabel: '从不咳嗽',
    rightLabel: '一直咳嗽',
  },
  {
    id: 'cat_q2_phlegm',
    text: '我一点痰也没有',
    leftLabel: '无痰',
    rightLabel: '痰很多',
  },
  {
    id: 'cat_q3_chest_tight',
    text: '我没有任何胸闷的感觉',
    leftLabel: '无胸闷',
    rightLabel: '很重的胸闷',
  },
  {
    id: 'cat_q4_breathless',
    text: '当我爬坡或上一层楼时，没有气喘的感觉',
    leftLabel: '无气喘',
    rightLabel: '严重气喘',
  },
  {
    id: 'cat_q5_home_activity',
    text: '在家里做任何事情都不受慢阻肺影响',
    leftLabel: '不受影响',
    rightLabel: '严重受限',
  },
  {
    id: 'cat_q6_going_out',
    text: '尽管有肺部疾病，我仍有信心外出',
    leftLabel: '很有信心',
    rightLabel: '毫无信心',
  },
  {
    id: 'cat_q7_sleep',
    text: '我睡眠非常好',
    leftLabel: '睡眠很好',
    rightLabel: '睡眠很差',
  },
  {
    id: 'cat_q8_energy',
    text: '我精力旺盛',
    leftLabel: '精力旺盛',
    rightLabel: '毫无精力',
  },
];

// CAT 评分等级
export function getCATLevel(score: number): { level: string; color: string } {
  if (score <= 10) return { level: '轻度影响', color: '#2E7D32' };
  if (score <= 20) return { level: '中度影响', color: '#F57F17' };
  if (score <= 30) return { level: '重度影响', color: '#E65100' };
  return { level: '极重度影响', color: '#C62828' };
}

// mMRC 量表分级说明
export const MMRC_GRADES = [
  { grade: 0, description: '仅剧烈活动时出现呼吸困难' },
  { grade: 1, description: '快走或上缓坡时出现气短' },
  { grade: 2, description: '因呼吸困难比同龄人走得慢，或以自己步速行走时需停下呼吸' },
  { grade: 3, description: '步行约100米或数分钟后需停下呼吸' },
  { grade: 4, description: '呼吸困难以致不能离家，或穿衣/脱衣时出现气短' },
];
