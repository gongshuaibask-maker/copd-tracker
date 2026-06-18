// 肺康复训练 — 列表 + 快速新增
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, TextInput, Button, Surface, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DatePicker from '../../../src/components/DatePicker';
import { useFocusEffect } from 'expo-router';
import { format } from 'date-fns';
import { getAllRehab, createRehab, updateRehab, deleteRehab, getLatestRehab } from '../../../src/database/repositories/rehabRepo';
import type { PulmonaryRehab } from '../../../src/types/models';
import { useRouter } from 'expo-router';
import { useT } from '../../../src/i18n';
import { showConfirm } from '../../../src/utils/confirm';

export default function RehabScreen() {
  const router = useRouter();
  const t = useT();
  const [records, setRecords] = useState<PulmonaryRehab[]>([]);
  const [latest, setLatest] = useState<PulmonaryRehab | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // 表单状态
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [duration, setDuration] = useState('30');
  const [pursedLip, setPursedLip] = useState('');
  const [diaph, setDiaph] = useState('');
  const [upperLimb, setUpperLimb] = useState('');
  const [lowerLimb, setLowerLimb] = useState('');
  const [walking, setWalking] = useState('');
  const [preSpo2, setPreSpo2] = useState('');
  const [postSpo2, setPostSpo2] = useState('');
  const [borg, setBorg] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    const [all, lat] = await Promise.all([getAllRehab(), getLatestRehab()]);
    setRecords(all);
    setLatest(lat);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const resetForm = () => {
    setEditId(null); setRecordDate(new Date()); setDuration('30');
    setPursedLip(''); setDiaph(''); setUpperLimb(''); setLowerLimb('');
    setWalking(''); setPreSpo2(''); setPostSpo2(''); setBorg(''); setNotes('');
  };

  const openEdit = (r: PulmonaryRehab) => {
    setEditId(r.id);
    setRecordDate(new Date(r.record_date));
    setDuration(r.duration_min.toString());
    setPursedLip(r.pursed_lip_breathing_min?.toString() ?? '');
    setDiaph(r.diaphragmatic_breathing_min?.toString() ?? '');
    setUpperLimb(r.upper_limb_exercise_min?.toString() ?? '');
    setLowerLimb(r.lower_limb_exercise_min?.toString() ?? '');
    setWalking(r.walking_distance_m?.toString() ?? '');
    setPreSpo2(r.pre_spo2?.toString() ?? '');
    setPostSpo2(r.post_spo2?.toString() ?? '');
    setBorg(r.borg_score?.toString() ?? '');
    setNotes(r.notes ?? '');
    setShowAdd(true);
  };

  const handleDelete = async (r: PulmonaryRehab) => {
    if (!await showConfirm('确认删除', `删除 ${r.record_date} 的训练记录？`)) return;
    await deleteRehab(r.id);
    loadData();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const n = (s: string) => s ? parseInt(s) : null;
      const data = {
        record_date: format(recordDate, 'yyyy-MM-dd'),
        duration_min: parseInt(duration) || 30,
        pursed_lip_breathing_min: n(pursedLip),
        diaphragmatic_breathing_min: n(diaph),
        upper_limb_exercise_min: n(upperLimb),
        lower_limb_exercise_min: n(lowerLimb),
        walking_distance_m: n(walking),
        pre_spo2: n(preSpo2),
        post_spo2: n(postSpo2),
        borg_score: n(borg),
        completed: 1,
        notes: notes || null,
      };
      if (editId) {
        await updateRehab(editId, data);
      } else {
        await createRehab(data);
      }
      resetForm();
      setShowAdd(false);
      loadData();
    } catch { Alert.alert('错误', '保存失败'); } finally { setSaving(false); }
  };

  const F = ({ l, v, sV, u }: { l: string; v: string; sV: (v: string) => void; u?: string }) => (
    <>
      <Text style={st.label}>{l}</Text>
      <TextInput mode="outlined" value={v} onChangeText={sV} keyboardType="numeric"
        right={u ? <TextInput.Affix text={u} /> : undefined} style={st.input} />
    </>
  );

  return (
    <View style={st.ct}>
      {/* 上次训练概览 */}
      {latest && (
        <Surface style={st.summaryBar}>
          <View style={st.summaryRow}>
            <MaterialCommunityIcons name="run" size={24} color="#2E7D32" />
            <View style={{ flex: 1 }}>
              <Text style={st.summaryTitle}>最近训练：{latest.record_date}</Text>
              <Text style={st.summarySub}>
                时长 {latest.duration_min} 分钟
                {latest.walking_distance_m ? ` · 步行 ${latest.walking_distance_m}m` : ''}
                {latest.borg_score != null ? ` · Borg ${latest.borg_score}` : ''}
              </Text>
            </View>
          </View>
        </Surface>
      )}

      {/* 训练指导卡片（ATS/ERS 指南） */}
      {records.length === 0 && (
        <Card style={st.guideCard}>
          <Card.Content>
            <Text style={st.guideTitle}>🫁 肺康复训练指导（ATS/ERS 指南）</Text>
            <Text style={st.guideItem}>① 缩唇呼吸（10-15min）：鼻吸气→缩唇缓慢呼气（吸:呼=1:2），减少气促</Text>
            <Text style={st.guideItem}>② 腹式呼吸（10-15min）：手放腹部→吸气鼓腹→呼气收腹，增加膈肌效率</Text>
            <Text style={st.guideItem}>③ 上肢训练：弹力带/小重量，每组8-12次×2-3组，改善日常活动能力</Text>
            <Text style={st.guideItem}>④ 下肢耐力训练：步行/功率车，Borg 3-5分，每周3-5次，每次≥30分钟</Text>
            <Text style={st.guideItem}>⑤ 安全：训练前测 SpO₂，&lt;88% 暂停休息；Borg≥7 应降低强度</Text>
            <Text style={st.guideItem}>⑥ 频率：建议每周至少3次，持续≥8周可见显著疗效</Text>
          </Card.Content>
        </Card>
      )}

      {/* 记录列表 */}
      <FlatList
        data={records}
        keyExtractor={i => i.id.toString()}
        contentContainerStyle={st.list}
        renderItem={({ item }) => (
          <Card style={st.card}>
            <Card.Content>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <View style={st.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={st.cardDate}>📅 {item.record_date} · {item.duration_min} 分钟</Text>
                    <View style={st.chips}>
                      {item.pursed_lip_breathing_min ? <Chip compact style={st.chip}>缩唇呼吸 {item.pursed_lip_breathing_min}min</Chip> : null}
                      {item.diaphragmatic_breathing_min ? <Chip compact style={st.chip}>腹式呼吸 {item.diaphragmatic_breathing_min}min</Chip> : null}
                      {item.walking_distance_m ? <Chip compact style={st.chip}>步行 {item.walking_distance_m}m</Chip> : null}
                      {item.borg_score != null ? <Chip compact style={st.chip}>Borg {item.borg_score}</Chip> : null}
                    </View>
                  </View>
                  <MaterialCommunityIcons name="delete-outline" size={20} color="#C62828"
                    onPress={() => handleDelete(item)} />
                </View>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}
      />

      <FAB icon="plus" style={st.fab} onPress={() => { resetForm(); setShowAdd(true); }} label="新增训练" />
      <FAB icon="camera" style={st.photoFab} color="#fff" small onPress={() => router.push('/module-photos?module=rehab&moduleName=' + encodeURIComponent(t.rehab.title))} />

      {/* 新增/编辑训练表单（底部弹出式） */}
      {showAdd && (
        <View style={st.overlay}>
          <Surface style={st.formModal}>
            <Text style={st.formTitle}>{editId ? '✏️ 编辑康复训练记录' : '🏃 新增康复训练记录'}</Text>
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator>
              <Text style={st.label}>训练日期</Text>
              <Button mode="outlined" onPress={() => setShowDate(true)} icon="calendar">
                {format(recordDate, 'yyyy-MM-dd')}
              </Button>
              <DatePicker visible={showDate} value={recordDate} maximumDate={new Date()}
                onChange={(d) => setRecordDate(d)} onClose={() => setShowDate(false)} />
              <F l="训练总时长" v={duration} sV={setDuration} u="分钟" />
              <F l="缩唇呼吸" v={pursedLip} sV={setPursedLip} u="分钟" />
              <F l="腹式呼吸" v={diaph} sV={setDiaph} u="分钟" />
              <F l="上肢阻力训练" v={upperLimb} sV={setUpperLimb} u="分钟" />
              <F l="下肢耐力训练" v={lowerLimb} sV={setLowerLimb} u="分钟" />
              <F l="步行距离" v={walking} sV={setWalking} u="米" />
              <F l="训练前 SpO₂" v={preSpo2} sV={setPreSpo2} u="%" />
              <F l="训练后 SpO₂" v={postSpo2} sV={setPostSpo2} u="%" />
              <F l="Borg 呼吸困难评分" v={borg} sV={setBorg} u="0-10" />
              <Text style={st.label}>备注</Text>
              <TextInput mode="outlined" value={notes} onChangeText={setNotes} multiline numberOfLines={2} style={st.input} />
            </ScrollView>
            <View style={st.formActions}>
              <Button mode="text" onPress={() => { resetForm(); setShowAdd(false); }}>取消</Button>
              <Button mode="contained" onPress={handleSave} loading={saving}>{editId ? '更新' : '保存'}</Button>
            </View>
          </Surface>
        </View>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 12, paddingBottom: 80 },
  summaryBar: { padding: 14, margin: 12, borderRadius: 10, backgroundColor: '#E8F5E9', elevation: 1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryTitle: { fontSize: 15, fontWeight: 'bold', color: '#2E7D32' },
  summarySub: { fontSize: 13, color: '#555', marginTop: 2 },
  guideCard: { margin: 12, borderRadius: 12, backgroundColor: '#E3F2FD' },
  guideTitle: { fontSize: 16, fontWeight: 'bold', color: '#1565C0', marginBottom: 10 },
  guideItem: { fontSize: 14, color: '#333', marginBottom: 6, lineHeight: 20 },
  card: { marginBottom: 8, borderRadius: 10 },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardDate: { fontSize: 14, fontWeight: 'bold', color: '#424242' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 },
  chip: { height: 26 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
  photoFab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#2E7D32' },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  formModal: {
    width: '92%', maxHeight: '85%', borderRadius: 16, padding: 20, backgroundColor: '#FFF',
  },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#424242', marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: '#FFF', marginBottom: 4 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
});
