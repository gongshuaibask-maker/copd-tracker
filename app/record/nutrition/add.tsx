// 营养体重记录 — 新增/编辑页（体重、白蛋白，BMI 自动计算）
import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DatePicker from '../../../src/components/DatePicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { format, parseISO } from 'date-fns';
import { getUser } from '../../../src/database/repositories/userRepo';
import {
  createNutritionRecord, updateNutritionRecord, getNutritionRecord,
} from '../../../src/database/repositories/nutritionRepo';

export default function NutritionAddScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const recordId = id ? parseInt(id) : null;

  const [recordDate, setRecordDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [albumin, setAlbumin] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [userHeight, setUserHeight] = useState<number | null>(null);

  // 加载用户身高 + 编辑数据
  useEffect(() => {
    getUser().then((user) => {
      if (user) setUserHeight(user.height_cm);
    });
    if (!recordId) return;
    getNutritionRecord(recordId).then((record) => {
      if (!record) return;
      setRecordDate(parseISO(record.record_date));
      setWeightKg(record.weight_kg?.toString() ?? '');
      setAlbumin(record.albumin?.toString() ?? '');
      setNotes(record.notes ?? '');
    });
  }, [recordId]);

  const weightNum = parseFloat(weightKg) || 0;
  const heightM = userHeight ? userHeight / 100 : 0;
  const bmi = weightNum > 0 && heightM > 0
    ? parseFloat((weightNum / (heightM * heightM)).toFixed(1))
    : null;

  const getBmiCategory = (b: number): string => {
    if (b < 18.5) return '偏瘦';
    if (b < 24) return '正常';
    if (b < 28) return '超重';
    return '肥胖';
  };

  const validate = (): boolean => {
    if (weightKg && (parseFloat(weightKg) < 20 || parseFloat(weightKg) > 300)) {
      Alert.alert('提示', '体重范围应在 20-300 kg 之间');
      return false;
    }
    if (albumin) {
      const val = parseFloat(albumin);
      if (isNaN(val) || val < 10 || val > 60) {
        Alert.alert('提示', '白蛋白范围应在 10-60 g/L 之间');
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
        await updateNutritionRecord(
          recordId, dateStr,
          weightKg ? parseFloat(weightKg) : null,
          bmi,
          albumin ? parseFloat(albumin) : null,
          notes || null,
        );
      } else {
        await createNutritionRecord(
          dateStr,
          weightKg ? parseFloat(weightKg) : null,
          bmi,
          albumin ? parseFloat(albumin) : null,
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

        {/* 体重 */}
        <Text style={styles.label}>{t.nutrition.weightLabel}</Text>
        <TextInput
          mode="outlined"
          placeholder="例如 65.5"
          value={weightKg}
          onChangeText={setWeightKg}
          keyboardType="decimal-pad"
          right={<TextInput.Affix text="kg" />}
          style={styles.input}
        />

        {/* BMI 自动计算 */}
        {bmi != null && (
          <View style={styles.bmiCard}>
            <MaterialCommunityIcons name="calculator" size={22} color="#1565C0" />
            <View style={styles.bmiInfo}>
              <Text style={styles.bmiLabel}>BMI = {bmi}</Text>
              <Text style={styles.bmiCategory}>{getBmiCategory(bmi)}</Text>
            </View>
          </View>
        )}
        {!userHeight && weightKg ? (
          <Text style={styles.hintText}>⚠️ 请先在个人档案中填写身高，以自动计算 BMI</Text>
        ) : null}

        {/* 白蛋白 */}
        <Text style={styles.label}>{t.nutrition.albuminLabel}</Text>
        <TextInput
          mode="outlined"
          placeholder="例如 40"
          value={albumin}
          onChangeText={setAlbumin}
          keyboardType="decimal-pad"
          right={<TextInput.Affix text="g/L" />}
          style={styles.input}
        />
        <Text style={styles.hintText}>正常参考范围：35-55 g/L</Text>

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
  input: { backgroundColor: '#FFF' },
  bmiCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', padding: 12, borderRadius: 10, marginTop: 8, gap: 10 },
  bmiInfo: { flex: 1 },
  bmiLabel: { fontSize: 16, fontWeight: 'bold', color: '#1565C0' },
  bmiCategory: { fontSize: 14, color: '#1565C0', marginTop: 2 },
  hintText: { fontSize: 12, color: '#888', marginTop: 4 },
  saveButton: { marginTop: 24, borderRadius: 8 },
  saveButtonContent: { paddingVertical: 6 },
});
