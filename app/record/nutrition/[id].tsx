// 营养体重记录 — 详情页
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, IconButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getNutritionRecord, deleteNutritionRecord } from '../../../src/database/repositories/nutritionRepo';
import { showConfirm } from '../../../src/utils/confirm';
import type { NutritionWeight } from '../../../src/types/models';

export default function NutritionDetailScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<NutritionWeight | null>(null);

  useEffect(() => {
    if (!id) return;
    getNutritionRecord(parseInt(id)).then(setRecord).catch(console.error);
  }, [id]);

  const handleDelete = async () => {
    if (!record) return;
    if (!await showConfirm('确认删除', `确定删除 ${record.record_date} 的营养体重记录？此操作不可撤销。`)) return;
    await deleteNutritionRecord(record.id);
    router.back();
  };

  const getBmiCategory = (bmi: number): { label: string; color: string } => {
    if (bmi < 18.5) return { label: '偏瘦', color: '#FF9800' };
    if (bmi < 24) return { label: '正常', color: '#4CAF50' };
    if (bmi < 28) return { label: '超重', color: '#FF9800' };
    return { label: '肥胖', color: '#F44336' };
  };

  if (!record) {
    return (
      <View style={styles.loading}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 日期 */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text style={styles.date}>{record.record_date}</Text>
            <View style={styles.headerActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => router.push(`/record/nutrition/add?id=${record.id}`)}
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

      {/* 体重 */}
      <Surface style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <MaterialCommunityIcons name="scale-bathroom" size={28} color="#E65100" />
          <Text style={styles.metricTitle}>体重</Text>
        </View>
        {record.weight_kg != null ? (
          <Text style={styles.metricValue}>{record.weight_kg} kg</Text>
        ) : (
          <Text style={styles.noData}>未记录</Text>
        )}
      </Surface>

      {/* BMI */}
      <Surface style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <MaterialCommunityIcons name="calculator" size={28} color="#1565C0" />
          <Text style={styles.metricTitle}>BMI</Text>
        </View>
        {record.bmi != null ? (
          <View>
            <Text style={styles.metricValue}>{record.bmi}</Text>
            <Text style={[styles.bmiLabel, { color: getBmiCategory(record.bmi).color }]}>
              {getBmiCategory(record.bmi).label}
            </Text>
          </View>
        ) : (
          <Text style={styles.noData}>未计算（需档案身高）</Text>
        )}
      </Surface>

      {/* 白蛋白 */}
      <Surface style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <MaterialCommunityIcons name="test-tube" size={28} color="#2E7D32" />
          <Text style={styles.metricTitle}>白蛋白</Text>
        </View>
        {record.albumin != null ? (
          <>
            <Text style={styles.metricValue}>{record.albumin} g/L</Text>
            <Text style={styles.normalRange}>正常范围：35-55 g/L</Text>
          </>
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
        onPress={() => router.push(`/record/nutrition/add?id=${record.id}`)}
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
  headerActions: { flexDirection: 'row' },
  metricCard: { padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, backgroundColor: '#FFF' },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  metricTitle: { fontSize: 16, fontWeight: '600', color: '#424242' },
  metricValue: { fontSize: 36, fontWeight: 'bold', color: '#333' },
  bmiLabel: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  noData: { fontSize: 16, color: '#999' },
  normalRange: { fontSize: 13, color: '#888', marginTop: 4 },
  notesCard: { marginBottom: 12 },
  notesLabel: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 4 },
  notesText: { fontSize: 15, color: '#333' },
  editButton: { marginTop: 8, borderRadius: 8 },
});
