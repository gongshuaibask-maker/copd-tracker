// 急性加重 — 详情页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, IconButton, Surface, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import {
  getExacerbation, deleteExacerbation,
  getExacerbationCountLastYear,
} from '../../../src/database/repositories/exacerbationRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { ExacerbationLog } from '../../../src/types/models';

export default function ExacerbationDetailScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<ExacerbationLog | null>(null);
  const [yearCount, setYearCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getExacerbation(parseInt(id)),
      getExacerbationCountLastYear(),
    ]).then(([r, cnt]) => {
      setRecord(r);
      setYearCount(cnt);
    }).catch(console.error);
  }, [id]);

  const handleDelete = async () => {
    if (!record) return;
    if (!await showConfirm('确认删除', `确定删除 ${record.start_date} 的记录？`)) return;
    await deleteExacerbation(record.id);
    router.back();
  };

  if (!record) {
    return <View style={styles.loading}><Text>加载中...</Text></View>;
  }

  const severityLabel = (v: number) => ['', '轻微', '轻度', '中度', '较重', '严重'][v] ?? '未知';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 头部 */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.date}>{record.start_date}</Text>
              <Text style={styles.duration}>持续 {record.duration_days} 天</Text>
            </View>
            <View style={styles.headerActions}>
              <IconButton icon="pencil" size={20}
                onPress={() => router.push(`/record/exacerbation/add?id=${record.id}`)} />
              <IconButton icon="delete" size={20} iconColor="#C62828" onPress={handleDelete} />
            </View>
          </View>
          <View style={styles.badges}>
            {record.hospitalized === 1 && <Chip icon="hospital" style={styles.chipBadge}>住院</Chip>}
            {record.used_antibiotics === 1 && <Chip icon="pill" style={styles.chipBadge}>抗生素</Chip>}
            {record.used_oral_steroids === 1 && <Chip icon="needle" style={styles.chipBadge}>口服激素</Chip>}
            {record.sputum_purulent === 1 && <Chip icon="water" style={styles.chipBadge}>脓痰</Chip>}
          </View>
        </Card.Content>
      </Card>

      {/* 症状严重程度 */}
      <Surface style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <MaterialCommunityIcons name="lungs" size={24} color="#C62828" />
          <Text style={styles.metricTitle}>症状严重程度</Text>
        </View>
        <View style={styles.severityRow}>
          <View style={styles.severityItem}>
            <Text style={styles.severityLabel}>气短</Text>
            <Text style={styles.severityValue}>{severityLabel(record.symptoms_increased_breathless ?? 0)}</Text>
          </View>
          <View style={styles.severityItem}>
            <Text style={styles.severityLabel}>痰量</Text>
            <Text style={styles.severityValue}>{severityLabel(record.sputum_volume_increased ?? 0)}</Text>
          </View>
          <View style={styles.severityItem}>
            <Text style={styles.severityLabel}>脓痰</Text>
            <Text style={styles.severityValue}>{record.sputum_purulent ? '是' : '否'}</Text>
          </View>
        </View>
      </Surface>

      {/* 治疗措施 */}
      <Surface style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <MaterialCommunityIcons name="medical-bag" size={24} color="#00695C" />
          <Text style={styles.metricTitle}>治疗措施</Text>
        </View>
        <View style={styles.treatRow}>
          <View style={[styles.treatItem, record.used_antibiotics ? styles.treatYes : styles.treatNo]}>
            <MaterialCommunityIcons name={record.used_antibiotics ? 'check-circle' : 'close-circle'} size={18}
              color={record.used_antibiotics ? '#2E7D32' : '#999'} />
            <Text style={[styles.treatLabel, record.used_antibiotics ? null : styles.treatLabelNo]}>抗生素</Text>
          </View>
          <View style={[styles.treatItem, record.used_oral_steroids ? styles.treatYes : styles.treatNo]}>
            <MaterialCommunityIcons name={record.used_oral_steroids ? 'check-circle' : 'close-circle'} size={18}
              color={record.used_oral_steroids ? '#2E7D32' : '#999'} />
            <Text style={[styles.treatLabel, record.used_oral_steroids ? null : styles.treatLabelNo]}>口服激素</Text>
          </View>
          <View style={[styles.treatItem, record.hospitalized ? styles.treatYes : styles.treatNo]}>
            <MaterialCommunityIcons name={record.hospitalized ? 'check-circle' : 'close-circle'} size={18}
              color={record.hospitalized ? '#C62828' : '#999'} />
            <Text style={[styles.treatLabel, record.hospitalized ? null : styles.treatLabelNo]}>住院</Text>
          </View>
        </View>
      </Surface>

      {/* 年度统计 */}
      <Surface style={styles.statsCard}>
        <MaterialCommunityIcons name="calendar-clock" size={22} color="#1565C0" />
        <Text style={styles.statsText}>近 1 年急性加重次数：<Text style={styles.statsCount}>{yearCount}</Text> 次</Text>
      </Surface>

      {record.notes ? (
        <Card style={styles.notesCard}>
          <Card.Content>
            <Text style={styles.notesLabel}>备注</Text>
            <Text style={styles.notesText}>{record.notes}</Text>
          </Card.Content>
        </Card>
      ) : null}

      <Button mode="outlined" icon="pencil"
        onPress={() => router.push(`/record/exacerbation/add?id=${record.id}`)}
        style={styles.editButton}>编辑记录</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerCard: { marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 18, fontWeight: 'bold', color: '#424242' },
  duration: { fontSize: 14, color: '#666', marginTop: 4 },
  headerActions: { flexDirection: 'row' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chipBadge: { height: 28, backgroundColor: '#FFCDD2' },
  metricCard: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, backgroundColor: '#FFF' },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  metricTitle: { fontSize: 16, fontWeight: '600', color: '#424242' },
  severityRow: { flexDirection: 'row', justifyContent: 'space-around' },
  severityItem: { alignItems: 'center' },
  severityLabel: { fontSize: 13, color: '#666' },
  severityValue: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 4 },
  treatRow: { flexDirection: 'row', gap: 10 },
  treatItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, gap: 4 },
  treatYes: { backgroundColor: '#E8F5E9' },
  treatNo: { backgroundColor: '#F5F5F5' },
  treatLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  treatLabelNo: { color: '#999' },
  statsCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 12, backgroundColor: '#E3F2FD', gap: 8 },
  statsText: { fontSize: 15, color: '#333' },
  statsCount: { fontSize: 20, fontWeight: 'bold', color: '#C62828' },
  notesCard: { marginBottom: 12 },
  notesLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 4 },
  notesText: { fontSize: 15, color: '#333' },
  editButton: { marginTop: 8, borderRadius: 8 },
});
