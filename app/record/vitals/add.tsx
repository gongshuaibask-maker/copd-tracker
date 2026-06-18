// 日常指脉氧记录 — 新增/编辑页
import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import DatePicker from '../../../src/components/DatePicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { format, parseISO } from 'date-fns';
import {
  createVitalsRecord, updateVitalsRecord, getVitalsRecord,
} from '../../../src/database/repositories/vitalsRepo';

export default function VitalsAddScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const recordId = id ? parseInt(id) : null;

  const [recordDate, setRecordDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [spo2, setSpo2] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [measurementTime, setMeasurementTime] = useState<string>('morning');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // 编辑模式：加载已有数据
  useEffect(() => {
    if (!recordId) return;
    getVitalsRecord(recordId).then((record) => {
      if (!record) return;
      setRecordDate(parseISO(record.record_date));
      setSpo2(record.spo2?.toString() ?? '');
      setRespiratoryRate(record.respiratory_rate?.toString() ?? '');
      setHeartRate(record.heart_rate?.toString() ?? '');
      setMeasurementTime(record.measurement_time ?? 'morning');
      setNotes(record.notes ?? '');
    });
  }, [recordId]);

  const validate = (): boolean => {
    if (spo2) {
      const val = parseInt(spo2);
      if (isNaN(val) || val < 50 || val > 100) {
        Alert.alert('提示', 'SpO₂ 范围应在 50-100% 之间');
        return false;
      }
    }
    if (respiratoryRate) {
      const val = parseInt(respiratoryRate);
      if (isNaN(val) || val < 5 || val > 60) {
        Alert.alert('提示', '呼吸频率范围应在 5-60 次/分之间');
        return false;
      }
    }
    if (heartRate) {
      const val = parseInt(heartRate);
      if (isNaN(val) || val < 30 || val > 250) {
        Alert.alert('提示', '心率范围应在 30-250 次/分之间');
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const dateStr = format(recordDate, 'yyyy-MM-dd');
      if (isEdit && recordId) {
        await updateVitalsRecord(
          recordId, dateStr,
          spo2 ? parseInt(spo2) : null,
          respiratoryRate ? parseInt(respiratoryRate) : null,
          heartRate ? parseInt(heartRate) : null,
          measurementTime as 'morning' | 'evening',
          notes || null,
        );
      } else {
        await createVitalsRecord(
          dateStr,
          spo2 ? parseInt(spo2) : null,
          respiratoryRate ? parseInt(respiratoryRate) : null,
          heartRate ? parseInt(heartRate) : null,
          measurementTime as 'morning' | 'evening',
          notes || null,
        );
      }
      router.back();
    } catch (err) {
      console.error('Save failed:', err);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* 日期 */}
        <Text style={styles.label}>记录日期</Text>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          icon="calendar"
          style={styles.dateButton}
        >
          {format(recordDate, 'yyyy-MM-dd')}
        </Button>
        <DatePicker visible={showDatePicker} value={recordDate} maximumDate={new Date()} onChange={(d) => setRecordDate(d)} onClose={() => setShowDatePicker(false)} />

        {/* 时段选择 */}
        <Text style={styles.label}>{t.vitals.timeLabel}</Text>
        <SegmentedButtons
          value={measurementTime}
          onValueChange={setMeasurementTime}
          buttons={[
            { value: 'morning', label: '🌅 晨起' },
            { value: 'evening', label: '🌇 晚间' },
          ]}
          style={styles.segment}
        />

        {/* SpO₂ */}
        <Text style={styles.label}>{t.vitals.spo2Label}</Text>
        <TextInput
          mode="outlined"
          placeholder="例如 96"
          value={spo2}
          onChangeText={setSpo2}
          keyboardType="numeric"
          maxLength={3}
          right={<TextInput.Affix text="%" />}
          style={styles.input}
        />

        {/* 呼吸频率 */}
        <Text style={styles.label}>{t.vitals.rrLabel}</Text>
        <TextInput
          mode="outlined"
          placeholder="例如 20"
          value={respiratoryRate}
          onChangeText={setRespiratoryRate}
          keyboardType="numeric"
          maxLength={2}
          right={<TextInput.Affix text="次/分" />}
          style={styles.input}
        />

        {/* 心率 */}
        <Text style={styles.label}>{t.vitals.hrLabel}</Text>
        <TextInput
          mode="outlined"
          placeholder="例如 72"
          value={heartRate}
          onChangeText={setHeartRate}
          keyboardType="numeric"
          maxLength={3}
          right={<TextInput.Affix text="bpm" />}
          style={styles.input}
        />

        {/* 备注 */}
        <Text style={styles.label}>备注</Text>
        <TextInput
          mode="outlined"
          placeholder="可选填备注"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.input}
        />

        {/* 保存按钮 */}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          {isEdit ? '更新记录' : '保存记录'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', color: '#424242', marginTop: 16, marginBottom: 6 },
  dateButton: { marginBottom: 4 },
  segment: { marginBottom: 4 },
  input: { backgroundColor: '#FFF' },
  saveButton: { marginTop: 24, borderRadius: 8 },
  saveButtonContent: { paddingVertical: 6 },
});
