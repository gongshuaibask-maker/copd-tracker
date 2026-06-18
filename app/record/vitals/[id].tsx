// 日常指脉氧记录 — 详情页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, IconButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getVitalsRecord, deleteVitalsRecord } from '../../../src/database/repositories/vitalsRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { DailyVitals } from '../../../src/types/models';

export default function VitalsDetailScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<DailyVitals | null>(null);

  useEffect(() => {
    if (!id) return;
    getVitalsRecord(parseInt(id)).then(setRecord).catch(console.error);
  }, [id]);

  const handleDelete = async () => {
    if (!record) return;
    if (!await showConfirm('确认删除', `确定删除 ${record.record_date} 的氧合呼吸记录？此操作不可撤销。`)) return;
    await deleteVitalsRecord(record.id);
    router.back();
  };

  if (!record) {
    return (
      <View style={styles.loading}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const isLowSpO2 = record.spo2 != null && record.spo2 < 90;
  const isHighHR = record.heart_rate != null && record.heart_rate > 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 日期和时段 */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.date}>{record.record_date}</Text>
              <Text style={styles.timeLabel}>
                {record.measurement_time === 'morning' ? '🌅 晨起测量' : '🌇 晚间测量'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => router.push(`/record/vitals/add?id=${record.id}`)}
              />
              <IconButton
                icon="delete"
                size={20}
                iconColor="#C62828"
                onPress={handleDelete}
              />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* SpO₂ */}
      <Surface style={[styles.metricCard, isLowSpO2 ? styles.warningCard : null]}>
        <View style={styles.metricHeader}>
          <MaterialCommunityIcons name="molecule" size={28} color="#1565C0" />
          <Text style={styles.metricTitle}>血氧饱和度 SpO₂</Text>
        </View>
        {record.spo2 != null ? (
          <>
            <Text style={[styles.metricValue, isLowSpO2 ? styles.warningText : null]}>
              {record.spo2}%
            </Text>
            {isLowSpO2 && (
              <Text style={styles.warningHint}>⚠️ SpO₂ 低于 90%，请注意休息，必要时就医</Text>
            )}
          </>
        ) : (
          <Text style={styles.noData}>未记录</Text>
        )}
      </Surface>

      {/* 心率 */}
      <Surface style={[styles.metricCard, isHighHR ? styles.warningCard : null]}>
        <View style={styles.metricHeader}>
          <MaterialCommunityIcons name="heart-pulse" size={28} color="#C62828" />
          <Text style={styles.metricTitle}>心率</Text>
        </View>
        {record.heart_rate != null ? (
          <>
            <Text style={[styles.metricValue, isHighHR ? styles.warningText : null]}>
              {record.heart_rate} bpm
            </Text>
            {isHighHR && (
              <Text style={styles.warningHint}>⚠️ 心率超过 100 bpm（心动过速），请关注</Text>
            )}
          </>
        ) : (
          <Text style={styles.noData}>未记录</Text>
        )}
      </Surface>

      {/* 呼吸频率 */}
      <Surface style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <MaterialCommunityIcons name="lungs" size={28} color="#2E7D32" />
          <Text style={styles.metricTitle}>呼吸频率</Text>
        </View>
        {record.respiratory_rate != null ? (
          <Text style={styles.metricValue}>{record.respiratory_rate} 次/分</Text>
        ) : (
          <Text style={styles.noData}>未记录</Text>
        )}
      </Surface>

      {/* 备注 */}
      {record.notes ? (
        <Card style={styles.notesCard}>
          <Card.Content>
            <Text style={styles.notesLabel}>备注</Text>
            <Text style={styles.notesText}>{record.notes}</Text>
          </Card.Content>
        </Card>
      ) : null}

      {/* 底部按钮 */}
      <Button
        mode="outlined"
        icon="pencil"
        onPress={() => router.push(`/record/vitals/add?id=${record.id}`)}
        style={styles.editButton}
      >
        编辑记录
      </Button>
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
  timeLabel: { fontSize: 14, color: '#666', marginTop: 4 },
  headerActions: { flexDirection: 'row' },
  metricCard: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, backgroundColor: '#FFF' },
  warningCard: { backgroundColor: '#FFF3E0' },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  metricTitle: { fontSize: 16, fontWeight: '600', color: '#424242' },
  metricValue: { fontSize: 36, fontWeight: 'bold', color: '#333' },
  warningText: { color: '#E65100' },
  warningHint: { fontSize: 13, color: '#E65100', marginTop: 6 },
  noData: { fontSize: 16, color: '#999' },
  notesCard: { marginBottom: 12 },
  notesLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 4 },
  notesText: { fontSize: 15, color: '#333' },
  editButton: { marginTop: 8, borderRadius: 8 },
});
