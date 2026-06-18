// 合并症 — 详情页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, IconButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getComorbidity, deleteComorbidity } from '../../../src/database/repositories/comorbidityRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { Comorbidity } from '../../../src/types/models';

export default function ComorbidityDetailScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<Comorbidity | null>(null);
  useEffect(() => { if (id) getComorbidity(parseInt(id)).then(setRecord).catch(console.error); }, [id]);
  const handleDelete = async () => {
    if (!record) return;
    if (!await showConfirm('确认删除', `确定删除 ${record.record_date} 的记录？`)) return;
    await deleteComorbidity(record.id);
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
        <View style={s.hr}><Text style={s.date}>{record.record_date}</Text><View style={s.ha}><IconButton icon="pencil" size={20} onPress={() => router.push(`/record/comorbidity/add?id=${record.id}`)} /><IconButton icon="delete" size={20} iconColor="#C62828" onPress={handleDelete} /></View></View>
      </Card.Content></Card>
      <M icon="heart-pulse" color="#C62828" title="肺动脉压 PAP" value={record.pap_mmhg} unit="mmHg" />
      <M icon="bone" color="#6D4C41" title="骨密度 T 值" value={record.bone_density_t} unit="" />
      <M icon="water" color="#E65100" title="空腹血糖 FBG" value={record.fbg} unit="mmol/L" />
      <M icon="water-percent" color="#C62828" title="糖化血红蛋白 HbA1c" value={record.hba1c} unit="%" />
      <M icon="chart-bell-curve" color="#1565C0" title="总胆固醇 TC" value={record.tc} unit="mmol/L" />
      <M icon="chart-bell-curve" color="#EF6C00" title="甘油三酯 TG" value={record.tg} unit="mmol/L" />
      <M icon="chart-bell-curve" color="#2E7D32" title="高密度脂蛋白 HDL" value={record.hdl} unit="mmol/L" />
      <M icon="chart-bell-curve" color="#C62828" title="低密度脂蛋白 LDL" value={record.ldl} unit="mmol/L" />
      {record.notes ? <Card style={s.nc}><Card.Content><Text style={s.nl}>备注</Text><Text style={s.nt}>{record.notes}</Text></Card.Content></Card> : null}
      <Button mode="outlined" icon="pencil" onPress={() => router.push(`/record/comorbidity/add?id=${record.id}`)} style={s.eb}>编辑记录</Button>
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
