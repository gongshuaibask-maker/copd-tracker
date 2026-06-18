// 肺功能检查 — 新增/编辑页（四级折叠表单 + 6 子字段 + 拍照）
import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, Alert, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text, TextInput, Button, Card, IconButton, Divider, Surface, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DatePicker from '../../../src/components/DatePicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { format, parseISO, isValid } from 'date-fns';
import {
  createPulmonaryRecord, updatePulmonaryRecord, getPulmonaryRecord,
} from '../../../src/database/repositories/pulmonaryRepo';
import { PULMONARY_INDICATORS, PULMONARY_LEVELS } from '../../../src/constants/pulmonaryIndicators';
import { parseFromText, type OcrIndicatorResult } from '../../../src/services/ocrService';
import { extractPulmonaryConclusion, extractPulmonaryDate } from '../../../src/services/conclusionExtractor';
import OcrInputModal, { type OcrField } from '../../../src/components/OcrInputModal';
import type { PulmonaryFunctionDetail, IndicatorKey } from '../../../src/types/models';

// 单个指标的输入数据（UI 层使用）
interface IndicatorInput {
  predicted_value: string;
  pre_actual: string;
  pre_pct_predicted: string;
  post_actual: string;
  post_pct_predicted: string;
  improvement_rate: string;
}

const emptyInput: IndicatorInput = {
  predicted_value: '', pre_actual: '', pre_pct_predicted: '',
  post_actual: '', post_pct_predicted: '', improvement_rate: '',
};

export default function PulmonaryAddScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const recordId = id ? parseInt(id) : null;

  const [recordDate, setRecordDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // OCR 结果
  const [pasteText, setPasteText] = useState('');

  // 每个级别的展开状态（默认展开一级）
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([1]));

  // 存储每个指标的 6 子字段输入
  const [indicatorInputs, setIndicatorInputs] = useState<Record<string, IndicatorInput>>({});

  // 录入模式：quick（仅核心指标）/ full（全部四级）
  const [entryMode, setEntryMode] = useState<'quick' | 'full'>('quick');

  // 编辑模式：加载已有数据
  useEffect(() => {
    if (!recordId) return;
    getPulmonaryRecord(recordId).then((record) => {
      if (!record) return;
      setRecordDate(parseISO(record.record_date));
      setPhotoUri(record.photo_uri);
      setNotes(record.notes ?? '');

      const inputs: Record<string, IndicatorInput> = {};
      const expanded = new Set<number>([1]);
      let hasNonCore = false;
      for (const d of record.details) {
        inputs[d.indicator_key] = {
          predicted_value: d.predicted_value?.toString() ?? '',
          pre_actual: d.pre_actual?.toString() ?? '',
          pre_pct_predicted: d.pre_pct_predicted?.toString() ?? '',
          post_actual: d.post_actual?.toString() ?? '',
          post_pct_predicted: d.post_pct_predicted?.toString() ?? '',
          improvement_rate: d.improvement_rate?.toString() ?? '',
        };
        expanded.add(d.indicator_level);
        if (d.indicator_level > 1) hasNonCore = true;
      }
      setIndicatorInputs(inputs);
      setExpandedLevels(expanded);
      setEntryMode(hasNonCore ? 'full' : 'quick');
    });
  }, [recordId]);

  // 获取或创建指标输入
  const getInput = (key: string): IndicatorInput => {
    return indicatorInputs[key] ?? { ...emptyInput };
  };

  // 检查某个指标是否有任何输入
  const hasAnyInput = (key: string): boolean => {
    const input = indicatorInputs[key];
    if (!input) return false;
    return Object.values(input).some((v) => v !== '');
  };

  // 更新单个字段并自动计算联动值
  const updateField = (key: string, field: keyof IndicatorInput, value: string) => {
    setIndicatorInputs((prev) => {
      const current = { ...(prev[key] ?? { ...emptyInput }) };
      current[field] = value;

      const predicted = parseFloat(current.predicted_value) || 0;
      const pre = parseFloat(current.pre_actual) || 0;
      const post = parseFloat(current.post_actual) || 0;

      // 自动计算：用药前占预计%
      if (predicted > 0 && pre > 0) {
        current.pre_pct_predicted = ((pre / predicted) * 100).toFixed(1);
      }
      // 自动计算：用药后占预计%
      if (predicted > 0 && post > 0) {
        current.post_pct_predicted = ((post / predicted) * 100).toFixed(1);
      }
      // 自动计算：改善率%
      if (pre > 0 && post > 0) {
        current.improvement_rate = (((post - pre) / pre) * 100).toFixed(1);
      }

      return { ...prev, [key]: current };
    });
  };

  // 拍照/选图（Web 兼容）
  const handlePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7, allowsEditing: true,
      }).catch(() => ImagePicker.launchImageLibraryAsync({
        quality: 0.7, allowsEditing: true, mediaTypes: ['images'],
      }));
      if (result && !result.canceled && result.assets?.length) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch {
      // Web 无摄像头 → 打开文件选择
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7, allowsEditing: true, mediaTypes: ['images'],
      });
      if (!result.canceled && result.assets?.length) {
        setPhotoUri(result.assets[0].uri);
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7, allowsEditing: true, mediaTypes: ['images'],
      });
      if (!result.canceled && result.assets?.length) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Pick image failed:', err);
    }
  };

  // 保存
  const handleSave = async () => {
    setSaving(true);
    try {
      const dateStr = format(recordDate, 'yyyy-MM-dd');

      // 构建子表数据
      const details: Omit<PulmonaryFunctionDetail, 'id' | 'record_id'>[] = [];
      for (const [key, input] of Object.entries(indicatorInputs)) {
        const def = PULMONARY_INDICATORS[key];
        if (!def) continue;

        const hasAnyValue = Object.values(input).some((v) => v !== '');
        if (!hasAnyValue) continue;

        details.push({
          indicator_key: key as IndicatorKey,
          indicator_level: def.level,
          predicted_value: input.predicted_value ? parseFloat(input.predicted_value) : null,
          pre_actual: input.pre_actual ? parseFloat(input.pre_actual) : null,
          pre_pct_predicted: input.pre_pct_predicted ? parseFloat(input.pre_pct_predicted) : null,
          post_actual: input.post_actual ? parseFloat(input.post_actual) : null,
          post_pct_predicted: input.post_pct_predicted ? parseFloat(input.post_pct_predicted) : null,
          improvement_rate: input.improvement_rate ? parseFloat(input.improvement_rate) : null,
        });
      }

      if (isEdit && recordId) {
        await updatePulmonaryRecord(recordId, dateStr, photoUri, notes || null, details, conclusion || null);
      } else {
        await createPulmonaryRecord(dateStr, photoUri, notes || null, details, conclusion || null);
      }

      router.back();
    } catch (e) {
      console.error('Save failed:', e);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  // OcrInputModal 状态
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrRawText, setOcrRawText] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [ocrDate, setOcrDate] = useState<string | null>(null);

  // OcrInputModal 的解析函数：parseFromText → OcrField[]
  const parsePulmonaryText = (text: string): OcrField[] => {
    setOcrRawText(text);
    // 提取结论文字
    const conc = extractPulmonaryConclusion(text);
    if (conc) setConclusion(conc);
    // 提取检查日期
    const detectedDate = extractPulmonaryDate(text);
    if (detectedDate) setOcrDate(detectedDate);
    // 解析指标
    const result = parseFromText(text);
    return result.indicators.map((ind) => ({
      key: ind.indicatorKey,
      label: `${ind.label} (${ind.name})`,
      value: ind.pre_actual || ind.predicted_value || ind.post_actual || '',
      unit: ind.unit,
      confidence: ind.confidence,
    }));
  };

  // OcrInputModal 确认回调：填入表单
  const handleOcrApply = (fields: OcrField[]) => {
    if (!ocrRawText.trim()) return;
    const selectedKeys = new Set(fields.map(f => f.key));
    const result = parseFromText(ocrRawText);
    const selectedIndicators = result.indicators.filter(
      ind => selectedKeys.has(ind.indicatorKey)
    );
    applyOcrResults(selectedIndicators);
  };

  // OCR 识别结果确认 → 填入表单
  const applyOcrResults = (results: OcrIndicatorResult[]) => {
    const inputs: Record<string, IndicatorInput> = {};
    const expanded = new Set<number>([1]); // 一级默认展开

    for (const r of results) {
      if (r.confidence === 'low' || r.confidence === 'none') continue;

      const def = PULMONARY_INDICATORS[r.indicatorKey];
      if (!def) continue;

      inputs[r.indicatorKey] = {
        predicted_value: r.predicted_value,
        pre_actual: r.pre_actual,
        pre_pct_predicted: r.pre_pct_predicted,
        post_actual: r.post_actual,
        post_pct_predicted: r.post_pct_predicted,
        improvement_rate: r.improvement_rate,
      };

      if (def.level >= 1 && def.level <= 4) {
        expanded.add(def.level);
      }
    }

    setIndicatorInputs((prev) => ({ ...prev, ...inputs }));
    setExpandedLevels(expanded);
    setPasteText('');

    Alert.alert('已填入', `已将 ${Object.keys(inputs).length} 个指标填入表单，请核对修正后保存。`);
  };

  // 一键清除某个指标的全部输入（OCR 识别错误时可快速清除重填）
  const clearIndicator = (key: string) => {
    setIndicatorInputs((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // 渲染单指标的 6 子字段输入行
  const renderSixFieldInput = (key: string) => {
    const def = PULMONARY_INDICATORS[key];
    if (!def) return null;
    const input = getInput(key);
    const showBronchodilator = def.hasBronchodilator;

    return (
      <View style={styles.indicatorBlock}>
        <View style={styles.indicatorLabelRow}>
          <Text style={styles.indicatorLabel}>
            {def.label}（{def.name}）<Text style={styles.unit}>{def.unit}</Text>
          </Text>
          {hasAnyInput(key) && (
            <IconButton
              icon="close-circle-outline"
              size={18}
              iconColor="#999"
              style={styles.clearBtn}
              onPress={() => {
                Alert.alert('清除指标', `确定清除 ${def.label} 的全部已填数据？`, [
                  { text: '取消', style: 'cancel' },
                  { text: '清除', style: 'destructive', onPress: () => clearIndicator(key) },
                ]);
              }}
            />
          )}
        </View>

        {/* 预计值 */}
        <TextInput
          label="预计值"
          value={input.predicted_value}
          onChangeText={(v) => updateField(key, 'predicted_value', v)}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.fieldInput}
          dense
        />

        {/* 用药前 */}
        <View style={styles.row}>
          <TextInput
            label="用药前实测"
            value={input.pre_actual}
            onChangeText={(v) => updateField(key, 'pre_actual', v)}
            mode="outlined"
            keyboardType="decimal-pad"
            style={[styles.fieldInput, styles.flex1]}
            dense
          />
          <View style={styles.autoCalcField}>
            <Text style={styles.autoCalcLabel}>占预计%</Text>
            <Text style={styles.autoCalcValue}>{input.pre_pct_predicted || '—'}</Text>
          </View>
        </View>

        {/* 用药后（支气管舒张试验） */}
        {showBronchodilator && (
          <>
            <View style={styles.row}>
              <TextInput
                label="用药后实测"
                value={input.post_actual}
                onChangeText={(v) => updateField(key, 'post_actual', v)}
                mode="outlined"
                keyboardType="decimal-pad"
                style={[styles.fieldInput, styles.flex1]}
                dense
              />
              <View style={styles.autoCalcField}>
                <Text style={styles.autoCalcLabel}>占预计%</Text>
                <Text style={styles.autoCalcValue}>{input.post_pct_predicted || '—'}</Text>
              </View>
            </View>

            {/* 改善率 */}
            <View style={styles.improvementRow}>
              <Text style={styles.improvementLabel}>改善率：</Text>
              <Text style={[
                styles.improvementValue,
                input.improvement_rate && parseFloat(input.improvement_rate) >= 12
                  ? styles.improvementPositive : {},
              ]}>
                {input.improvement_rate ? `${input.improvement_rate}%` : '—'}
              </Text>
              {input.improvement_rate && parseFloat(input.improvement_rate) >= 12 && key === 'fev1' && (
                <Text style={styles.positiveHint}> ⚠️ 舒张试验阳性</Text>
              )}
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* 日期选择 */}
        <Text style={styles.sectionTitle}>📅 检查日期 *</Text>
        <Button mode="outlined" onPress={() => setShowDatePicker(true)} icon="calendar" style={styles.dateBtn}>
          {isValid(recordDate) ? format(recordDate, 'yyyy-MM-dd') : '选择日期'}
        </Button>
        <DatePicker visible={showDatePicker} value={recordDate} maximumDate={new Date()} onChange={(d) => setRecordDate(d)} onClose={() => setShowDatePicker(false)} />

        {/* 拍照/上传 */}
        <Text style={styles.sectionTitle}>📷 拍摄/上传肺功能报告</Text>
        <Text style={styles.photoHint}>
          拍照或从相册选取报告照片，照片将保存在患者资料中供复查参考。
          系统将自动识别照片中的数值（即将上线）。
        </Text>
        <View style={styles.photoRow}>
          <Button mode="outlined" icon="camera" onPress={handlePhoto} style={styles.photoBtn}>
            拍照留存
          </Button>
          <Button mode="outlined" icon="image" onPress={handlePickImage} style={styles.photoBtn}>
            从相册选择
          </Button>
        </View>
        <Button mode="contained" icon="auto-fix" onPress={() => {
          setPasteText('');
          setShowOcrModal(true);
        }} style={styles.pasteBtn} buttonColor="#0277BD">
          📷📋 拍照/粘贴自动识别
        </Button>
        <Text style={styles.pasteHint}>
          拍照自动识别（正式版）或粘贴报告文字，系统自动提取指标并填入表单。
        </Text>
        {photoUri && (
          <View style={styles.photoPreview}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
            <IconButton icon="close-circle" size={20} iconColor="#C62828" onPress={() => setPhotoUri(null)} />
          </View>
        )}

        <Divider style={styles.divider} />

        {/* 录入模式切换 */}
        <Text style={styles.sectionTitle}>📝 录入模式</Text>
        <SegmentedButtons
          value={entryMode}
          onValueChange={(v) => setEntryMode(v as 'quick' | 'full')}
          buttons={[
            { value: 'quick', label: '⭐ 快速录入（核心4项）' },
            { value: 'full', label: '完整录入（20项）' },
          ]}
          style={{ marginHorizontal: 16, marginBottom: 8 }}
        />
        <Text style={styles.modeHint}>
          {entryMode === 'quick'
            ? '仅录入通气分型核心指标（FVC/FEV₁/FEV₁%/FEV₁%pred），适用于日常快速复查记录。'
            : '录入全部四级20项肺功能指标，适用于年度全面肺功能检查报告。'}
        </Text>

        {/* 四级分组表单 */}
        {PULMONARY_LEVELS.map((levelDef) => {
          // 快速模式仅展示一级核心指标
          if (entryMode === 'quick' && levelDef.level !== 1) return null;
          const isExpanded = expandedLevels.has(levelDef.level) || (entryMode === 'quick');
          return (
            <View key={levelDef.level}>
              <TouchableOpacity
                style={styles.levelHeader}
                onPress={() => toggleLevel(levelDef.level)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={isExpanded ? 'chevron-down' : 'chevron-right'}
                  size={22}
                  color="#2E7D32"
                />
                <Text style={styles.levelTitle}>{levelDef.title}</Text>
                <Text style={styles.levelSubtitle}>{levelDef.subtitle}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <Card style={styles.levelCard}>
                  <Card.Content>
                    {levelDef.keys.map((key) => <View key={key}>{renderSixFieldInput(key)}</View>)}
                  </Card.Content>
                </Card>
              )}
            </View>
          );
        })}

        {/* 识别结论展示 */}
        {conclusion ? (
          <Card style={styles.conclusionCard}>
            <Card.Content>
              <Text style={styles.conclusionTitle}>📋 报告结论</Text>
              <Text style={styles.conclusionText}>{conclusion}</Text>
            </Card.Content>
          </Card>
        ) : null}

        {/* OCR识别的检查日期提示 */}
        {ocrDate && (
          <Text style={styles.dateHint}>📅 报告日期：{ocrDate}（已自动填入上方）</Text>
        )}

        {/* 备注 */}
        <TextInput
          label="备注"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* OCR 拍照/粘贴识别弹窗 */}
      <OcrInputModal
        visible={showOcrModal}
        onClose={() => { setShowOcrModal(false); setPasteText(''); }}
        onApply={(fields) => {
          // 保存当前 OCR 文本用于 apply
          setShowOcrModal(false);
          handleOcrApply(fields);
        }}
        title="拍照/粘贴识别肺功能报告"
        parseFn={parsePulmonaryText}
      />

      {/* 底部保存按钮 */}
      <Surface style={styles.bottomBar} elevation={4}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
          contentStyle={{ paddingVertical: 8 }}
        >
          保存记录
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#424242', padding: 16, paddingBottom: 4 },
  photoHint: { fontSize: 12, color: '#888', paddingHorizontal: 16, marginBottom: 8, lineHeight: 18 },
  dateBtn: { marginHorizontal: 16, marginBottom: 8 },
  photoRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  photoBtn: { flex: 1 },
  pasteBtn: { marginHorizontal: 16, marginTop: 4, borderRadius: 8 },
  pasteHint: { fontSize: 11, color: '#999', paddingHorizontal: 16, marginTop: 4, marginBottom: 4 },
  modeHint: { fontSize: 12, color: '#888', paddingHorizontal: 16, marginBottom: 8, lineHeight: 18 },
  photoPreview: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  previewImage: { width: 100, height: 70, borderRadius: 6, backgroundColor: '#E0E0E0' },
  divider: { marginVertical: 12, marginHorizontal: 16 },
  // 级别标题
  levelHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  levelTitle: { fontSize: 15, fontWeight: 'bold', color: '#2E7D32', marginLeft: 4, flex: 1 },
  levelSubtitle: { fontSize: 11, color: '#999' },
  levelCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 10 },
  // 单指标块
  indicatorBlock: { marginBottom: 16 },
  indicatorLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  indicatorLabel: { fontSize: 14, fontWeight: 'bold', color: '#424242', flex: 1 },
  clearBtn: { margin: 0 },
  unit: { fontSize: 12, color: '#999', fontWeight: 'normal' },
  fieldInput: { marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  autoCalcField: {
    width: 70, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#E8E8E8', borderRadius: 6, paddingVertical: 10, marginTop: 2,
  },
  autoCalcLabel: { fontSize: 10, color: '#999' },
  autoCalcValue: { fontSize: 14, fontWeight: 'bold', color: '#424242' },
  improvementRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, paddingLeft: 4 },
  improvementLabel: { fontSize: 13, color: '#666' },
  improvementValue: { fontSize: 16, fontWeight: 'bold', color: '#424242' },
  improvementPositive: { color: '#E65100' },
  positiveHint: { fontSize: 12, color: '#E65100', fontWeight: 'bold' },
  // 结论展示
  conclusionCard: { marginHorizontal: 16, marginTop: 12, backgroundColor: '#E8F5E9', borderRadius: 8 },
  conclusionTitle: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32', marginBottom: 4 },
  conclusionText: { fontSize: 14, color: '#1B5E20', lineHeight: 20 },
  dateHint: { fontSize: 12, color: '#888', marginHorizontal: 16, marginTop: 4, marginBottom: 8 },
  // 底部
  notesInput: { marginHorizontal: 16, marginTop: 8 },
  bottomBar: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  saveBtn: { borderRadius: 8, backgroundColor: '#2E7D32' },
});
