// ============================================================
// 视觉主题 Token — 纯样式常量，不含任何业务逻辑
// 风格：科技净白 · 高级极简（方案二）
// ============================================================

export const Colors = {
  // 主色
  primary: '#2E7D32',
  primaryLight: '#E8F5E9',
  primaryDark: '#1B5E20',

  // 表面色
  surface: '#FFFFFF',
  surfaceBg: '#F5F7FA',
  surfaceElevated: '#FFFFFF',

  // 文字
  textHigh: '#1A2332',
  textMed: '#64748B',
  textLow: '#94A3B8',
  textWhite: '#FFFFFF',

  // 线/分割
  divider: '#E8ECF0',
  border: '#E2E8F0',

  // 状态
  success: '#2E7D32',
  successBg: '#E8F5E9',
  warning: '#F57F17',
  warningBg: '#FFF3E0',
  error: '#C62828',
  errorBg: '#FFEBEE',

  // 特殊
  glassBg: 'rgba(255,255,255,0.75)',
  glassBorder: 'rgba(255,255,255,0.3)',
  shadow: 'rgba(0,0,0,0.04)',
  shadowStrong: 'rgba(0,0,0,0.08)',

  // 数据卡片
  autoCalcBg: '#F8FAFC',
  inputBg: '#F1F5F9',
  dashedBorder: '#CBD5E1',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 12,
  xl: 16,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
};

export const FontSize = {
  h1: 24,
  h2: 18,
  body: 16,
  caption: 13,
  tiny: 12,
  metric: 22,
  metricSmall: 18,
};
