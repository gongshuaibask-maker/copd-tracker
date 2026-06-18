// 戒烟管理 — 新增/编辑页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, RadioButton, Card } from 'react-native-paper';
import DatePicker from '../../../src/components/DatePicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { format, parseISO } from 'date-fns';
import { createSmoking, updateSmoking, getSmoking } from '../../../src/database/repositories/smokingRepo';

export default function SmokingAddScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;
  const recordId = id ? parseInt(id) : null;
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [cigarettes, setCigarettes] = useState('0');
  const [ftnd1, setFtnd1] = useState(0);
  const [ftnd2, setFtnd2] = useState(0);
  const [ftnd3, setFtnd3] = useState(0);
  const [ftnd4, setFtnd4] = useState(0);
  const [ftnd5, setFtnd5] = useState(0);
  const [ftnd6, setFtnd6] = useState(0);
  const [relapse, setRelapse] = useState('0');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const ftndTotal = ftnd1 + ftnd2 + ftnd3 + ftnd4 + ftnd5 + ftnd6;

  useEffect(() => {
    if (!recordId) return;
    getSmoking(recordId).then(r => {
      if (!r) return;
      setRecordDate(parseISO(r.record_date));
      setCigarettes(r.cigarettes_per_day.toString());
      setFtnd1(r.ftnd_q1 ?? 0); setFtnd2(r.ftnd_q2 ?? 0); setFtnd3(r.ftnd_q3 ?? 0);
      setFtnd4(r.ftnd_q4 ?? 0); setFtnd5(r.ftnd_q5 ?? 0); setFtnd6(r.ftnd_q6 ?? 0);
      setRelapse(r.relapse_count.toString()); setNotes(r.notes ?? '');
    });
  }, [recordId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const d = format(recordDate, 'yyyy-MM-dd');
      if (isEdit && recordId) {
        await updateSmoking(recordId, d, parseInt(cigarettes) || 0, ftndTotal, ftnd1, ftnd2, ftnd3, ftnd4, ftnd5, ftnd6, null, parseInt(relapse) || 0, notes || null);
      } else {
        await createSmoking(d, parseInt(cigarettes) || 0, ftndTotal, ftnd1, ftnd2, ftnd3, ftnd4, ftnd5, ftnd6, null, parseInt(relapse) || 0, notes || null);
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
        <Text style={s.label}>每日吸烟量（支）</Text>
        <TextInput mode="outlined" value={cigarettes} onChangeText={setCigarettes} keyboardType="numeric" right={<TextInput.Affix text="支/天" />} style={s.input} />
        <Text style={s.label}>FTND 尼古丁依赖量表（总分：{ftndTotal}/10）</Text>
        {ftndTotal > 0 && (
          <Card style={{ backgroundColor: ftndTotal <= 2 ? '#E8F5E9' : ftndTotal <= 4 ? '#FFF3E0' : ftndTotal <= 6 ? '#FFE0B2' : '#FFCDD2', marginBottom: 8, borderRadius: 8 }}>
            <Card.Content>
              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
                {ftndTotal <= 2 ? '✅ 低度依赖' : ftndTotal <= 4 ? '⚠️ 中度依赖' : ftndTotal <= 6 ? '🔶 高度依赖' : '🔴 极高度依赖'}
                ｜建议：{ftndTotal <= 2 ? '行为咨询+自我管理' : ftndTotal <= 4 ? '咨询+NRT（尼古丁替代）' : '药物（伐尼克兰/NRT联合）+行为干预'}
              </Text>
              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                ATS 指南：FTND≥4 应启动药物戒烟治疗；伐尼克兰联合 NRT 戒断率最高
              </Text>
            </Card.Content>
          </Card>
        )}
        <Text style={s.sub}>Q1: 起床后多久吸第一支烟？</Text>
        <RadioButton.Group value={ftnd1.toString()} onValueChange={v => setFtnd1(parseInt(v))}>
          <View style={{ gap: 2 }}>{[{ v: 3, l: '≤5分钟' }, { v: 2, l: '6-30分钟' }, { v: 1, l: '31-60分钟' }, { v: 0, l: '>60分钟' }].map(o => <View key={o.v} style={s.ri}><RadioButton value={o.v.toString()} /><Text style={s.rl}>{o.l}</Text></View>)}</View>
        </RadioButton.Group>
        <Text style={s.sub}>Q2: 禁烟场所是否难以控制？</Text>
        <RadioButton.Group value={ftnd2.toString()} onValueChange={v => setFtnd2(parseInt(v))}>
          <View style={{ gap: 2 }}>{[{ v: 1, l: '是' }, { v: 0, l: '否' }].map(o => <View key={o.v} style={s.ri}><RadioButton value={o.v.toString()} /><Text style={s.rl}>{o.l}</Text></View>)}</View>
        </RadioButton.Group>
        <Text style={s.sub}>Q3: 最不想放弃哪支烟？</Text>
        <RadioButton.Group value={ftnd3.toString()} onValueChange={v => setFtnd3(parseInt(v))}>
          <View style={{ gap: 2 }}>{[{ v: 1, l: '早晨第一支' }, { v: 0, l: '其他' }].map(o => <View key={o.v} style={s.ri}><RadioButton value={o.v.toString()} /><Text style={s.rl}>{o.l}</Text></View>)}</View>
        </RadioButton.Group>
        <Text style={s.sub}>Q4: 每天吸多少支？</Text>
        <RadioButton.Group value={ftnd4.toString()} onValueChange={v => setFtnd4(parseInt(v))}>
          <View style={{ gap: 2 }}>{[{ v: 3, l: '≥31支' }, { v: 2, l: '21-30支' }, { v: 1, l: '11-20支' }, { v: 0, l: '≤10支' }].map(o => <View key={o.v} style={s.ri}><RadioButton value={o.v.toString()} /><Text style={s.rl}>{o.l}</Text></View>)}</View>
        </RadioButton.Group>
        <Text style={s.sub}>Q5: 晨起 1 小时内吸烟更多？</Text>
        <RadioButton.Group value={ftnd5.toString()} onValueChange={v => setFtnd5(parseInt(v))}>
          <View style={{ gap: 2 }}>{[{ v: 1, l: '是' }, { v: 0, l: '否' }].map(o => <View key={o.v} style={s.ri}><RadioButton value={o.v.toString()} /><Text style={s.rl}>{o.l}</Text></View>)}</View>
        </RadioButton.Group>
        <Text style={s.sub}>Q6: 患病卧床也吸烟？</Text>
        <RadioButton.Group value={ftnd6.toString()} onValueChange={v => setFtnd6(parseInt(v))}>
          <View style={{ gap: 2 }}>{[{ v: 1, l: '是' }, { v: 0, l: '否' }].map(o => <View key={o.v} style={s.ri}><RadioButton value={o.v.toString()} /><Text style={s.rl}>{o.l}</Text></View>)}</View>
        </RadioButton.Group>
        <Text style={s.label}>{t.smoking.relapse}</Text>
        <TextInput mode="outlined" value={relapse} onChangeText={setRelapse} keyboardType="numeric" right={<TextInput.Affix text="次" />} style={s.input} />
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
  sub: { fontSize: 14, color: '#666', marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: '#FFF' }, btn: { marginTop: 24, borderRadius: 8 },
  ri: { flexDirection: 'row', alignItems: 'center' }, rl: { fontSize: 14, color: '#333' },
});
