import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getAllExercise, deleteExercise } from '../../../src/database/repositories/exerciseRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { ExerciseTest } from '../../../src/types/models';

export default function ExerciseListScreen() {
  const router = useRouter();
  const t = useT();
  const [records, setRecords] = useState<ExerciseTest[]>([]);
  useFocusEffect(useCallback(() => { getAllExercise().then(setRecords).catch(console.error); }, []));
  const handleDelete = async (r: ExerciseTest) => {
    if (!await showConfirm('确认删除', `确定删除 ${r.record_date} 的运动耐力记录？`)) return;
    await deleteExercise(r.id);
    setRecords(p => p.filter(x => x.id !== r.id));
  };
  const renderItem = ({ item }: { item: ExerciseTest }) => (
    <TouchableOpacity onPress={() => router.push(`/record/exercise/${item.id}`)} activeOpacity={0.7}>
      <Card style={S.card}><Card.Content>
        <View style={S.hdr}><Text style={S.date}>{item.record_date}</Text><IconButton icon="delete" size={18} iconColor="#C62828" onPress={() => handleDelete(item)} /></View>
        <View style={S.metrics}>
          {item.distance_m != null && <View style={S.m}><MaterialCommunityIcons name="walk" size={18} color="#E65100" /><Text style={S.v}>{item.distance_m}m</Text></View>}
          {item.borg_score != null && <View style={S.m}><MaterialCommunityIcons name="scale" size={18} color="#6A1B9A" /><Text style={S.v}>Borg {item.borg_score}</Text></View>}
        </View>
        <Text style={S.hint}>{t.common.detail}</Text>
      </Card.Content></Card>
    </TouchableOpacity>
  );
  return (
    <View style={S.ct}>
      {records.length === 0 ? (
        <View style={S.empty}><MaterialCommunityIcons name="run-fast" size={64} color="#BDBDBD" /><Text style={S.et}>{t.list.empty}</Text><Text style={S.es}>{t.list.addHint}</Text></View>
      ) : (
        <FlatList data={records} renderItem={renderItem} keyExtractor={i => i.id.toString()} contentContainerStyle={S.list} />
      )}
      <FAB icon="plus" style={S.fab} onPress={() => router.push('/record/exercise/add')} label="新增" />
      <FAB icon="camera" style={S.photoFab} color="#fff" small onPress={() => router.push('/module-photos?module=exercise&moduleName=' + encodeURIComponent(t.exercise.title))} />
    </View>
  );
}

const S = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' }, list: { padding: 12, paddingBottom: 80 },
  card: { marginBottom: 10, elevation: 2 }, hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 16, fontWeight: 'bold', color: '#424242' }, metrics: { flexDirection: 'row', gap: 16, marginTop: 10 },
  m: { flexDirection: 'row', alignItems: 'center', gap: 4 }, v: { fontSize: 15, color: '#333' },
  hint: { fontSize: 12, color: '#999', marginTop: 4, textAlign: 'right' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }, et: { fontSize: 18, fontWeight: 'bold', color: '#424242', marginTop: 12 },
  es: { fontSize: 14, color: '#999', marginTop: 6 }, fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
  photoFab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#2E7D32' },
});
