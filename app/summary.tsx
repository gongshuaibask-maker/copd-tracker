// 患者疾病总结 — 每模块只取最近一次检查结果，客观展示
import React, { useCallback, useState } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
} from 'react-native';
import { Text, Card, Surface, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useT } from '../src/i18n';
import { getPatientSummary, type PatientSummary, type PulmonarySummaryData } from '../src/services/summaryService';
import { getIndicatorStatus } from '../src/constants/normalRanges';
import { PULMONARY_INDICATORS } from '../src/constants/pulmonaryIndicators';
import { Colors, Spacing, Radius, Shadow, FontSize } from '../src/theme/visual-tokens';

/** 显示格式化的数值，null 显示 "—" */
const V = (v: number | null | undefined): string => v != null ? String(v) : '—';

/** 数值圆整 */
const F = (v: number | null | undefined): string => v != null ? String(Math.round(v * 100) / 100) : '—';

/** 判断是否异常并返回颜色 */
function getValueColor(indicatorKey: string, value: number | null | undefined): string {
  if (value == null) return Colors.textLow;
  const status = getIndicatorStatus(indicatorKey, value);
  if (status === 'abnormal') return Colors.error;
  if (status === 'borderline') return Colors.warning;
  return Colors.textHigh;
}

/** 肺功能指标的 6 子字段颜色 */
function getSubFieldColor(key: string, subKey: string, value: number | null | undefined): string {
  if (value == null) return '#9E9E9E';
  // FEV₁/FVC 和 FEV₁%pred 用特定 key 判断
  const indicatorKey =
    key === 'fev1_fvc_ratio' ? 'fev1_fvc_ratio' :
    key === 'fev1_predicted_pct' ? 'fev1_predicted_pct' :
    key === 'dlco' ? 'dlco' :
    key === 'rv_tlc_ratio' ? 'rv_tlc_ratio' :
    // 用药后改善率
    subKey === 'improvement_rate' ? 'bronchodilator_improvement' :
    // 其他一级指标走 pre_actual（FEV₁/FVC等）
    key;
  const status = getIndicatorStatus(indicatorKey, value);
  if (status === 'abnormal') return '#C62828';
  if (status === 'borderline') return '#F57F17';
  return '#424242';
}

// ==================== 数据行组件 ====================
function DataRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  // 如果数值为 '—'（表示无数据）且没有异常颜色标记，则该行不显示
  if (value.startsWith('—') && valueColor === undefined) return null;
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={[styles.dataValue, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
    </View>
  );
}

function SectionHeader({ icon, title, date }: { icon: string; title: string; date: string | null }) {
  return (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon as any} size={22} color="#2E7D32" />
      <Text style={styles.sectionTitle}>{title}</Text>
      {date && <Text style={styles.sectionDate}>{date}</Text>}
    </View>
  );
}

// ==================== 模块卡片组件 ====================

/** 肺功能卡片（四级分层展示） */
function PulmonaryCard({ data }: { data: PulmonarySummaryData }) {
  if (!data || !data.indicators || data.indicators.length === 0) return null;

  // 按级别分组
  const byLevel = new Map<number, typeof data.indicators>();
  for (const ind of data.indicators) {
    const list = byLevel.get(ind.indicator_level) || [];
    list.push(ind);
    byLevel.set(ind.indicator_level, list);
  }

  const s = useT().summaryExtra;
  const levelNames: Record<number, string> = {
    1: s.level1,
    2: s.level2,
    3: s.level3,
    4: s.level4,
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="lungs" title={s.pulmonaryCard} date={data.recordDate} />

        {data.conclusion ? (
          <View style={styles.conclusionBox}>
            <Text style={styles.conclusionLabel}>📋 报告结论</Text>
            <Text style={styles.conclusionText}>{data.conclusion}</Text>
          </View>
        ) : null}

        {Array.from(byLevel.entries()).map(([level, indicators]) => (
          <View key={level} style={styles.levelGroup}>
            <Text style={styles.levelTitle}>{levelNames[level] || `第${level}级`}</Text>
            {indicators.map((ind) => {
              const def = PULMONARY_INDICATORS[ind.indicator_key];
              if (!def) return null;
              const name = `${def.label} (${def.name})`;
              const unit = def.unit;

              return (
                <View key={ind.id} style={styles.indicatorBlock}>
                  <Text style={styles.indicatorName}>{name}</Text>
                  <View style={styles.subFields}>
                    {ind.predicted_value != null && (
                      <View style={styles.subField}>
                        <Text style={styles.subLabel}>{s.predicted}</Text>
                        <Text style={[styles.subValue, { color: getSubFieldColor(ind.indicator_key, 'predicted_value', ind.predicted_value) }]}>
                          {F(ind.predicted_value)} {unit}
                        </Text>
                      </View>
                    )}
                    {ind.pre_actual != null && (
                      <View style={styles.subField}>
                        <Text style={styles.subLabel}>{s.preActual}</Text>
                        <Text style={[styles.subValue, { color: getSubFieldColor(ind.indicator_key, 'pre_actual', ind.pre_actual) }]}>
                          {F(ind.pre_actual)} {unit}
                        </Text>
                      </View>
                    )}
                    {ind.pre_pct_predicted != null && (
                      <View style={styles.subField}>
                        <Text style={styles.subLabel}>{s.pctPredicted}</Text>
                        <Text style={[styles.subValue, { color: getSubFieldColor(ind.indicator_key, 'pre_pct_predicted', ind.pre_pct_predicted) }]}>
                          {F(ind.pre_pct_predicted)}%
                        </Text>
                      </View>
                    )}
                    {ind.post_actual != null && (
                      <View style={styles.subField}>
                        <Text style={styles.subLabel}>{s.postActual}</Text>
                        <Text style={[styles.subValue, { color: getSubFieldColor(ind.indicator_key, 'post_actual', ind.post_actual) }]}>
                          {F(ind.post_actual)} {unit}
                        </Text>
                      </View>
                    )}
                    {ind.post_pct_predicted != null && (
                      <View style={styles.subField}>
                        <Text style={styles.subLabel}>{s.postPctPredicted}</Text>
                        <Text style={[styles.subValue, { color: getSubFieldColor(ind.indicator_key, 'post_pct_predicted', ind.post_pct_predicted) }]}>
                          {F(ind.post_pct_predicted)}%
                        </Text>
                      </View>
                    )}
                    {ind.improvement_rate != null && (
                      <View style={styles.subField}>
                        <Text style={styles.subLabel}>{s.improvement}</Text>
                        <Text style={[
                          styles.subValue,
                          { color: ind.improvement_rate >= 12 ? '#E65100' : '#424242' },
                        ]}>
                          {F(ind.improvement_rate)}%
                          {ind.improvement_rate >= 12 && ' ⚠️'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

/** 气道炎症卡片 */
function InflammationCard({ data }: { data: PatientSummary['inflammation'] }) {
  if (!data.data) return null;
  const d = data.data;
  const s = useT().summaryExtra;
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="flask" title={s.inflammationCard} date={data.recordDate} />
        <DataRow label="FeNO" value={`${V(d.feno_ppb)} ppb`} valueColor={d.feno_ppb != null ? getValueColor('feno_ppb', d.feno_ppb) : undefined} />
        <DataRow label={s.bloodEos} value={`${V(d.blood_eos)} ×10⁹/L`} valueColor={d.blood_eos != null ? getValueColor('blood_eos', d.blood_eos) : undefined} />
        <DataRow label={s.sputumEos} value={`${V(d.sputum_eos_pct)}%`} />
        <DataRow label={s.sputumNeut} value={`${V(d.sputum_neut_pct)}%`} />
      </Card.Content>
    </Card>
  );
}

/** 症状评分卡片 */
function SymptomCard({ data }: { data: PatientSummary['symptom'] }) {
  if (!data.data) return null;
  const d = data.data;
  const catColor = d.catTotal <= 10 ? Colors.success : d.catTotal <= 20 ? Colors.warning : Colors.error;
  const s = useT().summaryExtra;
  return (
    <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: catColor }]}>
      <Card.Content>
        <SectionHeader icon="clipboard-list" title={s.symptomCard} date={data.recordDate} />
        <DataRow label={s.catTotal} value={`${d.catTotal}/40`} valueColor={catColor} />
        {d.mmrcGrade != null && <DataRow label={s.mmrcGrade} value={`${d.mmrcGrade}`} />}
        <DataRow label={s.exacerbationCount} value={`${d.exacerbationCount} 次`} />
        <DataRow label={s.exacerbationHospitalized} value={d.exacerbationHospitalized ? '是' : '否'} />
      </Card.Content>
    </Card>
  );
}

/** 运动耐力卡片 */
function ExerciseCard({ data }: { data: PatientSummary['exercise'] }) {
  if (!data.data) return null;
  const d = data.data;
  const s = useT().summaryExtra;
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="run-fast" title={s.exerciseCard} date={data.recordDate} />
        <DataRow label={s.walkDistance} value={`${V(d.distance_m)} 米`} />
        <DataRow label={s.preSpo2} value={`${V(d.pre_spo2)}%`} valueColor={d.pre_spo2 != null ? getValueColor('spo2', d.pre_spo2) : undefined} />
        <DataRow label={s.postSpo2} value={`${V(d.post_spo2)}%`} valueColor={d.post_spo2 != null ? getValueColor('spo2', d.post_spo2) : undefined} />
        <DataRow label={s.preHr} value={`${V(d.pre_hr)} bpm`} valueColor={d.pre_hr != null ? getValueColor('heart_rate', d.pre_hr) : undefined} />
        <DataRow label={s.postHr} value={`${V(d.post_hr)} bpm`} valueColor={d.post_hr != null ? getValueColor('heart_rate', d.post_hr) : undefined} />
        <DataRow label={s.borgScore} value={`${V(d.borg_score)}/10`} />
      </Card.Content>
    </Card>
  );
}

/** 氧合呼吸卡片 */
function VitalsCard({ data }: { data: PatientSummary['vitals'] }) {
  if (!data.data) return null;
  const d = data.data;
  const s = useT().summaryExtra;
  const timeLabel = d.measurement_time === 'evening' ? s.evening : d.measurement_time === 'morning' ? s.morning : '';
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="heart-pulse" title={s.vitalsCard} date={data.recordDate} />
        {timeLabel ? <DataRow label={s.measurementTime} value={timeLabel} /> : null}
        <DataRow label={s.spo2} value={`${V(d.spo2)}%`} valueColor={d.spo2 != null ? getValueColor('spo2', d.spo2) : undefined} />
        <DataRow label={s.respRate} value={`${V(d.respiratory_rate)} 次/分`} valueColor={d.respiratory_rate != null ? getValueColor('respiratory_rate', d.respiratory_rate) : undefined} />
        <DataRow label={s.heartRate} value={`${V(d.heart_rate)} bpm`} valueColor={d.heart_rate != null ? getValueColor('heart_rate', d.heart_rate) : undefined} />
      </Card.Content>
    </Card>
  );
}

/** 营养体重卡片 */
function NutritionCard({ data }: { data: PatientSummary['nutrition'] }) {
  if (!data.data) return null;
  const d = data.data;
  const s = useT().summaryExtra;
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="scale-bathroom" title={s.nutritionCard} date={data.recordDate} />
        <DataRow label={s.weight} value={`${V(d.weight_kg)} kg`} />
        <DataRow label={s.bmi} value={`${V(d.bmi)}`} valueColor={d.bmi != null ? getValueColor('bmi', d.bmi) : undefined} />
        <DataRow label={s.albumin} value={`${V(d.albumin)} g/L`} valueColor={d.albumin != null ? getValueColor('albumin', d.albumin) : undefined} />
      </Card.Content>
    </Card>
  );
}

/** 急性加重卡片 */
function ExacerbationCard({ data }: { data: PatientSummary['exacerbation'] }) {
  if (!data.data) return null;
  const d = data.data;
  const s = useT().summaryExtra;
  const purulentLabel = d.sputum_purulent ? s.yes : s.no;
  const usedAbx = d.used_antibiotics ? s.yes : s.no;
  const usedSteroids = d.used_oral_steroids ? s.yes : s.no;
  const hospitalized = d.hospitalized ? s.yes : s.no;
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="alert-octagon" title={s.exacerbationCard} date={data.recordDate} />
        <DataRow label={s.durationDays} value={`${V(d.duration_days)} 天`} />
        <DataRow label={s.breathlessness} value={V(d.symptoms_increased_breathless)} />
        <DataRow label={s.sputumVolume} value={V(d.sputum_volume_increased)} />
        <DataRow label={s.purulent} value={purulentLabel} />
        <DataRow label={s.antibiotics} value={usedAbx} />
        <DataRow label={s.oralSteroids} value={usedSteroids} />
        <DataRow label={s.hospitalized} value={hospitalized} valueColor={d.hospitalized ? '#C62828' : undefined} />
      </Card.Content>
    </Card>
  );
}

/** 用药疗效卡片 */
function MedicationCard({ data }: { data: PatientSummary['medication'] }) {
  if (!data.data) return null;
  const d = data.data;
  const s = useT().summaryExtra;
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="pill" title={s.medicationCard} date={data.recordDate} />
        <DataRow label={s.rescueUse} value={`${V(d.rescue_inhaler_times)} 次/天`} valueColor={d.rescue_inhaler_times > 0 ? '#F57F17' : undefined} />
        {d.inhaler_technique_score != null && <DataRow label={s.inhalerTechnique} value={String(d.inhaler_technique_score)} valueColor={d.inhaler_technique_score < 3 ? '#F57F17' : undefined} />}
        {d.maintenance_meds && <DataRow label={s.maintenanceMeds} value={d.maintenance_meds} />}
        {d.rescue_meds && <DataRow label={s.rescueMeds} value={d.rescue_meds} />}
      </Card.Content>
    </Card>
  );
}

/** 合并症卡片 */
function ComorbidityCard({ data }: { data: PatientSummary['comorbidity'] }) {
  if (!data.data) return null;
  const d = data.data;
  const s = useT().summaryExtra;
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="hospital-box" title={s.comorbidityCard} date={data.recordDate} />
        <DataRow label={s.pap} value={`${V(d.pap_mmhg)} mmHg`} valueColor={d.pap_mmhg != null ? getValueColor('pap_mmhg', d.pap_mmhg) : undefined} />
        <DataRow label={s.boneDensity} value={V(d.bone_density_t)} valueColor={d.bone_density_t != null && d.bone_density_t < -2.5 ? '#C62828' : d.bone_density_t != null && d.bone_density_t < -1 ? '#F57F17' : undefined} />
        <DataRow label={s.fbg} value={`${V(d.fbg)} mmol/L`} valueColor={d.fbg != null ? getValueColor('fbg', d.fbg) : undefined} />
        <DataRow label={s.hba1c} value={`${V(d.hba1c)}%`} valueColor={d.hba1c != null ? getValueColor('hba1c', d.hba1c) : undefined} />
        <DataRow label={s.tc} value={`${V(d.tc)} mmol/L`} />
        <DataRow label={s.tg} value={`${V(d.tg)} mmol/L`} />
        <DataRow label="HDL-C" value={`${V(d.hdl)} mmol/L`} />
        <DataRow label="LDL-C" value={`${V(d.ldl)} mmol/L`} />
      </Card.Content>
    </Card>
  );
}

/** 戒烟管理卡片 */
function SmokingCard({ data }: { data: PatientSummary['smoking'] }) {
  if (!data.data) return null;
  const d = data.data;
  const s = useT().summaryExtra;
  const ftndLevel = d.ftnd_total != null
    ? d.ftnd_total <= 2 ? s.ftndLow : d.ftnd_total <= 4 ? s.ftndMedium : d.ftnd_total <= 6 ? s.ftndHigh : s.ftndVeryHigh
    : '';
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="smoking-off" title={s.smokingCard} date={data.recordDate} />
        <DataRow label={s.dailyCigarettes} value={`${V(d.cigarettes_per_day)} 支/天`} />
        {d.ftnd_total != null && <DataRow label={s.ftnd} value={`${d.ftnd_total}/10 ${ftndLevel}`} />}
        {d.quit_date && <DataRow label={s.quitDate} value={d.quit_date} />}
        {d.relapse_count > 0 && <DataRow label={s.relapseCount} value={`${d.relapse_count} 次`} />}
      </Card.Content>
    </Card>
  );
}

/** 睡眠监测卡片 */
function SleepCard({ data }: { data: PatientSummary['sleep'] }) {
  if (!data.data) return null;
  const d = data.data;
  const s = useT().summaryExtra;
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="sleep" title={s.sleepCard} date={data.recordDate} />
        <DataRow label={s.nocturnalMinSpo2} value={`${V(d.nocturnal_min_spo2)}%`} valueColor={d.nocturnal_min_spo2 != null ? getValueColor('nocturnal_min_spo2', d.nocturnal_min_spo2) : undefined} />
        <DataRow label={s.nocturnalMeanSpo2} value={`${V(d.nocturnal_mean_spo2)}%`} />
        <DataRow label={s.odi} value={`${V(d.odi)} 次/小时`} valueColor={d.odi != null ? getValueColor('odi', d.odi) : undefined} />
        <DataRow label={s.t90} value={`${V(d.t90_pct)}%`} valueColor={d.t90_pct != null ? getValueColor('t90_pct', d.t90_pct) : undefined} />
        <DataRow label={s.nocturnalMeanHr} value={`${V(d.nocturnal_mean_hr)} bpm`} valueColor={d.nocturnal_mean_hr != null ? getValueColor('heart_rate', d.nocturnal_mean_hr) : undefined} />
      </Card.Content>
    </Card>
  );
}

/** 肺康复训练卡片 */
function RehabCard({ data }: { data: PatientSummary['rehab'] }) {
  if (!data.data) return null;
  const d = data.data;
  const s = useT().summaryExtra;
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="run" title={s.rehabCard} date={data.recordDate} />
        <DataRow label={s.rehabDuration} value={`${V(d.duration_min)} 分钟`} />
        {d.pursed_lip_breathing_min != null && <DataRow label={s.pursedLip} value={`${d.pursed_lip_breathing_min} 分钟`} />}
        {d.diaphragmatic_breathing_min != null && <DataRow label={s.diaphragmatic} value={`${d.diaphragmatic_breathing_min} 分钟`} />}
        {d.upper_limb_exercise_min != null && <DataRow label={s.upperLimb} value={`${d.upper_limb_exercise_min} 分钟`} />}
        {d.lower_limb_exercise_min != null && <DataRow label={s.lowerLimb} value={`${d.lower_limb_exercise_min} 分钟`} />}
        {d.walking_distance_m != null && <DataRow label={s.walkDist} value={`${d.walking_distance_m} 米`} />}
        <DataRow label={s.preSpo2} value={`${V(d.pre_spo2)}%`} valueColor={d.pre_spo2 != null ? getValueColor('spo2', d.pre_spo2) : undefined} />
        <DataRow label={s.postSpo2} value={`${V(d.post_spo2)}%`} valueColor={d.post_spo2 != null ? getValueColor('spo2', d.post_spo2) : undefined} />
        <DataRow label={s.borg} value={`${V(d.borg_score)}/10`} />
      </Card.Content>
    </Card>
  );
}

/** 疫苗接种卡片 */
function VaccinationCard({ data }: { data: PatientSummary['vaccination'] }) {
  if (!data.data || data.data.length === 0) return null;
  const s = useT().summaryExtra;
  const vaccineTypeLabel: Record<string, string> = {
    influenza: s.vaxInfluenza, pneumococcal: s.vaxPneumococcal, covid19: s.vaxCovid19,
    tdap: s.vaxTdap, rsv: s.vaxRsv, other: s.vaxOther,
  };
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="needle" title={s.vaccinationCard} date={null} />
        {data.data.map((v) => (
          <View key={v.id} style={styles.vaxRow}>
            <Text style={styles.vaxName}>{vaccineTypeLabel[v.vaccine_type] || v.vaccine_name}</Text>
            <Text style={styles.vaxDetail}>
              {s.dose.replace('{n}', String(v.dose_number))} · {v.vaccination_date}
              {v.next_due_date ? ` → ${s.nextDue}${v.next_due_date}` : ''}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

function MedicationUsageCard({ data }: { data: PatientSummary['medicationUsage'] }) {
  if (!data.data || data.data.length === 0) return null;
  const items = data.data;
  const statusLbl = ['使用中','长期使用','间断使用','已停用','已换用','联合使用'];
  const statusKey = ['using','long_term','intermittent','stopped','switched','combined'];
  return (
    <Card style={styles.card}>
      <Card.Content>
        <SectionHeader icon="pill" title="用药记录" date={data.recordDate} />
        {items.map((m: any) => (
          <View key={m.id} style={styles.vaxRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#212121' }}>{m.drug_name}</Text>
              <Chip compact style={{ backgroundColor: '#E8F5E9' }} textStyle={{ fontSize: 11, color: '#2E7D32' }}>
                {statusLbl[statusKey.indexOf(m.status)] || m.status}
              </Chip>
            </View>
            {m.usage_method && <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>用法：{m.usage_method}</Text>}
            <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{m.record_date}</Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

// ==================== 主页面 ====================

export default function SummaryScreen() {
  const t = useT();
  const router = useRouter();
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const s = await getPatientSummary();
      setSummary(s);
    } catch (e) {
      console.error('Failed to load summary:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>{t.summary.loading}</Text>
      </View>
    );
  }

  // 统计有数据的模块数
  const modules = summary ? [
    summary.pulmonary, summary.inflammation, summary.symptom,
    summary.exercise, summary.vitals, summary.nutrition,
    summary.exacerbation, summary.medication, summary.comorbidity,
    summary.smoking, summary.sleep, summary.rehab, summary.vaccination,
  ].filter(m => m.hasData) : [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 页面头部 */}
      <Surface style={styles.header}>
        <Text style={styles.headerIcon}>📋</Text>
        <Text style={styles.headerTitle}>{t.summary.headerTitle}</Text>
        <Text style={styles.headerSub}>
          {modules.length > 0
            ? `${modules.length} ${t.summary.headerSub.replace('{count}', '')}`
            : t.summary.noDataHint}
        </Text>
        {summary?.generatedAt && (
          <Text style={styles.generatedAt}>
            {t.summary.generatedAt.replace('{time}', `${summary.generatedAt.slice(0, 10)} ${summary.generatedAt.slice(11, 16)}`)}
          </Text>
        )}
      </Surface>

      {modules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="file-document-outline" size={64} color="#BDBDBD" />
          <Text style={styles.emptyText}>{t.summary.noData}</Text>
          <Text style={styles.emptyHint}>{t.summary.noDataHint}</Text>
          <Button mode="contained" onPress={() => router.back()} style={styles.backBtn}>
            {t.summary.backToHome}
          </Button>
        </View>
      ) : (
        <>
          {/* 模块卡片 */}
          {summary?.pulmonary.hasData && <PulmonaryCard data={summary.pulmonary.data!} />}
          {summary?.inflammation.hasData && <InflammationCard data={summary.inflammation} />}
          {summary?.symptom.hasData && <SymptomCard data={summary.symptom} />}
          {summary?.exercise.hasData && <ExerciseCard data={summary.exercise} />}
          {summary?.vitals.hasData && <VitalsCard data={summary.vitals} />}
          {summary?.nutrition.hasData && <NutritionCard data={summary.nutrition} />}
          {summary?.exacerbation.hasData && <ExacerbationCard data={summary.exacerbation} />}
          {summary?.medication.hasData && <MedicationCard data={summary.medication} />}
          {summary?.comorbidity.hasData && <ComorbidityCard data={summary.comorbidity} />}
          {summary?.smoking.hasData && <SmokingCard data={summary.smoking} />}
          {summary?.sleep.hasData && <SleepCard data={summary.sleep} />}
          {summary?.rehab.hasData && <RehabCard data={summary.rehab} />}
          {summary?.vaccination.hasData && <VaccinationCard data={summary.vaccination} />}
          {summary?.medicationUsage.hasData && <MedicationUsageCard data={summary.medicationUsage} />}

          {/* 图例说明 */}
          <Card style={styles.legendCard}>
            <Card.Content>
              <Text style={styles.legendTitle}>{t.summary.legendTitle}</Text>
              <View style={styles.legendRow}>
                <Chip compact style={[styles.legendChip, { backgroundColor: '#C6282815' }]}>
                  <Text style={{ color: '#C62828', fontSize: 12 }}>🔴 {t.summary.legendAbnormal}</Text>
                </Chip>
                <Chip compact style={[styles.legendChip, { backgroundColor: '#F57F1715' }]}>
                  <Text style={{ color: '#F57F17', fontSize: 12 }}>🟠 {t.summary.legendBorderline}</Text>
                </Chip>
                <Chip compact style={[styles.legendChip, { backgroundColor: '#2E7D3215' }]}>
                  <Text style={{ color: '#2E7D32', fontSize: 12 }}>🟢 {t.summary.legendNormal}</Text>
                </Chip>
              </View>
              <Text style={styles.legendNote}>
                {t.summary.legendNote}
              </Text>
            </Card.Content>
          </Card>

          <View style={{ height: 40 }} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceBg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surfaceBg },
  loadingText: { fontSize: FontSize.body, color: Colors.textMed, marginTop: Spacing.lg },

  // 头部
  header: { padding: Spacing.xl, alignItems: 'center', backgroundColor: Colors.primaryLight, marginBottom: Spacing.sm },
  headerIcon: { fontSize: 40, marginBottom: Spacing.sm },
  headerTitle: { fontSize: FontSize.h1, fontWeight: '700', color: Colors.primaryDark },
  headerSub: { fontSize: FontSize.caption, color: Colors.textMed, marginTop: Spacing.xs, textAlign: 'center' },
  generatedAt: { fontSize: FontSize.tiny, color: Colors.textLow, marginTop: Spacing.sm },

  // 空状态
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxxl, marginTop: 60 },
  emptyText: { fontSize: FontSize.h2, color: Colors.textLow, marginTop: Spacing.lg },
  emptyHint: { fontSize: FontSize.caption, color: Colors.textLow, marginTop: Spacing.sm, textAlign: 'center', lineHeight: 22 },
  backBtn: { marginTop: Spacing.xxl, borderRadius: Radius.sm },

  // 卡片
  card: { margin: Spacing.lg, marginBottom: Spacing.xs, borderRadius: Radius.md, backgroundColor: Colors.surface, ...Shadow.card },

  // 分区标题
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.body, fontWeight: '700', color: Colors.primary, flex: 1 },
  sectionDate: { fontSize: FontSize.tiny, color: Colors.textLow },

  // 数据行
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.divider },
  dataLabel: { fontSize: FontSize.caption, color: Colors.textMed, flex: 1 },
  dataValue: { fontSize: FontSize.caption, fontWeight: '600', color: Colors.textHigh, textAlign: 'right' },

  // 肺功能
  levelGroup: { marginBottom: Spacing.md },
  levelTitle: { fontSize: FontSize.tiny + 1, fontWeight: '600', color: '#0277BD', marginBottom: Spacing.sm, backgroundColor: '#E3F2FD', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm, overflow: 'hidden' },
  indicatorBlock: { marginBottom: Spacing.sm },
  indicatorName: { fontSize: FontSize.caption, fontWeight: '600', color: Colors.textHigh, marginBottom: Spacing.xs },
  subFields: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  subField: { backgroundColor: Colors.autoCalcBg, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, minWidth: 80 },
  subLabel: { fontSize: 10, color: Colors.textLow },
  subValue: { fontSize: FontSize.tiny + 1, fontWeight: '600', color: Colors.textHigh, marginTop: 1 },

  // 肺功能结论
  conclusionBox: { backgroundColor: Colors.successBg, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  conclusionLabel: { fontSize: FontSize.tiny + 1, fontWeight: '700', color: Colors.primary, marginBottom: Spacing.xs },
  conclusionText: { fontSize: FontSize.caption, color: Colors.primaryDark, lineHeight: 20 },

  // 戒烟
  vaxRow: { paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.divider },
  vaxName: { fontSize: FontSize.caption, fontWeight: '600', color: Colors.textHigh },
  vaxDetail: { fontSize: FontSize.tiny, color: Colors.textMed, marginTop: 2 },

  // 图例
  legendCard: { margin: Spacing.lg, marginTop: Spacing.sm, borderRadius: Radius.md, backgroundColor: Colors.surface, ...Shadow.card },
  legendTitle: { fontSize: FontSize.caption, fontWeight: '600', color: Colors.textHigh, marginBottom: Spacing.sm },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  legendChip: { height: 28 },
  legendNote: { fontSize: FontSize.tiny, color: Colors.textLow, marginTop: Spacing.md, lineHeight: 18 },
});
