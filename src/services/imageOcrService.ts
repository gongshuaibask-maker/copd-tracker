// 图片 OCR 识别服务 — 拍照 → ML Kit 文字提取 → 解析指标
// 依赖 react-native-mlkit-ocr（需要 EAS Build，Expo Go 中不可用）
// 回退方案：当 ML Kit 不可用时，提示用户手动粘贴文本

import { Platform } from 'react-native';
import { parseFromText } from './ocrService';
import type { OcrIndicatorResult } from './ocrService';

let MLKitModule: any = null;

// 动态加载 ML Kit（防止 web 端报错）
async function getMLKit() {
  if (MLKitModule) return MLKitModule;
  try {
    const mod = await import('react-native-mlkit-ocr');
    MLKitModule = mod.default || mod;
    return MLKitModule;
  } catch {
    return null;
  }
}

/** 检查 ML Kit 在当前环境中是否可用 */
export async function isMlKitAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const mlkit = await getMLKit();
    return mlkit != null && typeof mlkit.detectFromUri === 'function';
  } catch {
    return false;
  }
}

/** 从图片 URI 中提取全部文字 */
export async function extractTextFromImage(imageUri: string): Promise<string> {
  const mlkit = await getMLKit();
  if (!mlkit) {
    throw new Error('ML Kit 不可用');
  }

  // 调用 ML Kit OCR
  const blocks = await mlkit.detectFromUri(imageUri);

  if (!blocks || blocks.length === 0) {
    return '';
  }

  // 将所有识别到的文字拼接起来
  const allText = blocks
    .map((block: any) => block.text)
    .filter(Boolean)
    .join('\n');

  return allText;
}

/** 拍照 → OCR 识别 → 解析肺功能指标
 *  返回与 parseFromText 相同格式的结果
 */
export async function ocrPhotoToIndicators(
  imageUri: string
): Promise<{
  rawText: string;
  indicators: OcrIndicatorResult[];
  success: boolean;
  error?: string;
}> {
  try {
    // 1. 从图片中提取文字
    const rawText = await extractTextFromImage(imageUri);

    if (!rawText.trim()) {
      return {
        rawText: '',
        indicators: [],
        success: false,
        error: '未能从图片中识别出文字。请确保图片清晰、光线充足，或尝试手动粘贴文本。',
      };
    }

    // 2. 用现有正则引擎解析指标
    const result = parseFromText(rawText);

    // 检查是否有识别到的指标（至少有一个字段有值）
    const found = result.indicators.filter(
      (i) => i.confidence !== 'none' && (i.pre_actual || i.predicted_value || i.post_actual)
    );

    if (found.length === 0) {
      return {
        rawText,
        indicators: result.indicators,
        success: false,
        error: '已识别到文字，但未能从中提取出肺功能指标。请检查报告类型是否正确。',
      };
    }

    return {
      rawText,
      indicators: result.indicators,
      success: true,
    };
  } catch (e: any) {
    return {
      rawText: '',
      indicators: [],
      success: false,
      error: e?.message || 'OCR 识别失败',
    };
  }
}

/** 从图片中提取文字并返回纯文本（用于非肺功能模块的通用 OCR） */
export async function ocrPhotoToText(imageUri: string): Promise<{
  text: string;
  success: boolean;
  error?: string;
}> {
  try {
    const rawText = await extractTextFromImage(imageUri);
    if (!rawText.trim()) {
      return {
        text: '',
        success: false,
        error: '未能从图片中识别出文字。请确保图片清晰、光线充足。',
      };
    }
    return { text: rawText, success: true };
  } catch (e: any) {
    return {
      text: '',
      success: false,
      error: e?.message || 'OCR 识别失败',
    };
  }
}
