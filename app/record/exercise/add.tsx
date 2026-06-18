// 运动耐力 — 新增/编辑页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, RadioButton } from 'react-native-paper';
import DatePicker from '../../../src/components/DatePicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { format, parseISO } from 'date-fns';
import { createExercise, updateExercise, getExercise } from '../../../src/database/repositories/exerciseRepo';

const BORG_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function ExerciseAddScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const recordId = id ? parseInt(id) : null;
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [distance, setDistance] = useState('');
  const [preSpo2, setPreSpo2] = useState('');
  const [postSpo2, setPostSpo2] = useState('');
  const [preHr, setPreHr] = useState('');
  const [postHr, setPostHr] = useState('');
  const [borg, setBorg] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!recordId) return;
    getExercise(recordId).then(r => {
      if (!r) return;
      setRecordDate(parseISO(r.record_date));
      setDistance(r.distance_m?.toString() ?? '');
      setPreSpo2(r.pre_spo2?.toString() ?? ''); setPostSpo2(r.post_spo2?.toString() ?? '');
      setPreHr(r.pre_hr?.toString() ?? ''); setPostHr(r.post_hr?.toString() ?? '');
      setBorg(r.borg_score ?? 0); setNotes(r.notes ?? '');
    });
  }, [recordId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const d = format(recordDate, 'yyyy-MM-dd');
      const n = (s: string) => s ? parseFloat(s) : null;
      const ni = (s: string) => s ? parseInt(s) : null;
      if (isEdit && recordId) {
        await updateExercise(recordId, d, n(distance), n(preSpo2), n(postSpo2), ni(preHr), ni(postHr), borg, notes || null);
      } else {
        await createExercise(d, n(distance), n(preSpo2), n(postSpo2), ni(preHr), ni(postHr), borg, notes || null);
      }
      router.back();
    } catch { Alert.alert('错误', '保存失败'); } finally { setSaving(false); }
  };

  return (
    <KeyboardAvoidingView style={s.ct} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.label}>记录日期</Text>
        <Button mode="outlined" onPress={() => setShowDate(true)} icon="calendar">{format(recordDate, 'yyyy-MM-dd')}</Button>
        <DatePicker visible={showDate} value={recordDate} maximumDate={new Date()} onChange={(d) => setRecordDate(d)} onClose={() => setShowDate(false)} />
        <Text style={s.label}>步行距离（米）</Text>
        <TextInput mode="outlined" value={distance} onChangeText={setDistance} keyboardType="numeric" right={<TextInput.Affix text="m" />} style={s.input} placeholder="6分钟步行距离" />
        <Text style={s.label}>{t.exercise.preSpo2}</Text>
        <TextInput mode="outlined" value={preSpo2} onChangeText={setPreSpo2} keyboardType="numeric" right={<TextInput.Affix text="%" />} style={s.input} />
        <Text style={s.label}>{t.exercise.postSpo2}</Text>
        <TextInput mode="outlined" value={postSpo2} onChangeText={setPostSpo2} keyboardType="numeric" right={<TextInput.Affix text="%" />} style={s.input} />
        <Text style={s.label}>{t.exercise.preHr}</Text>
        <TextInput mode="outlined" value={preHr} onChangeText={setPreHr} keyboardType="numeric" right={<TextInput.Affix text="bpm" />} style={s.input} />
        <Text style={s.label}>{t.exercise.postHr}</Text>
        <TextInput mode="outlined" value={postHr} onChangeText={setPostHr} keyboardType="numeric" right={<TextInput.Affix text="bpm" />} style={s.input} />
        <Text style={s.label}>{t.exercise.borg}</Text>
        <RadioButton.Group value={borg.toString()} onValueChange={v => setBorg(parseInt(v))}>
          <View style={s.radioRow}>{BORG_OPTIONS.map(o => <View key={o} style={s.ri}><RadioButton value={o.toString()} /><Text style={s.rl}>{o}</Text></View>)}</View>
        </RadioButton.Group>
        <Text style={s.label}>备注</Text>
        <TextInput mode="outlined" value={notes} onChangeText={setNotes} multiline numberOfLines={3} style={s.input} />
        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={s.btn} contentStyle={{ paddingVertical: 6 }}>
          {isEdit ? '更新记录' : '保存记录'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' }, scroll: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', color: '#424242', marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: '#FFF' }, btn: { marginTop: 24, borderRadius: 8 },
  radioRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 4 },
  ri: { flexDirection: 'row', alignItems: 'center', width: '20%' }, rl: { fontSize: 12, color: '#666' },
});
