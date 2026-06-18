// 肺功能检查 — 记录列表页
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getAllPulmonaryRecords, deletePulmonaryRecord } from '../../../src/database/repositories/pulmonaryRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { PulmonaryFunction } from '../../../src/types/models';

export default function PulmonaryListScreen() {
  const router = useRouter();
  const t = useT();
  const [records, setRecords] = useState<PulmonaryFunction[]>([]);

  useFocusEffect(useCallback(() => {
    getAllPulmonaryRecords().then(setRecords).catch(console.error);
  }, []));

  const handleDelete = async (record: PulmonaryFunction) => {
    if (!await showConfirm('确认删除', `确定删除 ${record.record_date} 的肺功能检查记录？此操作不可撤销。`)) return;
    await deletePulmonaryRecord(record.id);
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
  };

  const renderItem = ({ item }: { item: PulmonaryFunction }) => (
    <TouchableOpacity
      onPress={() => router.push(`/record/pulmonary/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.date}>{item.record_date}</Text>
            <View style={styles.cardActions}>
              {item.photo_uri ? (
                <MaterialCommunityIcons name="camera-image" size={18} color="#2E7D32" />
              ) : null}
              <IconButton
                icon="pencil"
                size={18}
                onPress={() => router.push(`/record/pulmonary/add?id=${item.id}`)}
              />
              <IconButton
                icon="delete"
                size={18}
                iconColor="#C62828"
                onPress={() => handleDelete(item)}
              />
            </View>
          </View>
          <Text style={styles.summary} numberOfLines={2}>
            {item.notes ?? '暂无备注'}
          </Text>
          <Text style={styles.hint}>{t.common.detail}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {records.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="lungs" size={64} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>{t.list.empty}</Text>
          <Text style={styles.emptySubtitle}>{t.list.addHint}</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => router.push('/record/pulmonary/add')}
      />
      <FAB icon="camera" style={styles.photoFab} color="#fff" small onPress={() => router.push('/module-photos?module=pulmonary&moduleName=' + encodeURIComponent(t.pulmonary.title))} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 16 },
  card: { marginBottom: 10, borderRadius: 10, backgroundColor: '#fff' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  summary: { fontSize: 13, color: '#666', marginTop: 4 },
  hint: { fontSize: 12, color: '#2E7D32', marginTop: 6, textAlign: 'right' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, color: '#999', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#BDBDBD', marginTop: 8 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#2E7D32', borderRadius: 28 },
  photoFab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#2E7D32' },
});
