import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { CAT_QUESTIONS, MMRC_GRADES, getCATLevel } from '../../../src/constants/catQuestions';
import { getSymptomScore } from '../../../src/database/repositories/symptomRepo';
import { Colors, Spacing, Radius, Shadow, FontSize } from '../../../src/theme/visual-tokens';
import type { SymptomScore } from '../../../src/types/models';

export default function SymptomDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [record, setRecord] = useState<SymptomScore | null>(null);

  useEffect(() => {
    if (!id) return;
    getSymptomScore(parseInt(id, 10)).then(setRecord).catch(console.error);
  }, [id]);

  if (!record) {
    return <Text style={styles.empty}>加载中...</Text>;
  }

  const level = getCATLevel(record.cat_total);
  const catColor = record.cat_total <= 10 ? Colors.success : record.cat_total <= 20 ? Colors.warning : Colors.error;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 总览卡片 — 带左边框颜色指示 */}
      <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: catColor }]}>
        <Card.Content>
          <Text style={styles.date}>{record.record_date}</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>CAT 总分</Text>
            <Text style={[styles.scoreValue, { color: catColor }]}>{record.cat_total}<Text style={styles.scoreUnit}> /40</Text></Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.levelBadge, { backgroundColor: catColor + '18' }]}>
              <Text style={[styles.levelText, { color: catColor }]}>{level.level}</Text>
            </View>
            <Text style={styles.meta}>mMRC {record.mmrc_grade ?? 0} 级</Text>
          </View>
          {record.notes ? <Text style={styles.notes}>📝 {record.notes}</Text> : null}
        </Card.Content>
      </Card>

      {/* CAT 题目得分 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🧪 CAT 题目得分</Text>
          {CAT_QUESTIONS.map((q, i) => {
            const rawScore = record[q.id as keyof SymptomScore];
            const score = typeof rawScore === 'number' ? rawScore : 0;
            const qColor = score <= 1 ? Colors.success : score <= 3 ? Colors.warning : Colors.error;
            return (
              <View key={q.id} style={[styles.row, i < CAT_QUESTIONS.length - 1 && styles.rowBorder]}>
                <Text style={styles.qText}>{q.text}</Text>
                <View style={[styles.scoreChip, { backgroundColor: qColor + '15' }]}>
                  <Text style={[styles.qScore, { color: qColor }]}>{score} 分</Text>
                </View>
              </View>
            );
          })}
        </Card.Content>
      </Card>

      {/* mMRC 分级说明 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🫁 mMRC {record.mmrc_grade ?? 0} 级</Text>
          {MMRC_GRADES[record.mmrc_grade ?? 0]?.description && (
            <Text style={styles.mmrcDesc}>{MMRC_GRADES[record.mmrc_grade ?? 0].description}</Text>
          )}
        </Card.Content>
      </Card>

      {/* 急性加重史 */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>⚠️ 过去 12 个月急性加重史</Text>
          <View style={styles.exacRow}>
            <Text style={styles.exacLabel}>急性加重次数</Text>
            <View style={[styles.scoreChip, { backgroundColor: (record.exacerbation_count ?? 0) > 0 ? Colors.errorBg : Colors.successBg }]}>
              <Text style={[styles.qScore, { color: (record.exacerbation_count ?? 0) > 0 ? Colors.error : Colors.success }]}>{record.exacerbation_count ?? 0} 次</Text>
            </View>
          </View>
          <View style={[styles.exacRow, { marginTop: Spacing.sm }]}>
            <Text style={styles.exacLabel}>是否因加重住院</Text>
            <View style={[styles.scoreChip, { backgroundColor: record.exacerbation_hospitalized ? Colors.errorBg : Colors.successBg }]}>
              <Text style={[styles.qScore, { color: record.exacerbation_hospitalized ? Colors.error : Colors.success }]}>{record.exacerbation_hospitalized ? '是' : '否'}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  card: { borderRadius: Radius.md, backgroundColor: Colors.surface, marginBottom: Spacing.md, ...Shadow.card },
  date: { fontSize: FontSize.h2, fontWeight: '700', color: Colors.textHigh },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: Spacing.md },
  scoreLabel: { fontSize: FontSize.caption, color: Colors.textMed },
  scoreValue: { fontSize: 34, fontWeight: '700' },
  scoreUnit: { fontSize: 16, fontWeight: '400', color: Colors.textLow },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  levelText: { fontSize: FontSize.caption, fontWeight: '600' },
  meta: { fontSize: FontSize.caption, color: Colors.textMed },
  notes: { fontSize: FontSize.caption, color: Colors.textMed, marginTop: Spacing.md, lineHeight: 20, backgroundColor: Colors.autoCalcBg, padding: Spacing.sm, borderRadius: Radius.sm },
  sectionTitle: { fontSize: FontSize.body, fontWeight: '700', color: Colors.textHigh, marginBottom: Spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  qText: { flex: 1, fontSize: FontSize.caption, color: Colors.textMed, lineHeight: 18 },
  scoreChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  qScore: { fontSize: FontSize.caption, fontWeight: '600' },
  mmrcDesc: { fontSize: FontSize.caption, color: Colors.textMed, lineHeight: 20 },
  exacRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exacLabel: { fontSize: FontSize.caption, color: Colors.textMed },
  empty: { padding: Spacing.xxl, color: Colors.textLow },
});
