// OCR 识别服务 — 肺功能报告专项
// 拍照 → ML Kit 提取文本 → 正则匹配 20 指标 × 6 子字段

import { PULMONARY_INDICATORS } from '../constants/pulmonaryIndicators';
import type { IndicatorKey } from '../types/models';

// ==================== 类型 ====================

// 单个指标识别结果
export interface OcrIndicatorResult {
  indicatorKey: string;
  label: string;
  name: string;
  unit: string;
  predicted_value: string;       // 识别到的预计值
  pre_actual: string;             // 识别到的用药前实测
  pre_pct_predicted: string;      // 自动计算的占预计%
  post_actual: string;            // 识别到的用药后实测
  post_pct_predicted: string;     // 自动计算的占预计%
  improvement_rate: string;       // 自动计算的改善率
  confidence: 'high' | 'medium' | 'low' | 'none';  // 匹配置信度
}

// 完整 OCR 结果
export interface OcrResult {
  rawText: string;                   // 原始识别文本（调试用）
  indicators: OcrIndicatorResult[];  // 各指标识别结果
  photoUri: string;                  // 原图路径
}

// ==================== 正则匹配规则 ====================

// 肺功能报告中的关键词匹配（中英文混合）
// 每条规则：关键词正则 + 值提取正则
interface OcrPattern {
  key: IndicatorKey;
  // 匹配"指标名称"行的正则
  namePatterns: RegExp[];
  // 从文本中提取"预计值/用药前/用药后/改善率"的数值正则
  valuePatterns: {
    predicted?: RegExp[];
    preActual?: RegExp[];
    postActual?: RegExp[];
    improvement?: RegExp[];
  };
}

const OCR_PATTERNS: OcrPattern[] = [
  // ===== 一级：通气分型核心 =====
  {
    key: 'fvc',
    namePatterns: [/FVC/i, /用力肺活量/i],
    valuePatterns: {
      predicted: [/预计[值]?[：:=\s]*([\d.]+)/i, /Pred[：:=\s]*([\d.]+)/i],
      preActual: [/用药前[：:=\s]*([\d.]+)/i, /Pre[-\s]?[：:=\s]*([\d.]+)/i, /舒张前[：:=\s]*([\d.]+)/i, /基础[：:=\s]*([\d.]+)/i],
      postActual: [/用药后[：:=\s]*([\d.]+)/i, /Post[-\s]?[：:=\s]*([\d.]+)/i, /舒张后[：:=\s]*([\d.]+)/i],
      improvement: [/改善率?[：:=\s]*\+?([\d.]+)\s*%/i, /Δ[：:=\s]*\+?([\d.]+)/i, /变化率?[：:=\s]*\+?([\d.]+)/i],
    },
  },
  {
    key: 'fev1',
    namePatterns: [/FEV[\s₁1]+/i, /第[一1]秒[用呼]?[气力]?[容量]/i, /一秒量/i],
    valuePatterns: {
      predicted: [/预计[值]?[：:=\s]*([\d.]+)/i, /Pred[：:=\s]*([\d.]+)/i],
      preActual: [/用药前[：:=\s]*([\d.]+)/i, /Pre[-\s]?[：:=\s]*([\d.]+)/i, /舒张前[：:=\s]*([\d.]+)/i],
      postActual: [/用药后[：:=\s]*([\d.]+)/i, /Post[-\s]?[：:=\s]*([\d.]+)/i, /舒张后[：:=\s]*([\d.]+)/i],
      improvement: [/改善率?[：:=\s]*\+?([\d.]+)\s*%/i, /Δ[：:=\s]*\+?([\d.]+)/i],
    },
  },
  {
    key: 'fev1_fvc_ratio',
    namePatterns: [/FEV[\s₁1]+\s*\/\s*FVC/i, /一秒率/i, /FEV1\/FVC/i],
    valuePatterns: {
      preActual: [/(?:FEV[\s₁1]+\s*\/\s*FVC|一秒率)[：:=\s]*([\d.]+)\s*%/i, /FEV1?\/?FVC[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'fev1_predicted_pct',
    namePatterns: [/FEV[\s₁1]+\s*%\s*(?:pred|预计值)/i, /FEV[\s₁1]+[/\s]预计[值]?[%％]/i, /FEV1\s*%\s*Pred/i],
    valuePatterns: {
      preActual: [/FEV[\s₁1]+\s*%[：:=\s]*([\d.]+)/i, /占?预计[值]?[%％][：:=\s]*([\d.]+)/i],
    },
  },
  // ===== 二级：小气道功能 =====
  {
    key: 'pef',
    namePatterns: [/PEF/i, /呼气峰值[流速]?/i, /峰流速/i],
    valuePatterns: {
      predicted: [/预计[：:=\s]*([\d.]+)/i],
      preActual: [/用药前[：:=\s]*([\d.]+)/i, /PEF[：:=\s]*([\d.]+)/i, /实测[：:=\s]*([\d.]+)/i],
      postActual: [/用药后[：:=\s]*([\d.]+)/i],
      improvement: [/改善率?[：:=\s]*\+?([\d.]+)\s*%/i],
    },
  },
  {
    key: 'mef75',
    namePatterns: [/MEF\s*75/i, /MEF75/i],
    valuePatterns: {
      preActual: [/MEF\s*75[：:=\s]*([\d.]+)/i],
      predicted: [/预计[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'mef50',
    namePatterns: [/MEF\s*50/i, /MEF50/i],
    valuePatterns: {
      preActual: [/MEF\s*50[：:=\s]*([\d.]+)/i],
      predicted: [/预计[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'mef25',
    namePatterns: [/MEF\s*25/i, /MEF25/i],
    valuePatterns: {
      preActual: [/MEF\s*25[：:=\s]*([\d.]+)/i],
      predicted: [/预计[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'mmef',
    namePatterns: [/MMEF/i, /FEF\s*25\s*[-–]\s*75/i, /最大中期[呼气]?流量/i, /MMF/i],
    valuePatterns: {
      preActual: [/MMEF[：:=\s]*([\d.]+)/i, /FEF\s*25\s*[-–]\s*75[：:=\s]*([\d.]+)/i],
      predicted: [/预计[：:=\s]*([\d.]+)/i],
    },
  },
  // ===== 三级：肺容积 =====
  {
    key: 'tlc',
    namePatterns: [/TLC/i, /肺总量/i],
    valuePatterns: {
      predicted: [/预计[：:=\s]*([\d.]+)/i],
      preActual: [/TLC[：:=\s]*([\d.]+)/i, /肺总量[：:=\s]*([\d.]+)/i],
      postActual: [/用药后[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'rv',
    namePatterns: [/\bRV\b/i, /残气量/i],
    valuePatterns: {
      predicted: [/预计[：:=\s]*([\d.]+)/i],
      preActual: [/RV[：:=\s]*([\d.]+)/i, /残气量[：:=\s]*([\d.]+)/i],
      postActual: [/用药后[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'rv_tlc_ratio',
    namePatterns: [/RV\s*\/\s*TLC/i, /残总比/i, /RV\/TLC/i],
    valuePatterns: {
      preActual: [/RV\s*\/\s*TLC[：:=\s]*([\d.]+)\s*%/i, /残总比[：:=\s]*([\d.]+)\s*%/i],
    },
  },
  {
    key: 'ic',
    namePatterns: [/\bIC\b/i, /深吸气量/i],
    valuePatterns: {
      predicted: [/预计[：:=\s]*([\d.]+)/i],
      preActual: [/IC[：:=\s]*([\d.]+)/i, /深吸气量[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'erv',
    namePatterns: [/ERV/i, /补呼气量/i],
    valuePatterns: {
      preActual: [/ERV[：:=\s]*([\d.]+)/i, /补呼气量[：:=\s]*([\d.]+)/i],
    },
  },
  // ===== 四级：通气与换气效率 =====
  {
    key: 've',
    namePatterns: [/\bVE\b/i, /分钟[静]?通气量/i, /静息通气量/i],
    valuePatterns: {
      preActual: [/VE[：:=\s]*([\d.]+)/i, /通气量[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'vt',
    namePatterns: [/\bVT\b/i, /潮气量/i],
    valuePatterns: {
      preActual: [/VT[：:=\s]*([\d.]+)/i, /潮气量[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'rr',
    namePatterns: [/\bRR\b/i, /呼吸频率/i, /呼吸[频次]/i],
    valuePatterns: {
      preActual: [/RR[：:=\s]*(\d+)/i, /呼吸频率[：:=\s]*(\d+)/i],
    },
  },
  {
    key: 'mvv',
    namePatterns: [/MVV/i, /最大[自随]?通气量/i, /最大分钟通气量/i],
    valuePatterns: {
      preActual: [/MVV[：:=\s]*([\d.]+)/i, /最大[自随]?通气量[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'raw',
    namePatterns: [/Raw/i, /气道阻力/i, /气道阻[力抗]/i],
    valuePatterns: {
      preActual: [/Raw[：:=\s]*([\d.]+)/i, /气道阻力[：:=\s]*([\d.]+)/i],
    },
  },
  {
    key: 'dlco',
    namePatterns: [/DLCO/i, /D[Ll][Cc][Oo]/i, /弥散[量]/i, /一氧化碳弥散/i, /CO弥散/i],
    valuePatterns: {
      predicted: [/预计[：:=\s]*([\d.]+)/i],
      preActual: [/DLCO[：:=\s]*([\d.]+)/i, /弥散量[：:=\s]*([\d.]+)/i, /DLCO.*?实测[：:=\s]*([\d.]+)/i],
      postActual: [/用药后[：:=\s]*([\d.]+)/i],
      improvement: [/改善率?[：:=\s]*\+?([\d.]+)\s*%/i],
    },
  },
];

// ==================== 识别处理 ====================

/**
 * 从报告文本行中识别肺功能指标
 * 支持两种报告格式：
 *   行模式（每个指标一行，后面跟数值）
 *   列模式（表头：预计值 | 用药前 | 用药后 | 改善率，每行一个指标）
 */
export function parsePulmonaryReport(rawText: string): OcrIndicatorResult[] {
  const lines = rawText.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);

  // 判断报告格式：列模式（包含"预计值"或"用药前"等列标题的行）
  const isColumnFormat = lines.some(
    (line) => /预计值|Predicted|用药前|Pre[-\s]?Bronch|基础|Baseline/i.test(line)
  );

  if (isColumnFormat) {
    return parseColumnFormat(lines);
  }

  return parseRowFormat(lines);
}

// 行模式解析
function parseRowFormat(lines: string[]): OcrIndicatorResult[] {
  const results: OcrIndicatorResult[] = [];

  for (const pattern of OCR_PATTERNS) {
    const def = PULMONARY_INDICATORS[pattern.key];
    if (!def) continue;

    // 找包含该指标名称的行
    const matchedLine = findLineForIndicator(lines, pattern);

    const result: OcrIndicatorResult = {
      indicatorKey: pattern.key,
      label: def.label,
      name: def.name,
      unit: def.unit,
      predicted_value: '',
      pre_actual: '',
      pre_pct_predicted: '',
      post_actual: '',
      post_pct_predicted: '',
      improvement_rate: '',
      confidence: 'none',
    };

    if (!matchedLine) {
      results.push(result);
      continue;
    }

    // 提取各子字段值
    const predicted = extractValue(matchedLine, pattern.valuePatterns.predicted ?? []);
    const preActual = extractValue(matchedLine, pattern.valuePatterns.preActual ?? []);
    const postActual = extractValue(matchedLine, pattern.valuePatterns.postActual ?? []);
    const improvement = extractValue(matchedLine, pattern.valuePatterns.improvement ?? []);

    result.predicted_value = predicted;
    result.pre_actual = preActual;
    result.post_actual = postActual;
    result.improvement_rate = improvement;

    // 自动计算百分比
    const predictedNum = parseFloat(predicted);
    const preNum = parseFloat(preActual);
    const postNum = parseFloat(postActual);

    if (predictedNum > 0 && preNum > 0) {
      result.pre_pct_predicted = ((preNum / predictedNum) * 100).toFixed(1);
    }
    if (predictedNum > 0 && postNum > 0) {
      result.post_pct_predicted = ((postNum / predictedNum) * 100).toFixed(1);
    }
    if (!result.improvement_rate && preNum > 0 && postNum > 0) {
      result.improvement_rate = (((postNum - preNum) / preNum) * 100).toFixed(1);
    }

    // 置信度评估
    const hasValues = [predicted, preActual, postActual].filter(Boolean).length;
    if (hasValues >= 3) result.confidence = 'high';
    else if (hasValues >= 1) result.confidence = 'medium';
    else result.confidence = 'low';

    results.push(result);
  }

  return results;
}

// 列模式解析（表格式报告）
function parseColumnFormat(lines: string[]): OcrIndicatorResult[] {
  // 找到列标题行，确定各列位置
  // 列模式更复杂，先占位——实际使用时按行模式回退
  return parseRowFormat(lines);
}

// 在文本行中查找匹配某指标的行
function findLineForIndicator(lines: string[], pattern: OcrPattern): string | null {
  for (const line of lines) {
    for (const nameRegex of pattern.namePatterns) {
      if (nameRegex.test(line)) {
        return line;
      }
    }
  }
  return null;
}

// 用正则从文本中提取第一个匹配的数值
function extractValue(text: string, patterns: RegExp[]): string {
  for (const regex of patterns) {
    const match = text.match(regex);
    if (match?.[1]) {
      return match[1];
    }
  }
  return '';
}

// ==================== 对外接口 ====================

/**
 * 实际调用 ML Kit OCR 的封装（运行时依赖 react-native-mlkit-ocr）
 *
 * 注意：当前版本 ML Kit OCR 尚未集成。
 * 拍照功能用于留存报告照片作为患者资料，文本识别请使用"粘贴报告文本"功能。
 *
 * 实际集成时：
 * import TextRecognition from '@react-native-mlkit-ocr';
 * const result = await TextRecognition.recognize(photoUri);
 * return parsePulmonaryReport(result.text);
 */
export async function recognizePulmonaryReport(photoUri: string): Promise<OcrResult> {
  // TODO: Phase 8 实际集成 ML Kit
  // const mlkitResult = await TextRecognition.recognize(photoUri);
  // const indicators = parsePulmonaryReport(mlkitResult.text);
  // return { rawText: mlkitResult.text, indicators, photoUri };

  // 优雅降级：返回空识别结果，提示用户使用文本粘贴功能
  console.log(`[OCR] 照片已保存: ${photoUri}。OCR 引擎尚未集成，请使用文本粘贴功能。`);
  return {
    rawText: '',
    indicators: [],
    photoUri,
  };
}

/** 检查 OCR 相机识别功能是否可用 */
export function isOcrCameraAvailable(): boolean {
  // TODO: Phase 8 集成 ML Kit 后改为 true
  return false;
}

/** 检查 OCR 文本解析功能是否可用（始终可用——基于正则的纯文本解析） */
export function isOcrTextParseAvailable(): boolean {
  return true;
}

/**
 * 纯文本解析接口（不依赖 ML Kit，可用于调试或手动粘贴报告文本）
 */
export function parseFromText(rawText: string): OcrResult {
  const indicators = parsePulmonaryReport(rawText);
  return { rawText, indicators, photoUri: '' };
}

// ==================== 通用报告解析（非肺功能） ====================

/** 通用字段识别：匹配 "指标名：数值 单位" 格式的行 */
export interface GenericOcrField {
  key: string;
  label: string;
  value: string;
  unit: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

const FIELD_PATTERNS: { label: string; patterns: RegExp[] }[] = [
  { label: 'FeNO', patterns: [/FeNO[：:=\s]*(\d+\.?\d*)\s*(ppb)?/i] },
  { label: '血EOS', patterns: [/血?嗜酸[性]?粒?细胞[：:=\s]*(\d+\.?\d*)\s*%?/i, /EOS[：:=\s]*(\d+\.?\d*)\s*%?/i] },
  { label: '痰EOS', patterns: [/痰?嗜酸[：:=\s]*(\d+\.?\d*)\s*%?/i] },
  { label: '痰NEUT', patterns: [/痰?中性[：:=\s]*(\d+\.?\d*)\s*%?/i, /NEUT[：:=\s]*(\d+\.?\d*)\s*%?/i] },
  { label: 'PAP', patterns: [/肺动脉压[：:=\s]*(\d+\.?\d*)/i, /PAP[：:=\s]*(\d+\.?\d*)/i] },
  { label: 'T值', patterns: [/T[值分][：:=\s]*(-?\d+\.?\d*)/i, /骨密度[：:=\s]*(-?\d+\.?\d*)/i] },
  { label: 'FBG', patterns: [/空腹血糖[：:=\s]*(\d+\.?\d*)/i, /FBG[：:=\s]*(\d+\.?\d*)/i, /GLU[：:=\s]*(\d+\.?\d*)/i] },
  { label: 'HbA1c', patterns: [/糖化[血红]?[蛋白]?[：:=\s]*(\d+\.?\d*)\s*%?/i, /HbA1c[：:=\s]*(\d+\.?\d*)\s*%?/i] },
  { label: 'TC', patterns: [/总胆固醇[：:=\s]*(\d+\.?\d*)/i, /TC[：:=\s]*(\d+\.?\d*)/i, /CHOL[：:=\s]*(\d+\.?\d*)/i] },
  { label: 'TG', patterns: [/甘油三酯[：:=\s]*(\d+\.?\d*)/i, /TG[：:=\s]*(\d+\.?\d*)/i] },
  { label: 'HDL', patterns: [/高密度[脂]?[蛋白]?[：:=\s]*(\d+\.?\d*)/i, /HDL[：:=\s]*(\d+\.?\d*)/i] },
  { label: 'LDL', patterns: [/低密度[脂]?[蛋白]?[：:=\s]*(\d+\.?\d*)/i, /LDL[：:=\s]*(\d+\.?\d*)/i] },
];

export function parseGenericReport(rawText: string): GenericOcrField[] {
  const results: GenericOcrField[] = [];
  for (const fp of FIELD_PATTERNS) {
    let found = false;
    for (const regex of fp.patterns) {
      const match = rawText.match(regex);
      if (match?.[1]) {
        results.push({
          key: fp.label,
          label: fp.label,
          value: match[1],
          unit: match[2] ?? '',
          confidence: 'high',
        });
        found = true;
        break;
      }
    }
    if (!found) {
      results.push({
        key: fp.label,
        label: fp.label,
        value: '',
        unit: '',
        confidence: 'none',
      });
    }
  }
  return results;
}
