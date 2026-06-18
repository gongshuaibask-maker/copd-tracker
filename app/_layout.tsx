// 根布局 — 数据库初始化 + 注册检查 + 国际化 + 医疗免责声明
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { getDatabase, needsRegistration } from '../src/database';
import { LanguageProvider, useT } from '../src/i18n';
import MedicalDisclaimer from '../src/components/MedicalDisclaimer';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E7D32',
    primaryContainer: '#C8E6C9',
    secondary: '#0277BD',
    error: '#C62828',
    background: '#FAFAFA',
    surface: '#FAFAFA',
    surfaceVariant: '#F5F5F5',
    onSurface: '#212121',
    outline: '#BDBDBD',
  },
};

export default function RootLayout() {
  const t = useT();
  const [isReady, setIsReady] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const database = await getDatabase();
        const needsReg = await needsRegistration();

        // 检查医疗免责声明是否已被接受
        if (!needsReg) {
          await database.execAsync(`
            CREATE TABLE IF NOT EXISTS app_settings (
              key TEXT PRIMARY KEY,
              value TEXT NOT NULL
            )
          `);
          const row = await database.getFirstAsync<{ value: string }>(
            "SELECT value FROM app_settings WHERE key = 'disclaimer_accepted'"
          );
          if (!row || row.value !== 'true') {
            setShowDisclaimer(true);
          }
        }
      } catch (e) {
        console.error('Database init failed:', e);
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, []);

  const handleAcceptDisclaimer = async () => {
    try {
      const database = await getDatabase();
      await database.runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('disclaimer_accepted', 'true')"
      );
      await database.runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('disclaimer_accepted_at', ?)",
        [new Date().toISOString()]
      );
    } catch { /* ignore */ }
    setShowDisclaimer(false);
  };

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <LanguageProvider>
    <PaperProvider theme={theme}>
      <MedicalDisclaimer visible={showDisclaimer} onAccept={handleAcceptDisclaimer} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="register" options={{ title: t.register.title }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="record/pulmonary/index" options={{ headerShown: true, title: t.pulmonary.title }} />
        <Stack.Screen name="record/pulmonary/add" options={{ headerShown: true, title: t.pulmonary.addTitle }} />
        <Stack.Screen name="record/pulmonary/[id]" options={{ headerShown: true, title: t.pulmonary.detailTitle }} />
        <Stack.Screen name="record/inflammation/index" options={{ headerShown: true, title: t.inflammation.title }} />
        <Stack.Screen name="record/inflammation/add" options={{ headerShown: true, title: t.inflammation.addTitle }} />
        <Stack.Screen name="record/inflammation/[id]" options={{ headerShown: true, title: t.inflammation.detailTitle }} />
        <Stack.Screen name="record/symptom/index" options={{ headerShown: true, title: t.symptom.title }} />
        <Stack.Screen name="record/symptom/add" options={{ headerShown: true, title: t.symptom.addTitle }} />
        <Stack.Screen name="record/symptom/[id]" options={{ headerShown: true, title: t.symptom.detailTitle }} />
        <Stack.Screen name="record/exercise/index" options={{ headerShown: true, title: t.exercise.title }} />
        <Stack.Screen name="record/exercise/add" options={{ headerShown: true, title: t.exercise.addTitle }} />
        <Stack.Screen name="record/exercise/[id]" options={{ headerShown: true, title: t.exercise.detailTitle }} />
        <Stack.Screen name="record/vitals/index" options={{ headerShown: true, title: t.vitals.title }} />
        <Stack.Screen name="record/vitals/add" options={{ headerShown: true, title: t.vitals.addTitle }} />
        <Stack.Screen name="record/vitals/[id]" options={{ headerShown: true, title: t.vitals.detailTitle }} />
        <Stack.Screen name="record/nutrition/index" options={{ headerShown: true, title: t.nutrition.title }} />
        <Stack.Screen name="record/nutrition/add" options={{ headerShown: true, title: t.nutrition.addTitle }} />
        <Stack.Screen name="record/nutrition/[id]" options={{ headerShown: true, title: t.nutrition.detailTitle }} />
        <Stack.Screen name="record/exacerbation/index" options={{ headerShown: true, title: t.exacerbation.title }} />
        <Stack.Screen name="record/exacerbation/add" options={{ headerShown: true, title: t.exacerbation.addTitle }} />
        <Stack.Screen name="record/exacerbation/[id]" options={{ headerShown: true, title: t.exacerbation.detailTitle }} />
            <Stack.Screen name="record/medication/index" options={{ headerShown: true, title: t.medicationUsage.title }} />
            <Stack.Screen name="record/medication/add" options={{ headerShown: true, title: t.medicationUsage.title }} />
            <Stack.Screen name="record/medication/[id]" options={{ headerShown: true, title: t.medicationUsage.title }} />
        <Stack.Screen name="record/comorbidity/index" options={{ headerShown: true, title: t.comorbidity.title }} />
        <Stack.Screen name="record/comorbidity/add" options={{ headerShown: true, title: t.comorbidity.addTitle }} />
        <Stack.Screen name="record/comorbidity/[id]" options={{ headerShown: true, title: t.comorbidity.detailTitle }} />
        <Stack.Screen name="record/smoking/index" options={{ headerShown: true, title: t.smoking.title }} />
        <Stack.Screen name="record/smoking/add" options={{ headerShown: true, title: t.smoking.addTitle }} />
        <Stack.Screen name="record/smoking/[id]" options={{ headerShown: true, title: t.smoking.detailTitle }} />
        <Stack.Screen name="record/sleep/index" options={{ headerShown: true, title: t.sleep.title }} />
        <Stack.Screen name="record/sleep/add" options={{ headerShown: true, title: t.sleep.addTitle }} />
        <Stack.Screen name="record/sleep/[id]" options={{ headerShown: true, title: t.sleep.detailTitle }} />
        <Stack.Screen name="documents" options={{ headerShown: true, title: t.documents.title }} />
        <Stack.Screen name="reminders" options={{ headerShown: true, title: t.reminders.title }} />
        <Stack.Screen name="export" options={{ headerShown: true, title: t.export.title }} />
        <Stack.Screen name="record/rehab/index" options={{ headerShown: true, title: t.rehab.title }} />
        <Stack.Screen name="action-plan" options={{ headerShown: true, title: t.actionPlan.viewTitle }} />
        <Stack.Screen name="vaccination" options={{ headerShown: true, title: t.vaccination.title }} />
        <Stack.Screen name="summary" options={{ headerShown: true, title: t.summary.title }} />
        <Stack.Screen name="about" options={{ headerShown: true, title: t.about.title }} />
        <Stack.Screen name="module-photos" options={{ headerShown: true, title: '📷 ' + t.form.photo }} />
      </Stack>
    </PaperProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' },
});
