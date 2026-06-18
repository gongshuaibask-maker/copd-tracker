// 营养体重记录 — 列表页
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useT } from '../../../src/i18n';
import {
  getAllNutritionRecords, deleteNutritionRecord,
} from '../../../src/database/repositories/nutritionRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { NutritionWeight } from '../../../src/types/models';

export default function NutritionListScreen() {
  const router = useRouter();
  const t = useT();
  const [records, setRecords] = useState<NutritionWeight[]>([]);

  useFocusEffect(useCallback(() => {
    getAllNutritionRecords().then(setRecords).catch(console.error);
  }, []));

  const handleDelete = async (record: NutritionWeight) => {
    if (!await showConfirm('确认删除', `确定删除 ${record.record_date} 的营养体重记录？此操作不可撤销。`)) return;
    await deleteNutritionRecord(record.id);
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
  };

  const getBmiCategory = (bmi: number): string => {
    if (bmi < 18.5) return '偏瘦';
    if (bmi < 24) return '正常';
    if (bmi < 28) return '超重';
    return '肥胖';
  };

  const renderItem = ({ item }: { item: NutritionWeight }) => (
    <TouchableOpacity
      onPress={() => router.push(`/record/nutrition/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.date}>{item.record_date}</Text>
            <IconButton
              icon="delete"
              size={18}
              iconColor="#C62828"
              onPress={() => handleDelete(item)}
            />
          </View>
          <View style={styles.metrics}>
            {item.weight_kg != null && (
              <View style={styles.metricItem}>
                <MaterialCommunityIcons name="scale-bathroom" size={20} color="#E65100" />
                <Text style={styles.metricValue}>{item.weight_kg} kg</Text>
              </View>
            )}
            {item.bmi != null && (
              <View style={styles.metricItem}>
                <MaterialCommunityIcons name="calculator" size={20} color="#1565C0" />
                <Text style={styles.metricValue}>BMI {item.bmi}</Text>
                <Text style={styles.bmiBadge}>{getBmiCategory(item.bmi)}</Text>
              </View>
            )}
            {item.albumin != null && (
              <View style={styles.metricItem}>
                <MaterialCommunityIcons name="test-tube" size={20} color="#2E7D32" />
                <Text style={styles.metricValue}>白蛋白 {item.albumin} g/L</Text>
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
          <MaterialCommunityIcons name="scale-bathroom" size={64} color="#BDBDBD" />
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
        onPress={() => router.push('/record/nutrition/add')}
        label="新增"
      />
      <FAB icon="camera" style={styles.photoFab} color="#fff" small onPress={() => router.push('/module-photos?module=nutrition&moduleName=' + encodeURIComponent(t.nutrition.title))} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 12, paddingBottom: 80 },
  card: { marginBottom: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 16, fontWeight: 'bold', color: '#424242' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 10 },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricValue: { fontSize: 15, color: '#333' },
  bmiBadge: { fontSize: 11, color: '#FFF', backgroundColor: '#1565C0', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, overflow: 'hidden' },
  notes: { fontSize: 13, color: '#888', marginTop: 6 },
  hint: { fontSize: 12, color: '#999', marginTop: 4, textAlign: 'right' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#424242', marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: '#999', marginTop: 6 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
  photoFab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#2E7D32' },
});
