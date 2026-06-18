// 肺功能检查 — 详情页（四级分层展示 + 智能判断 + 照片查看）
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Card, IconButton, Divider, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useT } from '../../../src/i18n';
import { getPulmonaryRecord, deletePulmonaryRecord } from '../../../src/database/repositories/pulmonaryRepo';
import { PULMONARY_INDICATORS, PULMONARY_LEVELS } from '../../../src/constants/pulmonaryIndicators';
import { getIndicatorStatus } from '../../../src/constants/normalRanges';
import type { PulmonaryFunctionRecord, PulmonaryFunctionDetail } from '../../../src/types/models';

const STATUS_CONFIG = {
  normal:    { icon: '✅', color: '#2E7D32', label: '正常' },
  borderline:{ icon: '⚠️', color: '#F57F17', label: '临界' },
  abnormal:  { icon: '🔴', color: '#C62828', label: '异常' },
  unknown:   { icon: '—', color: '#9E9E9E', label: '未检' },
};

// 智能判断
function getJudgments(details: PulmonaryFunctionDetail[]) {
  const judgments: string[] = [];
  const fev1 = details.find((d) => d.indicator_key === 'fev1');
  const fev1Fvc = details.find((d) => d.indicator_key === 'fev1_fvc_ratio');
  const fev1Pred = details.find((d) => d.indicator_key === 'fev1_predicted_pct');
  const rvTlc = details.find((d) => d.indicator_key === 'rv_tlc_ratio');
  const dlco = details.find((d) => d.indicator_key === 'dlco');

  // 舒张试验阳性？
  if (fev1?.improvement_rate !== null && fev1?.improvement_rate !== undefined) {
    const improvement = fev1.improvement_rate;
    const absoluteChange = fev1.post_actual !== null && fev1.pre_actual !== null
      ? (fev1.post_actual - fev1.pre_actual) * 1000 : 0; // 转为 mL
    if (improvement >= 12 && absoluteChange >= 200) {
      judgments.push('💡 FEV₁ 支气管舒张试验阳性（改善率≥12%且绝对值增加≥200mL），提示存在一定可逆性气流受限，建议结合临床综合判断');
    }
  }
  // FVC 舒张试验阳性（ATS/ERS 标准：FVC改善≥12%且≥200mL）
  const fvc = details.find((d) => d.indicator_key === 'fvc');
  if (fvc?.improvement_rate !== null && fvc?.improvement_rate !== undefined && fvc?.post_actual !== null && fvc?.pre_actual !== null) {
    const fvcImprovement = fvc.improvement_rate;
    const fvcAbsChange = (fvc.post_actual - fvc.pre_actual) * 1000;
    if (fvcImprovement >= 12 && fvcAbsChange >= 200) {
      judgments.push('💡 FVC 支气管舒张试验阳性（改善率≥12%且绝对值增加≥200mL），提示存在一定可逆性，建议结合临床综合判断');
    }
  }

  if (fev1Fvc && fev1Fvc.pre_actual !== null && fev1Fvc.pre_actual < 70) {
    judgments.push('🔴 存在阻塞性通气功能障碍（FEV₁/FVC < 70%）');
  }

  if (fev1Pred && fev1Pred.pre_actual !== null && fev1Pred.pre_actual < 80) {
    const pct = fev1Pred.pre_actual;
    if (pct >= 50) judgments.push(`⚠️ 肺功能中度受损（FEV₁%pred = ${pct}%，GOLD 2 级）`);
    else if (pct >= 30) judgments.push(`🔴 肺功能重度受损（FEV₁%pred = ${pct}%，GOLD 3 级）`);
    else judgments.push(`🔴 肺功能极重度受损（FEV₁%pred = ${pct}%，GOLD 4 级）`);
  }

  if (rvTlc && rvTlc.pre_actual !== null && rvTlc.pre_actual >= 40) {
    judgments.push('🔴 残总比升高（RV/TLC% ≥ 40%），符合肺气肿表现');
  }

  if (dlco && dlco.pre_actual !== null && dlco.pre_actual < 80) {
    judgments.push('⚠️ 弥散功能下降（DLCO < 80%预计值），提示肺泡气体交换受损');
  }

  return judgments;
}

export default function PulmonaryDetailScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<PulmonaryFunctionRecord | null>(null);
  const [judgments, setJudgments] = useState<string[]>([]);
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([1, 2, 3, 4]));

  useEffect(() => {
    if (!id) return;
    getPulmonaryRecord(parseInt(id)).then((r) => {
      if (r) {
        setRecord(r);
        setJudgments(getJudgments(r.details));
      }
    });
  }, [id]);

  const handleDelete = () => {
    if (!record) return;
    Alert.alert(
      '确认删除',
      `确定删除 ${record.record_date} 的肺功能检查记录？此操作不可撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除', style: 'destructive',
          onPress: async () => {
            await deletePulmonaryRecord(record.id);
            router.back();
          },
        },
      ]
    );
  };

  const toggleLevel = (level: number) => {
    setExpandedLevels((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  };

  if (!record) {
    return (
      <View style={styles.loading}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const getDetailByKey = (key: string) =>
    record.details.find((d) => d.indicator_key === key);

  const renderDetailRows = (detail: PulmonaryFunctionDetail | undefined, _key: string) => {
    if (!detail) {
      return <Text style={styles.noData}>未检测</Text>;
    }
    const def = PULMONARY_INDICATORS[detail.indicator_key];
    const status = getIndicatorStatus(detail.indicator_key, detail.pre_actual);
    const statusCfg = STATUS_CONFIG[status];

    if (!def?.hasBronchodilator) {
      // 简单指标：只显示用药前实测
      return (
        <View style={styles.simpleRow}>
          <Text style={styles.simpleValue}>
            {detail.pre_actual !== null ? `${detail.pre_actual} ${def?.unit ?? ''}` : '—'}
          </Text>
          <Text style={[styles.statusBadge, { color: statusCfg.color }]}>
            {statusCfg.icon} {statusCfg.label}
          </Text>
        </View>
      );
    }

    // 完整 6 子字段展示
    return (
      <View style={styles.tableWrap}>
        <View style={styles.tableRow}>
          <Text style={styles.th}>预计值</Text>
          <Text style={styles.th}>用药前</Text>
          <Text style={styles.th}>前占%</Text>
          <Text style={styles.th}>用药后</Text>
          <Text style={styles.th}>后占%</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.td}>{detail.predicted_value ?? '—'}</Text>
          <Text style={styles.td}>{detail.pre_actual ?? '—'}</Text>
          <Text style={[styles.td, detail.pre_pct_predicted !== null && detail.pre_pct_predicted < 80 ? styles.abnormal : {}]}>
            {detail.pre_pct_predicted?.toFixed(1) ?? '—'}
          </Text>
          <Text style={styles.td}>{detail.post_actual ?? '—'}</Text>
          <Text style={styles.td}>{detail.post_pct_predicted?.toFixed(1) ?? '—'}</Text>
        </View>
        {detail.improvement_rate !== null && (
          <View style={styles.improvementFooter}>
            <Text style={styles.improvementLabel}>改善率：</Text>
            <Text style={[
              styles.improvementValue,
              detail.improvement_rate >= 12 ? styles.improvementPositive : {},
            ]}>
              {detail.improvement_rate.toFixed(1)}%
            </Text>
            <Text style={[styles.statusBadge, { color: statusCfg.color, marginLeft: 8 }]}>
              {statusCfg.icon} {statusCfg.label}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* 头部信息 */}
      <Surface style={styles.header} elevation={0}>
        <View style={styles.headerRow}>
          <Text style={styles.date}>📅 {record.record_date}</Text>
          <View style={styles.headerActions}>
            <IconButton icon="pencil" size={20} onPress={() => router.push(`/record/pulmonary/add?id=${record.id}`)} />
            <IconButton icon="delete" size={20} iconColor="#C62828" onPress={handleDelete} />
          </View>
        </View>
        {record.notes ? <Text style={styles.notes}>📝 {record.notes}</Text> : null}
      </Surface>

      {/* 智能判断 */}
      {judgments.length > 0 && (
        <Card style={styles.judgmentCard}>
          <Card.Content>
            <Text style={styles.judgmentTitle}>📋 智能分析</Text>
            {judgments.map((j, i) => (
              <Text key={i} style={styles.judgmentItem}>{j}</Text>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* 四级分层展示 */}
      {PULMONARY_LEVELS.map((levelDef) => {
        const isExpanded = expandedLevels.has(levelDef.level);
        return (
          <View key={levelDef.level}>
            <TouchableOpacity
              style={styles.levelHeader}
              onPress={() => toggleLevel(levelDef.level)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-down' : 'chevron-right'}
                size={22}
                color="#2E7D32"
              />
              <Text style={styles.levelTitle}>{levelDef.title}</Text>
              <Text style={styles.levelSubtitle}>{levelDef.subtitle}</Text>
            </TouchableOpacity>

            {isExpanded && (
              <Card style={styles.levelCard}>
                <Card.Content>
                  {levelDef.keys.map((key) => {
                    const detail = getDetailByKey(key);
                    const def = PULMONARY_INDICATORS[key];
                    return (
                      <View key={key} style={styles.indicatorBlock}>
                        <View style={styles.indicatorHeader}>
                          <Text style={styles.indicatorLabel}>
                            {def.label}（{def.name}）
                          </Text>
                          <Text style={styles.unit}>{def.unit}</Text>
                        </View>
                        {renderDetailRows(detail, key)}
                        <Divider style={styles.indicatorDivider} />
                      </View>
                    );
                  })}
                </Card.Content>
              </Card>
            )}
          </View>
        );
      })}

      {/* 原始照片 */}
      {record.photo_uri ? (
        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>📷 原始报告照片</Text>
          <TouchableOpacity>
            <Image source={{ uri: record.photo_uri }} style={styles.reportImage} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: '#C8E6C9' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  headerActions: { flexDirection: 'row' },
  notes: { fontSize: 13, color: '#424242', marginTop: 6 },
  // 智能判断
  judgmentCard: { margin: 16, backgroundColor: '#FFF8E1', borderRadius: 10 },
  judgmentTitle: { fontSize: 15, fontWeight: 'bold', color: '#E65100', marginBottom: 8 },
  judgmentItem: { fontSize: 13, color: '#424242', marginBottom: 4, lineHeight: 19 },
  // 级别
  levelHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  levelTitle: { fontSize: 15, fontWeight: 'bold', color: '#2E7D32', marginLeft: 4, flex: 1 },
  levelSubtitle: { fontSize: 11, color: '#999' },
  levelCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 10 },
  // 指标块
  indicatorBlock: { marginBottom: 8 },
  indicatorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  indicatorLabel: { fontSize: 13, fontWeight: 'bold', color: '#424242' },
  unit: { fontSize: 11, color: '#999' },
  indicatorDivider: { marginTop: 8 },
  noData: { fontSize: 13, color: '#BDBDBD', fontStyle: 'italic' },
  simpleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  simpleValue: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  statusBadge: { fontSize: 12 },
  // 表格
  tableWrap: { marginTop: 4 },
  tableRow: { flexDirection: 'row', gap: 4, marginBottom: 2 },
  th: { flex: 1, fontSize: 11, color: '#999', textAlign: 'center' },
  td: { flex: 1, fontSize: 14, color: '#212121', textAlign: 'center' },
  abnormal: { color: '#C62828', fontWeight: 'bold' },
  improvementFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  improvementLabel: { fontSize: 12, color: '#666' },
  improvementValue: { fontSize: 16, fontWeight: 'bold', color: '#424242' },
  improvementPositive: { color: '#E65100' },
  // 照片
  photoSection: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#424242', marginBottom: 8 },
  reportImage: { width: '100%', height: 200, borderRadius: 10, backgroundColor: '#E0E0E0' },
});
