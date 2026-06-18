// 戒烟管理 — 详情页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, IconButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getSmoking, deleteSmoking } from '../../../src/database/repositories/smokingRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { SmokingCessation } from '../../../src/types/models';

export default function SmokingDetailScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<SmokingCessation | null>(null);
  useEffect(() => { if (id) getSmoking(parseInt(id)).then(setRecord).catch(console.error); }, [id]);
  const handleDelete = async () => {
    if (!record) return;
    if (!await showConfirm('确认删除', `确定删除 ${record.record_date} 的记录？`)) return;
    await deleteSmoking(record.id);
    router.back();
  };
  if (!record) return <View style={s.load}><Text>加载中...</Text></View>;
  const ftndLevel = (t: number) => t >= 7 ? '高度依赖' : t >= 4 ? '中度依赖' : '低度依赖';
  const M = ({ icon, color, title, value, unit }: { icon: string; color: string; title: string; value: number | null; unit: string; }) => (
    <Surface style={s.mc}>
      <View style={s.mh}><MaterialCommunityIcons name={icon as any} size={24} color={color} /><Text style={s.mt}>{title}</Text></View>
      {value != null ? <Text style={s.mv}>{value} <Text style={s.unit}>{unit}</Text></Text> : <Text style={s.nd}>未记录</Text>}
    </Surface>
  );
  return (
    <ScrollView style={s.ct} contentContainerStyle={s.scroll}>
      <Card style={s.hc}><Card.Content>
        <View style={s.hr}><Text style={s.date}>{record.record_date}</Text><View style={s.ha}><IconButton icon="pencil" size={20} onPress={() => router.push(`/record/smoking/add?id=${record.id}`)} /><IconButton icon="delete" size={20} iconColor="#C62828" onPress={handleDelete} /></View></View>
      </Card.Content></Card>
      <M icon="smoking-off" color="#795548" title="每日吸烟量" value={record.cigarettes_per_day} unit="支/天" />
      <Surface style={s.mc}>
        <View style={s.mh}><MaterialCommunityIcons name="clipboard-list" size={24} color="#6A1B9A" /><Text style={s.mt}>FTND 尼古丁依赖评分</Text></View>
        {record.ftnd_total != null ? (
          <View>
            <Text style={s.mv}>{record.ftnd_total}<Text style={s.unit}>/10</Text></Text>
            <Text style={[s.ftnd, { color: record.ftnd_total >= 7 ? '#C62828' : record.ftnd_total >= 4 ? '#E65100' : '#2E7D32' }]}>{ftndLevel(record.ftnd_total)}</Text>
          </View>
        ) : <Text style={s.nd}>未评估</Text>}
      </Surface>
      <M icon="repeat" color="#E65100" title="复吸次数" value={record.relapse_count} unit="次" />
      {record.notes ? <Card style={s.nc}><Card.Content><Text style={s.nl}>备注</Text><Text style={s.nt}>{record.notes}</Text></Card.Content></Card> : null}
      <Button mode="outlined" icon="pencil" onPress={() => router.push(`/record/smoking/add?id=${record.id}`)} style={s.eb}>编辑记录</Button>
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
  nd: { fontSize: 16, color: '#999' }, ftnd: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  nc: { marginBottom: 12 }, nl: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 4 },
  nt: { fontSize: 15, color: '#333' }, eb: { marginTop: 8, borderRadius: 8 },
});
