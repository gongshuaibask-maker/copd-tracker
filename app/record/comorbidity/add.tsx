// 合并症 — 新增/编辑页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import DatePicker from '../../../src/components/DatePicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { format, parseISO } from 'date-fns';
import { createComorbidity, updateComorbidity, getComorbidity } from '../../../src/database/repositories/comorbidityRepo';
import OcrInputModal, { type OcrField } from '../../../src/components/OcrInputModal';
import { parseGenericReport } from '../../../src/services/ocrService';

export default function ComorbidityAddScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const recordId = id ? parseInt(id) : null;
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [pap, setPap] = useState('');
  const [tScore, setTScore] = useState('');
  const [fbg, setFbg] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [tc, setTc] = useState('');
  const [tg, setTg] = useState('');
  const [hdl, setHdl] = useState('');
  const [ldl, setLdl] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [showOcr, setShowOcr] = useState(false);

  useEffect(() => {
    if (!recordId) return;
    getComorbidity(recordId).then(r => {
      if (!r) return;
      setRecordDate(parseISO(r.record_date));
      setPap(r.pap_mmhg?.toString() ?? ''); setTScore(r.bone_density_t?.toString() ?? '');
      setFbg(r.fbg?.toString() ?? ''); setHba1c(r.hba1c?.toString() ?? '');
      setTc(r.tc?.toString() ?? ''); setTg(r.tg?.toString() ?? '');
      setHdl(r.hdl?.toString() ?? ''); setLdl(r.ldl?.toString() ?? '');
      setNotes(r.notes ?? '');
    });
  }, [recordId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const d = format(recordDate, 'yyyy-MM-dd');
      const n = (v: string) => v ? parseFloat(v) : null;
      if (isEdit && recordId) {
        await updateComorbidity(recordId, d, n(pap), n(tScore), n(fbg), n(hba1c), n(tc), n(tg), n(hdl), n(ldl), null, notes || null);
      } else {
        await createComorbidity(d, n(pap), n(tScore), n(fbg), n(hba1c), n(tc), n(tg), n(hdl), n(ldl), null, notes || null);
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
        <F l="肺动脉压 PAP（mmHg）" v={pap} sV={setPap} u="mmHg" />
        <F l="骨密度 T 值" v={tScore} sV={setTScore} h="≥-1.0 正常" />
        <F l="空腹血糖 FBG（mmol/L）" v={fbg} sV={setFbg} u="mmol/L" />
        <F l="糖化血红蛋白 HbA1c（%）" v={hba1c} sV={setHba1c} u="%" />
        <F l="总胆固醇 TC（mmol/L）" v={tc} sV={setTc} u="mmol/L" />
        <F l="甘油三酯 TG（mmol/L）" v={tg} sV={setTg} u="mmol/L" />
        <F l="高密度脂蛋白 HDL（mmol/L）" v={hdl} sV={setHdl} u="mmol/L" />
        <F l="低密度脂蛋白 LDL（mmol/L）" v={ldl} sV={setLdl} u="mmol/L" />
        <Button mode="text" icon="content-paste" onPress={() => setShowOcr(true)} style={{ marginTop: 8 }}>
          粘贴报告文本自动识别
        </Button>
        <Text style={st.label}>备注</Text>
        <TextInput mode="outlined" value={notes} onChangeText={setNotes} multiline numberOfLines={3} style={st.input} />
        <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving} style={st.btn} contentStyle={{ paddingVertical: 6 }}>
          {isEdit ? '更新记录' : '保存记录'}
        </Button>
      </ScrollView>
      <OcrInputModal
        visible={showOcr}
        onClose={() => setShowOcr(false)}
        title="粘贴合并症检查报告"
        hint="粘贴包含 PAP、血糖、血脂等指标的报告文字"
        parseFn={(text) => parseGenericReport(text).map(f => ({
          key: f.key, label: f.label, value: f.value, unit: f.unit, confidence: f.confidence,
        }))}
        onApply={(fields) => {
          for (const f of fields) {
            if (f.key === 'PAP') setPap(f.value);
            if (f.key === 'T值') setTScore(f.value);
            if (f.key === 'FBG') setFbg(f.value);
            if (f.key === 'HbA1c') setHba1c(f.value);
            if (f.key === 'TC') setTc(f.value);
            if (f.key === 'TG') setTg(f.value);
            if (f.key === 'HDL') setHdl(f.value);
            if (f.key === 'LDL') setLdl(f.value);
          }
        }}
      />
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' }, scroll: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', color: '#424242', marginTop: 16, marginBottom: 6 },
  input: { backgroundColor: '#FFF' }, btn: { marginTop: 24, borderRadius: 8 },
});
