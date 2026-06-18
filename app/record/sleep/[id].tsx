// 睡眠监测 — 详情页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, IconButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getSleep, deleteSleep } from '../../../src/database/repositories/sleepRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { SleepMonitoring } from '../../../src/types/models';

export default function SleepDetailScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<SleepMonitoring | null>(null);
  useEffect(() => { if (id) getSleep(parseInt(id)).then(setRecord).catch(console.error); }, [id]);
  const handleDelete = async () => {
    if (!record) return;
    if (!await showConfirm('确认删除', `确定删除 ${record.record_date} 的记录？`)) return;
    await deleteSleep(record.id);
    router.back();
  };
  if (!record) return <View style={s.load}><Text>加载中...</Text></View>;
  const M = ({ icon, color, title, value, unit, warn }: { icon: string; color: string; title: string; value: number | null; unit: string; warn?: boolean; }) => (
    <Surface style={[s.mc, warn ? { backgroundColor: '#FFF3E0' } : null]}>
      <View style={s.mh}><MaterialCommunityIcons name={icon as any} size={24} color={color} /><Text style={s.mt}>{title}</Text></View>
      {value != null ? <Text style={[s.mv, warn ? { color: '#E65100' } : null]}>{value} <Text style={s.unit}>{unit}</Text></Text> : <Text style={s.nd}>未记录</Text>}
      {warn && <Text style={s.warn}>⚠️ 低于正常值（≥90%），需关注</Text>}
    </Surface>
  );
  return (
    <ScrollView style={s.ct} contentContainerStyle={s.scroll}>
      <Card style={s.hc}><Card.Content>
        <View style={s.hr}><Text style={s.date}>{record.record_date}</Text><View style={s.ha}><IconButton icon="pencil" size={20} onPress={() => router.push(`/record/sleep/add?id=${record.id}`)} /><IconButton icon="delete" size={20} iconColor="#C62828" onPress={handleDelete} /></View></View>
      </Card.Content></Card>
      <M icon="molecule" color="#1565C0" title="夜间最低 SpO₂" value={record.nocturnal_min_spo2} unit="%" warn={record.nocturnal_min_spo2 != null && record.nocturnal_min_spo2 < 90} />
      <M icon="molecule" color="#0277BD" title="夜间平均 SpO₂" value={record.nocturnal_mean_spo2} unit="%" />
      <M icon="pulse" color="#C62828" title="氧减指数 ODI" value={record.odi} unit="次/小时" />
      <M icon="timer" color="#EF6C00" title="T90（SpO₂&lt;90% 时间占比）" value={record.t90_pct} unit="%" />
      <M icon="heart-pulse" color="#6A1B9A" title="夜间平均心率" value={record.nocturnal_mean_hr} unit="bpm" />
      {record.notes ? <Card style={s.nc}><Card.Content><Text style={s.nl}>备注</Text><Text style={s.nt}>{record.notes}</Text></Card.Content></Card> : null}
      <Button mode="outlined" icon="pencil" onPress={() => router.push(`/record/sleep/add?id=${record.id}`)} style={s.eb}>编辑记录</Button>
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
  nd: { fontSize: 16, color: '#999' }, warn: { fontSize: 13, color: '#E65100', marginTop: 6 },
  nc: { marginBottom: 12 }, nl: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 4 },
  nt: { fontSize: 15, color: '#333' }, eb: { marginTop: 8, borderRadius: 8 },
});
