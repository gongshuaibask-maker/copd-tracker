// 运动耐力 — 详情页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, IconButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getExercise, deleteExercise } from '../../../src/database/repositories/exerciseRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { ExerciseTest } from '../../../src/types/models';

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<ExerciseTest | null>(null);
  useEffect(() => { if (id) getExercise(parseInt(id)).then(setRecord).catch(console.error); }, [id]);
  const handleDelete = async () => {
    if (!record) return;
    if (!await showConfirm('确认删除', `确定删除 ${record.record_date} 的记录？`)) return;
    await deleteExercise(record.id);
    router.back();
  };
  if (!record) return <View style={s.load}><Text>加载中...</Text></View>;
  const M = ({ icon, color, title, value, unit }: { icon: string; color: string; title: string; value: number | null; unit: string; }) => (
    <Surface style={s.mc}>
      <View style={s.mh}><MaterialCommunityIcons name={icon as any} size={24} color={color} /><Text style={s.mt}>{title}</Text></View>
      {value != null ? <Text style={s.mv}>{value} <Text style={s.unit}>{unit}</Text></Text> : <Text style={s.nd}>未记录</Text>}
    </Surface>
  );
  return (
    <ScrollView style={s.ct} contentContainerStyle={s.scroll}>
      <Card style={s.hc}><Card.Content>
        <View style={s.hr}><Text style={s.date}>{record.record_date}</Text><View style={s.ha}><IconButton icon="pencil" size={20} onPress={() => router.push(`/record/exercise/add?id=${record.id}`)} /><IconButton icon="delete" size={20} iconColor="#C62828" onPress={handleDelete} /></View></View>
      </Card.Content></Card>
      <M icon="walk" color="#E65100" title="步行距离" value={record.distance_m} unit="m" />
      <M icon="molecule" color="#1565C0" title="试验前 SpO₂" value={record.pre_spo2} unit="%" />
      <M icon="molecule" color="#0277BD" title="试验后 SpO₂" value={record.post_spo2} unit="%" />
      <M icon="heart-pulse" color="#C62828" title="试验前心率" value={record.pre_hr} unit="bpm" />
      <M icon="heart-pulse" color="#B71C1C" title="试验后心率" value={record.post_hr} unit="bpm" />
      <M icon="scale" color="#6A1B9A" title="Borg 呼吸困难评分" value={record.borg_score} unit="/10" />
      {record.notes ? <Card style={s.nc}><Card.Content><Text style={s.nl}>备注</Text><Text style={s.nt}>{record.notes}</Text></Card.Content></Card> : null}
      <Button mode="outlined" icon="pencil" onPress={() => router.push(`/record/exercise/add?id=${record.id}`)} style={s.eb}>编辑记录</Button>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' }, scroll: { padding: 16, paddingBottom: 40 }, load: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hc: { marginBottom: 12 }, hr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 18, fontWeight: 'bold', color: '#424242' }, ha: { flexDirection: 'row' },
  mc: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, backgroundColor: '#FFF' },
  mh: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }, mt: { fontSize: 16, fontWeight: '600', color: '#424242' },
  mv: { fontSize: 36, fontWeight: 'bold', color: '#333' }, unit: { fontSize: 16, fontWeight: 'normal', color: '#666' },
  nd: { fontSize: 16, color: '#999' }, nc: { marginBottom: 12 }, nl: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 4 },
  nt: { fontSize: 15, color: '#333' }, eb: { marginTop: 8, borderRadius: 8 },
});
