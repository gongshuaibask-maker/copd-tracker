// 气道炎症 — 新增/编辑页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import DatePicker from '../../../src/components/DatePicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { format, parseISO } from 'date-fns';
import { createInflammation, updateInflammation, getInflammation } from '../../../src/database/repositories/inflammationRepo';
import OcrInputModal, { type OcrField } from '../../../src/components/OcrInputModal';
import { parseGenericReport } from '../../../src/services/ocrService';

export default function InflammationAddScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const recordId = id ? parseInt(id) : null;
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [feno, setFeno] = useState('');
  const [bloodEos, setBloodEos] = useState('');
  const [sputumEos, setSputumEos] = useState('');
  const [sputumNeut, setSputumNeut] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showOcr, setShowOcr] = useState(false);

  useEffect(() => {
    if (!recordId) return;
    getInflammation(recordId).then(r => {
      if (!r) return;
      setRecordDate(parseISO(r.record_date));
      setFeno(r.feno_ppb?.toString() ?? ''); setBloodEos(r.blood_eos?.toString() ?? '');
      setSputumEos(r.sputum_eos_pct?.toString() ?? ''); setSputumNeut(r.sputum_neut_pct?.toString() ?? '');
      setNotes(r.notes ?? '');
    });
  }, [recordId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const dateStr = format(recordDate, 'yyyy-MM-dd');
      const toNum = (s: string) => s ? parseFloat(s) : null;
      if (isEdit && recordId) {
        await updateInflammation(recordId, dateStr, toNum(feno), toNum(bloodEos), toNum(sputumEos), toNum(sputumNeut), null, notes || null);
      } else {
        await createInflammation(dateStr, toNum(feno), toNum(bloodEos), toNum(sputumEos), toNum(sputumNeut), null, notes || null);
      }
      router.back();
    } catch (err) { Alert.alert('错误', '保存失败'); } finally { setSaving(false); }
  };

  const Field = ({ label, val, setVal, unit, hint }: { label: string; val: string; setVal: (v: string) => void; unit?: string; hint?: string; }) => (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput mode="outlined" value={val} onChangeText={setVal} keyboardType="decimal-pad"
        right={unit ? <TextInput.Affix text={unit} /> : undefined} style={s.input} placeholder={hint} />
    </>
  );

  return (
    <KeyboardAvoidingView style={s.ct} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.label}>记录日期</Text>
        <Button mode="outlined" onPress={() => setShowDate(true)} icon="calendar">{format(recordDate, 'yyyy-MM-dd')}</Button>
        <DatePicker visible={showDate} value={recordDate} maximumDate={new Date()} onChange={(d) => setRecordDate(d)} onClose={() => setShowDate(false)} />
        <Field label="FeNO（ppb）" val={feno} setVal={setFeno} unit="ppb" hint="正常 &lt;25" />
        <Field label="血嗜酸性粒细胞 EOS（%）" val={bloodEos} setVal={setBloodEos} unit="%" hint="正常 &lt;3" />
        <Field label="痰嗜酸性粒细胞 EOS（%）" val={sputumEos} setVal={setSputumEos} unit="%" />
        <Field label="痰中性粒细胞 NEUT（%）" val={sputumNeut} setVal={setSputumNeut} unit="%" />
        <Button mode="text" icon="content-paste" onPress={() => setShowOcr(true)} style={{ marginTop: 8 }}>
          粘贴报告文本自动识别
        </Button>
        <Text style={s.label}>备注</Text>
        <TextInput mode="outlined" value={notes} onChangeText={setNotes} multiline numberOfLines={3} style={s.input} />
        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={s.btn} contentStyle={{ paddingVertical: 6 }}>
          {isEdit ? '更新记录' : '保存记录'}
        </Button>
      </ScrollView>
      <OcrInputModal
        visible={showOcr}
        onClose={() => setShowOcr(false)}
        title="粘贴气道炎症报告"
        hint="粘贴包含 FeNO、EOS 等指标的报告文字"
        parseFn={(text) => parseGenericReport(text).map(f => ({
          key: f.key, label: f.label, value: f.value, unit: f.unit, confidence: f.confidence,
        }))}
        onApply={(fields) => {
          for (const f of fields) {
            if (f.key === 'FeNO') setFeno(f.value);
            if (f.key === '血EOS') setBloodEos(f.value);
            if (f.key === '痰EOS') setSputumEos(f.value);
            if (f.key === '痰NEUT') setSputumNeut(f.value);
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' }, scroll: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', color: '#424242', marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: '#FFF' }, btn: { marginTop: 24, borderRadius: 8 },
});
