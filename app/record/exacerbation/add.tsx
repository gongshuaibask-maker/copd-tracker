// 急性加重 — 新增/编辑页
import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text, TextInput, Button, RadioButton, Switch, Card } from 'react-native-paper';
import DatePicker from '../../../src/components/DatePicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { format, parseISO } from 'date-fns';
import {
  createExacerbation, updateExacerbation, getExacerbation,
} from '../../../src/database/repositories/exacerbationRepo';

const SEVERITY_OPTIONS = [
  { value: 1, label: '1 - 轻微' },
  { value: 2, label: '2 - 轻度' },
  { value: 3, label: '3 - 中度' },
  { value: 4, label: '4 - 较重' },
  { value: 5, label: '5 - 严重' },
];

export default function ExacerbationAddScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const recordId = id ? parseInt(id) : null;

  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [durationDays, setDurationDays] = useState('');
  const [breathless, setBreathless] = useState(3);
  const [sputumVolume, setSputumVolume] = useState(3);
  const [sputumPurulent, setSputumPurulent] = useState(0);
  const [usedAntibiotics, setUsedAntibiotics] = useState(false);
  const [usedOralSteroids, setUsedOralSteroids] = useState(false);
  const [hospitalized, setHospitalized] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!recordId) return;
    getExacerbation(recordId).then((r) => {
      if (!r) return;
      setStartDate(parseISO(r.start_date));
      setDurationDays(r.duration_days.toString());
      setBreathless(r.symptoms_increased_breathless ?? 3);
      setSputumVolume(r.sputum_volume_increased ?? 3);
      setSputumPurulent(r.sputum_purulent);
      setUsedAntibiotics(r.used_antibiotics === 1);
      setUsedOralSteroids(r.used_oral_steroids === 1);
      setHospitalized(r.hospitalized === 1);
      setNotes(r.notes ?? '');
    });
  }, [recordId]);

  const validate = (): boolean => {
    const days = parseInt(durationDays);
    if (!durationDays || isNaN(days) || days < 1 || days > 365) {
      Alert.alert('提示', '持续天数应在 1-365 天之间');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const dateStr = format(startDate, 'yyyy-MM-dd');
      const days = parseInt(durationDays);
      if (isEdit && recordId) {
        await updateExacerbation(recordId, dateStr, days,
          breathless, sputumVolume, sputumPurulent,
          usedAntibiotics ? 1 : 0, usedOralSteroids ? 1 : 0, hospitalized ? 1 : 0,
          notes || null);
      } else {
        await createExacerbation(dateStr, days,
          breathless, sputumVolume, sputumPurulent,
          usedAntibiotics ? 1 : 0, usedOralSteroids ? 1 : 0, hospitalized ? 1 : 0,
          notes || null);
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 开始日期 */}
        <Text style={styles.label}>发作开始日期</Text>
        <Button mode="outlined" onPress={() => setShowDatePicker(true)} icon="calendar" style={styles.field}>
          {format(startDate, 'yyyy-MM-dd')}
        </Button>
        <DatePicker visible={showDatePicker} value={startDate} maximumDate={new Date()} onChange={(d) => setStartDate(d)} onClose={() => setShowDatePicker(false)} />

        {/* 持续天数 */}
        <Text style={styles.label}>{t.exacerbation.duration}</Text>
        <TextInput mode="outlined" placeholder="例如 7" value={durationDays}
          onChangeText={setDurationDays} keyboardType="numeric" maxLength={3}
          right={<TextInput.Affix text="天" />} style={styles.input} />

        {/* 气短加重程度 */}
        <Text style={styles.label}>气短加重程度</Text>
        <RadioButton.Group value={breathless.toString()} onValueChange={(v) => setBreathless(parseInt(v))}>
          <View style={styles.radioRow}>
            {SEVERITY_OPTIONS.map((o) => (
              <View key={o.value} style={styles.radioItem}>
                <RadioButton value={o.value.toString()} />
                <Text style={styles.radioLabel}>{o.value}</Text>
              </View>
            ))}
          </View>
        </RadioButton.Group>

        {/* 痰量增加程度 */}
        <Text style={styles.label}>痰量增加程度</Text>
        <RadioButton.Group value={sputumVolume.toString()} onValueChange={(v) => setSputumVolume(parseInt(v))}>
          <View style={styles.radioRow}>
            {SEVERITY_OPTIONS.map((o) => (
              <View key={o.value} style={styles.radioItem}>
                <RadioButton value={o.value.toString()} />
                <Text style={styles.radioLabel}>{o.value}</Text>
              </View>
            ))}
          </View>
        </RadioButton.Group>

        {/* 脓痰 */}
        <Card style={styles.switchCard}>
          <Card.Content>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>是否出现脓痰</Text>
              <Switch value={sputumPurulent === 1} onValueChange={(v) => setSputumPurulent(v ? 1 : 0)} />
            </View>
          </Card.Content>
        </Card>

        {/* 抗生素 */}
        <Card style={styles.switchCard}>
          <Card.Content>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>是否使用抗生素</Text>
              <Switch value={usedAntibiotics} onValueChange={setUsedAntibiotics} />
            </View>
          </Card.Content>
        </Card>

        {/* 口服激素 */}
        <Card style={styles.switchCard}>
          <Card.Content>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>是否使用口服激素</Text>
              <Switch value={usedOralSteroids} onValueChange={setUsedOralSteroids} />
            </View>
          </Card.Content>
        </Card>

        {/* 住院 */}
        <Card style={styles.switchCard}>
          <Card.Content>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>是否需要住院</Text>
              <Switch value={hospitalized} onValueChange={setHospitalized} />
            </View>
          </Card.Content>
        </Card>

        {/* 备注 */}
        <Text style={styles.label}>备注</Text>
        <TextInput mode="outlined" placeholder="可选填备注" value={notes}
          onChangeText={setNotes} multiline numberOfLines={3} style={styles.input} />

        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}
          style={styles.saveButton} contentStyle={styles.saveBtnContent}>
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
  field: { marginBottom: 4 },
  input: { backgroundColor: '#FFF' },
  radioRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  radioItem: { alignItems: 'center' },
  radioLabel: { fontSize: 12, color: '#666' },
  switchCard: { marginTop: 8, backgroundColor: '#FFF' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: 15, color: '#424242' },
  saveButton: { marginTop: 24, borderRadius: 8 },
  saveBtnContent: { paddingVertical: 6 },
});
