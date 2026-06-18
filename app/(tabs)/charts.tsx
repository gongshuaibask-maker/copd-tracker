// 趋势图表聚合页 — 全部 11 模块 + 康复训练趋势
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { getAllVitalsRecords } from '../../src/database/repositories/vitalsRepo';
import { getAllNutritionRecords } from '../../src/database/repositories/nutritionRepo';
import { getAllExercise } from '../../src/database/repositories/exerciseRepo';
import { getAllPulmonaryRecords } from '../../src/database/repositories/pulmonaryRepo';
import { getAllInflammation } from '../../src/database/repositories/inflammationRepo';
import { getAllSymptomScores } from '../../src/database/repositories/symptomRepo';
import { getAllExacerbations } from '../../src/database/repositories/exacerbationRepo';
import { getAllMedications } from '../../src/database/repositories/medicationRepo';
import { getAllComorbidity } from '../../src/database/repositories/comorbidityRepo';
import { getAllSmoking } from '../../src/database/repositories/smokingRepo';
import { getAllSleep } from '../../src/database/repositories/sleepRepo';
import { getAllRehab } from '../../src/database/repositories/rehabRepo';
import TrendChart, { type ChartDataPoint } from '../../src/components/TrendChart';
import type {
  DailyVitals, NutritionWeight, ExerciseTest,
  PulmonaryFunction, AirwayInflammation, SymptomScore,
  ExacerbationLog, MedicationLog, Comorbidity,
  SmokingCessation, SleepMonitoring, PulmonaryRehab,
} from '../../src/types/models';

type Range = '3m' | '6m' | '1y' | 'all';

import { useT } from '../../src/i18n';

export default function ChartsScreen() {
  const t = useT();
  const [range, setRange] = useState<Range>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [vitals, setVitals] = useState<DailyVitals[]>([]);
  const [nutrition, setNutrition] = useState<NutritionWeight[]>([]);
  const [exercise, setExercise] = useState<ExerciseTest[]>([]);
  const [pulmonary, setPulmonary] = useState<PulmonaryFunction[]>([]);
  const [inflammation, setInflammation] = useState<AirwayInflammation[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomScore[]>([]);
  const [exacerbations, setExacerbations] = useState<ExacerbationLog[]>([]);
  const [medications, setMedications] = useState<MedicationLog[]>([]);
  const [comorbidity, setComorbidity] = useState<Comorbidity[]>([]);
  const [smoking, setSmoking] = useState<SmokingCessation[]>([]);
  const [sleep, setSleep] = useState<SleepMonitoring[]>([]);
  const [rehab, setRehab] = useState<PulmonaryRehab[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [v, n, e, p, inf, sym, ex, m, c, sm, sl, rh] = await Promise.all([
        getAllVitalsRecords(), getAllNutritionRecords(), getAllExercise(),
        getAllPulmonaryRecords(), getAllInflammation(), getAllSymptomScores(),
        getAllExacerbations(), getAllMedications(), getAllComorbidity(),
        getAllSmoking(), getAllSleep(), getAllRehab(),
      ]);
      setVitals(v); setNutrition(n); setExercise(e); setPulmonary(p);
      setInflammation(inf); setSymptoms(sym); setExacerbations(ex);
      setMedications(m); setComorbidity(c); setSmoking(sm); setSleep(sl); setRehab(rh);
    } catch (err) { console.error(err); }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const filterByRange = <T extends { record_date: string }>(records: T[]): T[] => {
    if (range === 'all') return records;
    const now = new Date();
    const months = range === '3m' ? 3 : range === '6m' ? 6 : 12;
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, 1);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return records.filter(r => r.record_date >= cutoffStr);
  };

  const toPts = <T, K extends keyof T>(records: T[], field: K, dateField = 'record_date' as keyof T): ChartDataPoint[] =>
    records.map(r => ({ date: String(r[dateField]), value: Number(r[field]) ?? 0 })).filter(p => p.value !== 0);

  const fVitals = filterByRange(vitals);
  const fNutrition = filterByRange(nutrition);
  const fExercise = filterByRange(exercise);
  const fPulmonary = filterByRange(pulmonary);
  const fInflammation = filterByRange(inflammation);
  const fSymptoms = filterByRange(symptoms);
  const fMedications = filterByRange(medications);
  const fComorbidity = filterByRange(comorbidity);
  const fSmoking = filterByRange(smoking);
  const fSleep = filterByRange(sleep);
  const fRehab = filterByRange(rehab);

  const totalDataCount = fVitals.length + fNutrition.length + fExercise.length +
    fPulmonary.length + fInflammation.length + fSymptoms.length +
    fMedications.length + fComorbidity.length + fSmoking.length +
    fSleep.length + fRehab.length;

  return (
    <ScrollView style={S.ct} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={S.filterRow}>
        <SegmentedButtons value={range} onValueChange={v => setRange(v as Range)}
          buttons={[
            { value: '3m', label: t.charts.range3m }, { value: '6m', label: t.charts.range6m },
            { value: '1y', label: t.charts.range1y }, { value: 'all', label: t.charts.rangeAll },
          ]}
          style={S.segment}
        />
      </View>

      {/* 1. 肺功能 */}
      {fPulmonary.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t.charts.pulmonaryTrend}</Text>
          {(() => {
            // 统计各记录中 FEV₁ 用药前实测值
            const fev1Data: ChartDataPoint[] = [];
            for (const r of fPulmonary) {
              // 从 pulmonary_function_detail 中获取，但在图表页简化处理
              // 由于 getAllPulmonaryRecords 只返回主表，暂以记录数为基础
              fev1Data.push({ date: r.record_date, value: r.id }); // 占位
            }
            return null; // 肺功能详情图表在详情页实现
          })()}
          <TrendChart title={t.charts.pulmonaryCount} data={fPulmonary.map(r => ({ date: r.record_date, value: 1 })).reduce<ChartDataPoint[]>((acc, cur) => {
            const existing = acc.find(a => a.date === cur.date);
            if (existing) existing.value += 1;
            else acc.push({ ...cur });
            return acc;
          }, [])} color="#2E7D32" unit="次" />
        </View>
      )}

      {/* 2. 氧合呼吸 */}
      {fVitals.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>🫀 {t.charts.oxySection}</Text>
          <TrendChart title={t.charts.spo2Title} data={toPts(fVitals, 'spo2')} color="#1565C0" unit="%" yAxisSuffix="%" indicatorKey="spo2" />
          <TrendChart title={t.charts.hrTitle} data={toPts(fVitals, 'heart_rate')} color="#C62828" unit="bpm" indicatorKey="heart_rate" />
          <TrendChart title={t.charts.respRate} data={toPts(fVitals, 'respiratory_rate')} color="#6A1B9A" unit="次/分" indicatorKey="respiratory_rate" />
        </View>
      )}

      {/* 3. 营养体重 */}
      {fNutrition.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>⚖️ {t.charts.weightSection}</Text>
          <TrendChart title={t.charts.weightTitle} data={toPts(fNutrition, 'weight_kg')} color="#E65100" unit="kg" />
          <TrendChart title="BMI" data={toPts(fNutrition, 'bmi')} color="#F57F17" unit="kg/m²" indicatorKey="bmi" />
          <TrendChart title={t.charts.albumin} data={toPts(fNutrition, 'albumin')} color="#37474F" unit="g/L" indicatorKey="albumin" />
        </View>
      )}

      {/* 4. 运动耐力 */}
      {fExercise.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>🏃 {t.charts.exerciseSection}</Text>
          <TrendChart title={t.charts.walkTitle} data={toPts(fExercise, 'distance_m')} color="#E65100" unit="m" />
          <TrendChart title={t.charts.borgTitle} data={toPts(fExercise, 'borg_score')} color="#6A1B9A" unit="/10" />
          <TrendChart title={t.charts.postSpo2} data={toPts(fExercise, 'post_spo2')} color="#1565C0" unit="%" indicatorKey="spo2" />
        </View>
      )}

      {/* 5. 气道炎症 */}
      {fInflammation.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t.charts.inflammationTrend}</Text>
          <TrendChart title={t.charts.feno} data={toPts(fInflammation, 'feno_ppb')} color="#0277BD" unit="ppb" indicatorKey="feno_ppb" />
          <TrendChart title={t.charts.bloodEos} data={toPts(fInflammation, 'blood_eos')} color="#C62828" unit="×10⁹/L" indicatorKey="blood_eos" />
        </View>
      )}

      {/* 6. 症状评分 */}
      {fSymptoms.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t.charts.symptomTrend}</Text>
          <TrendChart title={t.charts.catTotal} data={toPts(fSymptoms, 'cat_total')} color="#6A1B9A" unit="分" />
          <TrendChart title={t.charts.mmrcGrade} data={toPts(fSymptoms, 'mmrc_grade')} color="#E65100" unit="级" />
        </View>
      )}

      {/* 7. 用药 */}
      {fMedications.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t.charts.medicationTrend}</Text>
          <TrendChart title={t.charts.rescueUse} data={toPts(fMedications, 'rescue_inhaler_times')} color="#00695C" unit="次/天" />
          <TrendChart title={t.charts.inhalerTechnique} data={toPts(fMedications, 'inhaler_technique_score')} color="#2E7D32" unit="/5" />
        </View>
      )}

      {/* 8. 合并症 */}
      {fComorbidity.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t.charts.comorbidityTrend}</Text>
          <TrendChart title={t.charts.fbg} data={toPts(fComorbidity, 'fbg')} color="#C62828" unit="mmol/L" indicatorKey="fbg" />
          <TrendChart title={t.charts.hba1c} data={toPts(fComorbidity, 'hba1c')} color="#E65100" unit="%" indicatorKey="hba1c" />
          <TrendChart title={t.charts.pap} data={toPts(fComorbidity, 'pap_mmhg')} color="#6A1B9A" unit="mmHg" indicatorKey="pap_mmhg" />
        </View>
      )}

      {/* 9. 戒烟 */}
      {fSmoking.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t.charts.smokingTrend}</Text>
          <TrendChart title={t.charts.dailyCigarettes} data={toPts(fSmoking, 'cigarettes_per_day')} color="#795548" unit="支/天" />
          <TrendChart title={t.charts.ftndScore} data={toPts(fSmoking, 'ftnd_total')} color="#5D4037" unit="/10" />
        </View>
      )}

      {/* 10. 睡眠监测 */}
      {fSleep.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t.charts.sleepTrend}</Text>
          <TrendChart title={t.charts.nocturnalMinSpo2} data={toPts(fSleep, 'nocturnal_min_spo2')} color="#283593" unit="%" indicatorKey="nocturnal_min_spo2" />
          <TrendChart title={t.charts.odi} data={toPts(fSleep, 'odi')} color="#C62828" unit="次/小时" indicatorKey="odi" />
          <TrendChart title={t.charts.t90} data={toPts(fSleep, 't90_pct')} color="#E65100" unit="%" indicatorKey="t90_pct" />
        </View>
      )}

      {/* 11. 康复训练 */}
      {fRehab.length >= 2 && (
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t.charts.rehabTrend}</Text>
          <TrendChart title={t.charts.duration} data={toPts(fRehab, 'duration_min')} color="#00838F" unit="分钟" />
          <TrendChart title={t.charts.walkingDistance} data={toPts(fRehab, 'walking_distance_m')} color="#E65100" unit="m" />
          <TrendChart title={t.charts.postBorg} data={toPts(fRehab, 'borg_score')} color="#6A1B9A" unit="/10" />
        </View>
      )}

      {totalDataCount < 2 && (
        <View style={S.emptyAll}>
          <Text style={S.emptyText}>{t.charts.hint}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const S = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' },
  filterRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  segment: { marginBottom: 8 },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#424242', marginBottom: 10, marginTop: 8 },
  emptyAll: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#999', textAlign: 'center' },
});
