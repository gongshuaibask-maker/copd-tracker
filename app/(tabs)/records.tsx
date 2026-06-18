// 全部记录聚合页
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useT } from '../../src/i18n';

export default function RecordsScreen() {
  const router = useRouter();
  const t = useT();

  const RECORD_ENTRIES = [
    { title: t.records.pulmonary, icon: 'lungs', route: '/record/pulmonary' },
    { title: t.records.inflammation, icon: 'flask', route: '/record/inflammation' },
    { title: t.records.symptom, icon: 'clipboard-list', route: '/record/symptom' },
    { title: t.records.exercise, icon: 'run-fast', route: '/record/exercise' },
    { title: t.records.vitals, icon: 'heart-pulse', route: '/record/vitals' },
    { title: t.records.nutrition, icon: 'scale-bathroom', route: '/record/nutrition' },
    { title: t.records.exacerbation, icon: 'alert-octagon', route: '/record/exacerbation' },
    { title: t.records.medication, icon: 'pill', route: '/record/medication' },
    { title: t.records.comorbidity, icon: 'hospital-box', route: '/record/comorbidity' },
    { title: t.records.smoking, icon: 'smoking-off', route: '/record/smoking' },
    { title: t.records.sleep, icon: 'sleep', route: '/record/sleep' },
    { title: t.records.rehab, icon: 'run', route: '/record/rehab' },
    { title: t.records.actionPlan, icon: 'file-document-edit', route: '/action-plan' },
    { title: t.records.vaccination, icon: 'needle', route: '/vaccination' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>{t.records.selectType}</Text>
      {RECORD_ENTRIES.map((entry) => (
        <List.Item
          key={entry.route}
          title={entry.title}
          left={(props) => <List.Icon {...props} icon={entry.icon as string} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => router.push(entry.route)}
          style={styles.item}
        />
      ))}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#424242', padding: 16 },
  item: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 2, borderRadius: 8 },
});
