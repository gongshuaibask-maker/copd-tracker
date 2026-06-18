// 睡眠监测 — 新增/编辑页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import DatePicker from '../../../src/components/DatePicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { format, parseISO } from 'date-fns';
import { createSleep, updateSleep, getSleep } from '../../../src/database/repositories/sleepRepo';

export default function SleepAddScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const recordId = id ? parseInt(id) : null;
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [minSpo2, setMinSpo2] = useState('');
  const [meanSpo2, setMeanSpo2] = useState('');
  const [odi, setOdi] = useState('');
  const [t90, setT90] = useState('');
  const [meanHr, setMeanHr] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!recordId) return;
    getSleep(recordId).then(r => {
      if (!r) return;
      setRecordDate(parseISO(r.record_date));
      setMinSpo2(r.nocturnal_min_spo2?.toString() ?? '');
      setMeanSpo2(r.nocturnal_mean_spo2?.toString() ?? '');
      setOdi(r.odi?.toString() ?? '');
      setT90(r.t90_pct?.toString() ?? '');
      setMeanHr(r.nocturnal_mean_hr?.toString() ?? '');
      setNotes(r.notes ?? '');
    });
  }, [recordId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const d = format(recordDate, 'yyyy-MM-dd');
      const n = (v: string) => v ? parseFloat(v) : null;
      const ni = (v: string) => v ? parseInt(v) : null;
      if (isEdit && recordId) {
        await updateSleep(recordId, d, n(minSpo2), n(meanSpo2), n(odi), n(t90), ni(meanHr), notes || null);
      } else {
        await createSleep(d, n(minSpo2), n(meanSpo2), n(odi), n(t90), ni(meanHr), notes || null);
      }
      router.back();
    } catch { Alert.alert('错误', '保存失败'); } finally { setSaving(false); }
  };

  const F = ({ l, v, sV, u, h }: { l: string; v: string; sV: (v: string) => void; u?: string; h?: string; }) => (
    <>
      <Text style={st.label}>{l}</Text>
      <TextInput mode="outlined" value={v} onChangeText={sV} keyboardType="decimal-pad"
        right={u ? <TextInput.Affix text={u} /> : undefined} style={st.input} placeholder={h} />
    </>
  );

  return (
    <KeyboardAvoidingView style={st.ct} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={st.scroll}>
        <Text style={st.label}>记录日期</Text>
        <Button mode="outlined" onPress={() => setShowDate(true)} icon="calendar">{format(recordDate, 'yyyy-MM-dd')}</Button>
        <DatePicker visible={showDate} value={recordDate} maximumDate={new Date()} onChange={(d) => setRecordDate(d)} onClose={() => setShowDate(false)} />
        <F l="夜间最低 SpO₂（%）" v={minSpo2} sV={setMinSpo2} u="%" h="正常 ≥90%" />
        <F l="夜间平均 SpO₂（%）" v={meanSpo2} sV={setMeanSpo2} u="%" />
        <F l="氧减指数 ODI（次/小时）" v={odi} sV={setOdi} u="次/h" h="正常 &lt;5" />
        <F l="T90（SpO₂&lt;90% 时间占比）" v={t90} sV={setT90} u="%" />
        <F l="夜间平均心率（bpm）" v={meanHr} sV={setMeanHr} u="bpm" />
        <Text style={st.label}>备注</Text>
        <TextInput mode="outlined" value={notes} onChangeText={setNotes} multiline numberOfLines={3} style={st.input} />
        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={st.btn} contentStyle={{ paddingVertical: 6 }}>
          {isEdit ? '更新记录' : '保存记录'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' }, scroll: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', color: '#424242', marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: '#FFF' }, btn: { marginTop: 24, borderRadius: 8 },
});
