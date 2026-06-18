// 肺功能报告结论提取 — 从 OCR 文本中提取结论文字和检查日期
export function extractPulmonaryConclusion(rawText: string): string {
  const conclusionHeaders = [
    /结论[：:]/i, /诊断意见[：:]/i, /检查结论[：:]/i,
    /肺功能结论[：:]/i, /功能诊断[：:]/i,
    /Conclusion[：:]/i, /Impression[：:]/i, /Summary[：:]/i,
    /Interpretation[：:]/i, /Diagnosis[：:]/i,
  ];

  const lines = rawText.split(/[\r\n]+/).map(l => l.trim()).filter(Boolean);
  let inConclusion = false;
  const conclusionLines: string[] = [];

  for (const line of lines) {
    const isHeader = conclusionHeaders.some(h => h.test(line));
    if (isHeader) {
      inConclusion = true;
      const afterHeader = line.replace(/^.*?[：:]\s*/, '');
      if (afterHeader) conclusionLines.push(afterHeader);
      continue;
    }
    if (inConclusion) {
      if (/^备注[：:]|^注意[：:]|^建议[：:]|^医生[：:]|^检查[医]?师/i.test(line)) break;
      conclusionLines.push(line);
    }
  }

  if (conclusionLines.length === 0) {
    const conclusionPatterns = [
      /肺功能大致(正常|异常)/i,
      /(轻度|中度|重度|极重度)?\s*(阻塞性|限制性|混合性)?\s*通气(功能)?(障碍|减退|异常)/i,
      /舒张试验(阳性|阴性)/i,
      /弥散功能(正常|减退|降低|异常)/i,
      /FEV[₁1]\s*\/?\s*FVC.*?[＜<>\d]/i,
      /肺功能(未见|未提示)(明显)?异常/i,
    ];
    for (const line of lines) {
      for (const p of conclusionPatterns) {
        if (p.test(line)) { conclusionLines.push(line); break; }
      }
    }
  }

  return conclusionLines.join('；').trim();
}

export function extractPulmonaryDate(rawText: string): string | null {
  const datePatterns = [
    /检查[日期时间][：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
    /报告[日期时间][：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
    /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/,
  ];
  for (const p of datePatterns) {
    const match = rawText.match(p);
    if (match) {
      if (match[1] && match[1].length === 10) return match[1].replace(/\//g, '-');
      if (match[2]) return `${match[1]}-${match[2].padStart(2,'0')}-${match[3].padStart(2,'0')}`;
    }
  }
  return null;
}
