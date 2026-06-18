// 急性加重记录 — 时间轴列表页
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, IconButton, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useT } from '../../../src/i18n';
import {
  getAllExacerbations, deleteExacerbation,
  getRiskAssessment, type RiskAssessment,
} from '../../../src/database/repositories/exacerbationRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { ExacerbationLog } from '../../../src/types/models';

export default function ExacerbationListScreen() {
  const router = useRouter();
  const t = useT();
  const [records, setRecords] = useState<ExacerbationLog[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);

  const loadData = useCallback(async () => {
    const [r, assessment] = await Promise.all([
      getAllExacerbations(),
      getRiskAssessment(),
    ]);
    setRecords(r);
    setRiskAssessment(assessment);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleDelete = async (record: ExacerbationLog) => {
    if (!await showConfirm('确认删除', `确定删除 ${record.start_date} 的急性加重记录？`)) return;
    await deleteExacerbation(record.id);
    loadData();
  };

  const riskLevel = riskAssessment?.level ?? 'low';
  const goldGroup = riskAssessment?.goldGroup ?? 'A';

  const renderItem = ({ item }: { item: ExacerbationLog }) => (
    <TouchableOpacity
      onPress={() => router.push(`/record/exacerbation/${item.id}`)}
      activeOpacity={0.7}
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.dateRow}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#C62828" />
              <Text style={styles.date}>{item.start_date}</Text>
              <Text style={styles.duration}>持续 {item.duration_days} 天</Text>
            </View>
            <IconButton icon="delete" size={18} iconColor="#C62828" onPress={() => handleDelete(item)} />
          </View>
          <View style={styles.badges}>
            {item.hospitalized === 1 && (
              <Chip icon="hospital" style={styles.chipHospital} textStyle={styles.chipText}>住院</Chip>
            )}
            {item.used_antibiotics === 1 && (
              <Chip icon="pill" style={styles.chipMed} textStyle={styles.chipText}>抗生素</Chip>
            )}
            {item.used_oral_steroids === 1 && (
              <Chip icon="needle" style={styles.chipMed} textStyle={styles.chipText}>激素</Chip>
            )}
            {item.sputum_purulent === 1 && (
              <Chip icon="water" style={styles.chipSymp} textStyle={styles.chipText}>脓痰</Chip>
            )}
          </View>
          {item.notes ? <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text> : null}
          <Text style={styles.hint}>{t.common.detail}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 年度统计横幅 */}
      <View style={[styles.banner, riskLevel === 'high' ? styles.bannerHigh : riskLevel === 'medium' ? styles.bannerMed : styles.bannerLow]}>
        <MaterialCommunityIcons
          name={riskLevel === 'high' ? 'alert-octagon' : riskLevel === 'medium' ? 'alert' : 'check-circle'}
          size={24} color="#FFF"
        />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>
            GOLD {goldGroup} 组 · {riskLevel === 'high' ? '⚠️ 高风险' : riskLevel === 'medium' ? '⚡ 中风险' : '✅ 低风险'}
          </Text>
          <Text style={styles.bannerSub}>
            近1年急性加重 {riskAssessment?.exacerbationCount ?? 0} 次
            {riskAssessment?.wasHospitalized ? '（曾住院）' : ''}
            {riskAssessment?.catScore != null ? ` · CAT ${riskAssessment?.catScore}分` : ''}
          </Text>
          {riskAssessment?.summary ? (
            <Text style={styles.bannerSummary}>{riskAssessment.summary}</Text>
          ) : null}
        </View>
      </View>

      {records.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="alert-octagon" size={64} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>{t.list.empty}</Text>
          <Text style={styles.emptySubtitle}>{t.list.addHint}</Text>
        </View>
      ) : (
        <FlatList data={records} renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.list} />
      )}
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/record/exacerbation/add')} label="新增" />
      <FAB icon="camera" style={styles.photoFab} color="#fff" small onPress={() => router.push('/module-photos?module=exacerbation&moduleName=' + encodeURIComponent(t.exacerbation.title))} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 12, paddingBottom: 80 },
  banner: { flexDirection: 'row', alignItems: 'center', padding: 14, marginHorizontal: 12, marginTop: 12, borderRadius: 10, gap: 12 },
  bannerHigh: { backgroundColor: '#C62828' },
  bannerMed: { backgroundColor: '#E65100' },
  bannerLow: { backgroundColor: '#2E7D32' },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  bannerSummary: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontStyle: 'italic' },
  card: { marginBottom: 10, elevation: 2, borderLeftWidth: 4, borderLeftColor: '#C62828' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { fontSize: 16, fontWeight: 'bold', color: '#424242' },
  duration: { fontSize: 13, color: '#888' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chipHospital: { backgroundColor: '#FFCDD2', height: 28 },
  chipMed: { backgroundColor: '#C8E6C9', height: 28 },
  chipSymp: { backgroundColor: '#FFF9C4', height: 28 },
  chipText: { fontSize: 11 },
  notes: { fontSize: 13, color: '#888', marginTop: 6 },
  hint: { fontSize: 12, color: '#999', marginTop: 4, textAlign: 'right' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#424242', marginTop: 12 },
  emptySubtitle: { fontSize: 14, color: '#999', marginTop: 6 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
  photoFab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#2E7D32' },
});
