// 日常指脉氧记录 — 列表页
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useT } from '../../../src/i18n';
import {
  getAllVitalsRecords, deleteVitalsRecord,
} from '../../../src/database/repositories/vitalsRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { DailyVitals } from '../../../src/types/models';

export default function VitalsListScreen() {
  const router = useRouter();
  const t = useT();
  const [records, setRecords] = useState<DailyVitals[]>([]);

  useFocusEffect(useCallback(() => {
    getAllVitalsRecords().then(setRecords).catch(console.error);
  }, []));

  const handleDelete = async (record: DailyVitals) => {
    if (!await showConfirm('确认删除', `确定删除 ${record.record_date} 的氧合呼吸记录？此操作不可撤销。`)) return;
    await deleteVitalsRecord(record.id);
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
  };

  const renderItem = ({ item }: { item: DailyVitals }) => (
    <TouchableOpacity
      onPress={() => router.push(`/record/vitals/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.dateRow}>
              <Text style={styles.date}>{item.record_date}</Text>
              {item.measurement_time === 'morning' ? (
                <Text style={styles.badge}>{t.vitals.morning}</Text>
              ) : (
                <Text style={styles.badge}>{t.vitals.evening}</Text>
              )}
            </View>
            <IconButton
              icon="delete"
              size={18}
              iconColor="#C62828"
              onPress={() => handleDelete(item)}
            />
          </View>
          <View style={styles.metrics}>
            {item.spo2 != null && (
              <View style={styles.metricItem}>
                <MaterialCommunityIcons name="molecule" size={20} color="#1565C0" />
                <Text style={styles.metricValue}>SpO₂ {item.spo2}%</Text>
              </View>
            )}
            {item.heart_rate != null && (
              <View style={styles.metricItem}>
                <MaterialCommunityIcons name="heart-pulse" size={20} color="#C62828" />
                <Text style={styles.metricValue}>心率 {item.heart_rate}</Text>
              </View>
            )}
            {item.respiratory_rate != null && (
              <View style={styles.metricItem}>
                <MaterialCommunityIcons name="lungs" size={20} color="#2E7D32" />
                <Text style={styles.metricValue}>呼吸 {item.respiratory_rate}</Text>
              </View>
            )}
          </View>
          {item.notes ? (
            <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>
          ) : null}
          <Text style={styles.hint}>{t.common.detail}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {records.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="heart-pulse" size={64} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>{t.list.empty}</Text>
          <Text style={styles.emptySubtitle}>{t.list.addHint}</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/record/vitals/add')}
        label="新增"
      />
      <FAB icon="camera" style={styles.photoFab} color="#fff" small onPress={() => router.push('/module-photos?module=vitals&moduleName=' + encodeURIComponent(t.vitals.title))} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 12, paddingBottom: 80 },
  card: { marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 16, fontWeight: 'bold', color: '#424242' },
  badge: { fontSize: 12, color: '#666', backgroundColor: '#E8E8E8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricValue: { fontSize: 15, color: '#333' },
  notes: { fontSize: 13, color: '#888', marginTop: 6 },
  hint: { fontSize: 12, color: '#999', marginTop: 4, textAlign: 'right' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#424242', marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: '#999', marginTop: 6 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
  photoFab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#2E7D32' },
});
