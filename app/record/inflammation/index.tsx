import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getAllInflammation, deleteInflammation } from '../../../src/database/repositories/inflammationRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { AirwayInflammation } from '../../../src/types/models';

export default function InflammationListScreen() {
  const router = useRouter();
  const t = useT();
  const [records, setRecords] = useState<AirwayInflammation[]>([]);
  useFocusEffect(useCallback(() => { getAllInflammation().then(setRecords).catch(console.error); }, []));
  const handleDelete = async (r: AirwayInflammation) => {
    if (!await showConfirm('确认删除', `确定删除 ${r.record_date} 的气道炎症记录？`)) return;
    await deleteInflammation(r.id);
    setRecords(p => p.filter(x => x.id !== r.id));
  };
  const renderItem = ({ item }: { item: AirwayInflammation }) => (
    <TouchableOpacity onPress={() => router.push(`/record/inflammation/${item.id}`)} activeOpacity={0.7}>
      <Card style={S.card}><Card.Content>
        <View style={S.hdr}><Text style={S.date}>{item.record_date}</Text><IconButton icon="delete" size={18} iconColor="#C62828" onPress={() => handleDelete(item)} /></View>
        <View style={S.metrics}>
          {item.feno_ppb != null && <View style={S.m}><MaterialCommunityIcons name="molecule" size={18} color="#0277BD" /><Text style={S.v}>FeNO {item.feno_ppb} ppb</Text></View>}
          {item.blood_eos != null && <View style={S.m}><MaterialCommunityIcons name="water" size={18} color="#C62828" /><Text style={S.v}>血EOS {item.blood_eos}%</Text></View>}
        </View>
        {item.notes ? <Text style={S.n} numberOfLines={1}>{item.notes}</Text> : null}
        <Text style={S.hint}>{t.common.detail}</Text>
      </Card.Content></Card>
    </TouchableOpacity>
  );
  return (
    <View style={S.ct}>
      {records.length === 0 ? (
        <View style={S.empty}><MaterialCommunityIcons name="flask" size={64} color="#BDBDBD" /><Text style={S.et}>{t.list.empty}</Text><Text style={S.es}>{t.list.addHint}</Text></View>
      ) : (
        <FlatList data={records} renderItem={renderItem} keyExtractor={i => i.id.toString()} contentContainerStyle={S.list} />
      )}
      <FAB icon="plus" style={S.fab} onPress={() => router.push('/record/inflammation/add')} label="新增" />
      <FAB icon="camera" style={S.photoFab} color="#fff" small onPress={() => router.push('/module-photos?module=inflammation&moduleName=' + encodeURIComponent(t.inflammation.title))} />
    </View>
  );
}

const S = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' }, list: { padding: 12, paddingBottom: 80 },
  card: { marginBottom: 10, elevation: 2 }, hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 16, fontWeight: 'bold', color: '#424242' }, metrics: { flexDirection: 'row', gap: 16, marginTop: 10 },
  m: { flexDirection: 'row', alignItems: 'center', gap: 4 }, v: { fontSize: 15, color: '#333' },
  n: { fontSize: 13, color: '#888', marginTop: 6 }, hint: { fontSize: 12, color: '#999', marginTop: 4, textAlign: 'right' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }, et: { fontSize: 18, fontWeight: 'bold', color: '#424242', marginTop: 12 },
  es: { fontSize: 14, color: '#999', marginTop: 6 }, fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
  photoFab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#2E7D32' },
});
