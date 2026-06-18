import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, FAB, IconButton, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getCATLevel } from '../../../src/constants/catQuestions';
import { deleteSymptomScore, getAllSymptomScores } from '../../../src/database/repositories/symptomRepo';
import { showConfirm } from '../../../src/utils/confirm';
import { Colors, Spacing, Radius, Shadow, FontSize } from '../../../src/theme/visual-tokens';
import type { SymptomScore } from '../../../src/types/models';

export default function SymptomListScreen() {
  const router = useRouter();
  const t = useT();
  const [records, setRecords] = useState<SymptomScore[]>([]);

  useFocusEffect(useCallback(() => {
    getAllSymptomScores().then(setRecords).catch(console.error);
  }, []));

  const handleDelete = async (record: SymptomScore) => {
    if (!await showConfirm('确认删除', `确定删除 ${record.record_date} 的症状评分记录？`)) return;
    await deleteSymptomScore(record.id);
    setRecords((prev) => prev.filter((item) => item.id !== record.id));
  };

  const renderItem = ({ item }: { item: SymptomScore }) => {
    const level = getCATLevel(item.cat_total);
    const catColor = item.cat_total <= 10 ? Colors.success : item.cat_total <= 20 ? Colors.warning : Colors.error;
    return (
      <TouchableOpacity onPress={() => router.push(`/record/symptom/${item.id}`)} activeOpacity={0.7}>
        <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: catColor }]}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.titleWrap}>
                <Text style={styles.date}>{item.record_date}</Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.levelBadge, { backgroundColor: catColor + '18' }]}>
                    <Text style={[styles.levelText, { color: catColor }]}>CAT {item.cat_total}</Text>
                  </View>
                  <Text style={styles.levelLabel}>{level.level}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <IconButton icon="pencil" size={18} iconColor={Colors.textMed} onPress={() => router.push(`/record/symptom/add?id=${item.id}`)} />
                <IconButton icon="delete" size={18} iconColor={Colors.error} onPress={() => handleDelete(item)} />
              </View>
            </View>
            <Text style={styles.note}>{item.notes || '暂无备注'}</Text>
            <Text style={styles.hint}>mMRC {item.mmrc_grade ?? 0} 级 · 急性加重 {item.exacerbation_count ?? 0} 次{item.exacerbation_hospitalized ? ' · 曾住院' : ''}</Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {records.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="clipboard-list" size={64} color={Colors.textLow} />
          <Text style={styles.emptyTitle}>{t.list.empty}</Text>
          <Text style={styles.emptySubtitle}>{t.list.addHint}</Text>
        </View>
      ) : (
        <FlatList data={records} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} contentContainerStyle={styles.list} />
      )}
      <FAB icon="plus" style={styles.fab} color="#fff" onPress={() => router.push('/record/symptom/add')} />
      <FAB icon="camera" style={styles.photoFab} color="#fff" small onPress={() => router.push('/module-photos?module=symptom&moduleName=' + encodeURIComponent(t.symptom.title))} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  list: { padding: Spacing.lg, paddingBottom: 100 },
  card: {
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    ...Shadow.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleWrap: { flex: 1 },
  date: { fontSize: FontSize.body, fontWeight: '700', color: Colors.textHigh },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  levelText: { fontSize: FontSize.tiny, fontWeight: '600' },
  levelLabel: { fontSize: FontSize.tiny, color: Colors.textMed },
  actions: { flexDirection: 'row', alignItems: 'center' },
  note: { fontSize: FontSize.caption, color: Colors.textMed, marginTop: Spacing.sm, lineHeight: 18 },
  hint: { fontSize: FontSize.tiny, color: Colors.textLow, marginTop: Spacing.sm },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxxl },
  emptyTitle: { fontSize: FontSize.h2, color: Colors.textLow, marginTop: Spacing.lg },
  emptySubtitle: { fontSize: FontSize.caption, color: Colors.textLow, marginTop: Spacing.sm },
  fab: { position: 'absolute', margin: Spacing.lg, right: 0, bottom: 0, backgroundColor: Colors.primary, borderRadius: 28 },
  photoFab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: Colors.primary },
});
