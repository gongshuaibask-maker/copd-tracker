// 数据导出页 — 导出全部模块数据为 JSON
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share, Platform } from 'react-native';
import { Text, Card, Button, Chip, Switch } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllVitalsRecords } from '../src/database/repositories/vitalsRepo';
import { getAllNutritionRecords } from '../src/database/repositories/nutritionRepo';
import { getAllExercise } from '../src/database/repositories/exerciseRepo';
import { getAllExacerbations } from '../src/database/repositories/exacerbationRepo';
import { getAllMedications } from '../src/database/repositories/medicationRepo';
import { getAllInflammation } from '../src/database/repositories/inflammationRepo';
import { getAllComorbidity } from '../src/database/repositories/comorbidityRepo';
import { getAllSmoking } from '../src/database/repositories/smokingRepo';
import { getAllSleep } from '../src/database/repositories/sleepRepo';
import { getAllPulmonaryRecords } from '../src/database/repositories/pulmonaryRepo';
import { getAllSymptomScores } from '../src/database/repositories/symptomRepo';
import { getUser } from '../src/database/repositories/userRepo';
import { getActionPlan } from '../src/database/repositories/actionPlanRepo';
import { getAllVaccinations } from '../src/database/repositories/vaccinationRepo';
import { useT } from '../src/i18n';

export default function ExportScreen() {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [anonymize, setAnonymize] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => { loadCounts(); }, []);

  const loadCounts = async () => {
    try {
      const [v, n, e, ex, m, inf, c, sm, sl, pul, sym, vax] = await Promise.all([
        getAllVitalsRecords(), getAllNutritionRecords(), getAllExercise(),
        getAllExacerbations(), getAllMedications(), getAllInflammation(),
        getAllComorbidity(), getAllSmoking(), getAllSleep(),
        getAllPulmonaryRecords(), getAllSymptomScores(),
        getAllVaccinations(),
      ]);
      setCounts({ [t.export.modPulmonary]: pul.length, [t.export.modSymptom]: sym.length,
        [t.export.modVitals]: v.length, [t.export.modNutrition]: n.length, [t.export.modExercise]: e.length,
        [t.export.modExacerbation]: ex.length, [t.export.modMedication]: m.length, [t.export.modInflammation]: inf.length,
        [t.export.modComorbidity]: c.length, [t.export.modSmoking]: sm.length, [t.export.modSleep]: sl.length,
        [t.export.modVaccination]: vax.length });
    } catch { /* ignore */ }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const user = await getUser();
      const [v, n, e, ex, m, inf, c, sm, sl, pul, sym, plan, vax] = await Promise.all([
        getAllVitalsRecords(), getAllNutritionRecords(), getAllExercise(),
        getAllExacerbations(), getAllMedications(), getAllInflammation(),
        getAllComorbidity(), getAllSmoking(), getAllSleep(),
        getAllPulmonaryRecords(), getAllSymptomScores(),
        getActionPlan(), getAllVaccinations(),
      ]);

      // 匿名化处理：移除可识别个人身份的信息
      const safeUser = anonymize
        ? { gender: user?.gender, height_cm: user?.height_cm, weight_kg: user?.weight_kg,
            gold_stage: user?.gold_stage, diagnosis_date: user?.diagnosis_date }
        : user;

      const data = {
        exportedAt: new Date().toISOString(),
        app: 'COPD Self-Management Assistant v1.0',
        anonymized: anonymize,
        user: safeUser,
        actionPlan: plan || null,
        records: {
          pulmonary: pul, symptoms: sym,
          vitals: v, nutrition: n, exercise: e,
          exacerbations: ex, medications: m, inflammations: inf,
          comorbidities: c, smoking: sm, sleep: sl,
          vaccinations: vax,
        },
      };

      const json = JSON.stringify(data, null, 2);
      const prefix = anonymize ? 'copd_export_anonymous_' : 'copd_export_';
      const fileName = `${prefix}${new Date().toISOString().slice(0, 10)}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({ message: json, title: 'COPD 数据导出' });
      }
      Alert.alert(t.export.success, anonymize ? t.export.successMsgAnon : t.export.successMsg);
    } catch (err) {
      Alert.alert(t.export.fail, JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <ScrollView style={st.ct} contentContainerStyle={st.scroll}>
      <Card style={st.card}>
        <Card.Content>
          <View style={st.header}>
            <MaterialCommunityIcons name="file-export" size={32} color="#2E7D32" />
            <View>
              <Text style={st.title}>{t.export.totalRecords}</Text>
              <Text style={st.subtitle}>{total} records, {Object.keys(counts).length} modules</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={st.card}>
        <Card.Content>
          <Text style={st.sectionTitle}>{t.export.moduleCount}</Text>
          {Object.entries(counts).map(([k, v]) => (
            <View key={k} style={st.countRow}>
              <Text style={st.countLabel}>{k}</Text>
              <Chip compact style={st.chip}>{v} 条</Chip>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* 匿名化选项 */}
      <Card style={st.card}>
        <Card.Content>
          <View style={st.anonRow}>
            <View style={{ flex: 1 }}>
              <Text style={st.anonTitle}>{t.export.anonTitle}</Text>
              <Text style={st.anonHint}>{t.export.anonHint}</Text>
            </View>
            <Switch value={anonymize} onValueChange={setAnonymize} color="#2E7D32" />
          </View>
        </Card.Content>
      </Card>

      <Button mode="contained" onPress={handleExport} loading={loading} disabled={loading}
        icon="download" style={st.btn} contentStyle={{ paddingVertical: 8 }}>
        {anonymize ? t.export.exportBtnAnon : t.export.exportBtn}
      </Button>

      <Card style={st.card}>
        <Card.Content>
          <Text style={st.noteTitle}>{t.export.notes}</Text>
          <Text style={st.note}>{t.export.note1}</Text>
          <Text style={st.note}>{t.export.note2}</Text>
          <Text style={st.note}>{t.export.note3}</Text>
          <Text style={st.note}>{t.export.note4}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { marginBottom: 12, borderRadius: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#424242' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#666', marginBottom: 10 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  countLabel: { fontSize: 14, color: '#424242' },
  chip: { height: 28 },
  btn: { marginVertical: 12, borderRadius: 8 },
  anonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  anonTitle: { fontSize: 15, fontWeight: '600', color: '#424242' },
  anonHint: { fontSize: 12, color: '#888', marginTop: 4 },
  noteTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8 },
  note: { fontSize: 13, color: '#888', marginBottom: 4 },
});
