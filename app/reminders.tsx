// 提醒设置页 — 每日测量提醒 + 月度评分提醒 + 复查提醒
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, Card, Switch, Button, TextInput, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { getDatabase } from '../src/database';

interface ReminderSettings {
  dailyVitalsEnabled: boolean;
  dailyVitalsTime: string;
  monthlySymptomEnabled: boolean;
  annualPftEnabled: boolean;
  sixMwtEnabled: boolean;
  followupEnabled: boolean;
  followupIntervalMonths: number;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  dailyVitalsEnabled: true, dailyVitalsTime: '09:00',
  monthlySymptomEnabled: true,
  annualPftEnabled: true,
  sixMwtEnabled: true,
  followupEnabled: true, followupIntervalMonths: 3,
};

async function loadSettings(): Promise<ReminderSettings> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ value: string }>(
      "SELECT value FROM app_settings WHERE key = 'reminder_settings'"
    );
    if (row?.value) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(row.value) };
    }
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

async function persistSettings(s: ReminderSettings): Promise<void> {
  try {
    const db = await getDatabase();
    await db.runAsync(
      "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('reminder_settings', ?)",
      [JSON.stringify(s)]
    );
  } catch { /* ignore */ }
}

import { useT } from '../src/i18n';

export default function RemindersScreen() {
  const t = useT();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [timeInput, setTimeInput] = useState(DEFAULT_SETTINGS.dailyVitalsTime);
  const [intervalInput, setIntervalInput] = useState(DEFAULT_SETTINGS.followupIntervalMonths.toString());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then(s => {
      setSettings(s);
      setTimeInput(s.dailyVitalsTime);
      setIntervalInput(s.followupIntervalMonths.toString());
      setLoaded(true);
    });
  }, []);

  const saveSettings = async (s: ReminderSettings) => {
    setSettings(s);
    await persistSettings(s);
    await scheduleAll(s);
  };

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限未授予', '请在系统设置中允许通知权限', [
        { text: '去设置', onPress: () => Linking.openSettings() },
        { text: '取消', style: 'cancel' },
      ]);
      return false;
    }
    return true;
  };

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false,
        shouldShowBanner: true, shouldShowList: true,
      }),
    });
  }, []);

  const scheduleAll = async (s: ReminderSettings) => {
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (s.dailyVitalsEnabled) {
      const [h, m] = s.dailyVitalsTime.split(':').map(Number);
      await Notifications.scheduleNotificationAsync({
        content: { title: '🫀 今日指脉氧测量', body: '请测量并记录您的血氧饱和度和心率', sound: 'default' },
        trigger: { type: 'daily', hour: h, minute: m } as Notifications.NotificationTriggerInput,
      });
    }

    if (s.monthlySymptomEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: { title: '📋 月度症状评分', body: '请完成 CAT 和 mMRC 量表评分，评估本月病情变化', sound: 'default' },
        trigger: { type: 'monthly', day: 1, hour: 9, minute: 0 } as Notifications.NotificationTriggerInput,
      });
    }

    if (s.annualPftEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: { title: '🫁 年度肺功能复查', body: 'GOLD 2026 建议每年至少完成一次肺功能检查，请安排复查', sound: 'default' },
        trigger: { type: 'yearly', month: 1, day: 1, hour: 9, minute: 0 } as Notifications.NotificationTriggerInput,
      });
    }

    if (s.sixMwtEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: { title: '🏃 6分钟步行测试', body: '建议每 6 个月进行一次 6MWT 运动耐力评估', sound: 'default' },
        trigger: { type: 'yearly', month: new Date().getMonth() > 5 ? 1 : 7, day: 1, hour: 9, minute: 0 } as Notifications.NotificationTriggerInput,
      });
    }

    if (s.followupEnabled) {
      await Notifications.scheduleNotificationAsync({
        content: { title: '🏥 肺功能复查提醒', body: `距上次肺功能检查已 ${s.followupIntervalMonths} 个月，请安排复查`, sound: 'default' },
        trigger: { type: 'daily', hour: 8, minute: 30 } as Notifications.NotificationTriggerInput,
      });
    }
  };

  const toggle = async (key: keyof ReminderSettings, value: boolean) => {
    const granted = await requestPermission();
    if (!granted) return;
    const next = { ...settings, [key]: value };
    saveSettings(next);
  };

  const updateTime = () => {
    const match = timeInput.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) { Alert.alert('格式错误', '请输入 HH:MM 格式，如 09:00'); return; }
    const next = { ...settings, dailyVitalsTime: timeInput };
    saveSettings(next);
  };

  const updateInterval = () => {
    const n = parseInt(intervalInput);
    if (isNaN(n) || n < 1 || n > 12) { Alert.alert('范围错误', '请输入 1-12 个月'); return; }
    const next = { ...settings, followupIntervalMonths: n };
    saveSettings(next);
  };

  return (
    <ScrollView style={st.ct} contentContainerStyle={st.scroll}>
      <Card style={st.card}>
        <Card.Content>
          <View style={st.row}>
            <View style={st.labelRow}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color="#C62828" />
              <Text style={st.label}>{t.reminders.dailyVitals}</Text>
            </View>
            <Switch value={settings.dailyVitalsEnabled} onValueChange={v => toggle('dailyVitalsEnabled', v)} />
          </View>
          {settings.dailyVitalsEnabled && (
            <View style={st.subsection}>
              <Text style={st.subLabel}>{t.reminders.dailyVitalsDesc}</Text>
              <View style={st.inputRow}>
                <TextInput mode="outlined" value={timeInput} onChangeText={setTimeInput}
                  style={st.timeInput} placeholder="09:00" maxLength={5} />
                <Button mode="contained-tonal" onPress={updateTime}>{t.reminders.setTime}</Button>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={st.card}>
        <Card.Content>
          <View style={st.row}>
            <View style={st.labelRow}>
              <MaterialCommunityIcons name="clipboard-list" size={24} color="#6A1B9A" />
              <Text style={st.label}>{t.reminders.monthlySymptom}</Text>
            </View>
            <Switch value={settings.monthlySymptomEnabled} onValueChange={v => toggle('monthlySymptomEnabled', v)} />
          </View>
          {settings.monthlySymptomEnabled && (
            <Text style={st.hint}>每月 1 日上午 9:00 提醒完成 CAT + mMRC 评分</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={st.card}>
        <Card.Content>
          <View style={st.row}>
            <View style={st.labelRow}>
              <MaterialCommunityIcons name="lungs" size={24} color="#2E7D32" />
              <Text style={st.label}>年度肺功能复查</Text>
            </View>
            <Switch value={settings.annualPftEnabled} onValueChange={v => toggle('annualPftEnabled', v)} />
          </View>
          {settings.annualPftEnabled && (
            <Text style={st.hint}>GOLD 2026 建议每年至少完成一次肺功能检查</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={st.card}>
        <Card.Content>
          <View style={st.row}>
            <View style={st.labelRow}>
              <MaterialCommunityIcons name="run-fast" size={24} color="#E65100" />
              <Text style={st.label}>6 分钟步行测试复查</Text>
            </View>
            <Switch value={settings.sixMwtEnabled} onValueChange={v => toggle('sixMwtEnabled', v)} />
          </View>
          {settings.sixMwtEnabled && (
            <Text style={st.hint}>建议每 6 个月进行一次 6MWT 运动耐力评估</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={st.card}>
        <Card.Content>
          <View style={st.row}>
            <View style={st.labelRow}>
              <MaterialCommunityIcons name="hospital" size={24} color="#2E7D32" />
              <Text style={st.label}>复查提醒</Text>
            </View>
            <Switch value={settings.followupEnabled} onValueChange={v => toggle('followupEnabled', v)} />
          </View>
          {settings.followupEnabled && (
            <View style={st.subsection}>
              <Text style={st.subLabel}>复查间隔（月）</Text>
              <View style={st.inputRow}>
                <TextInput mode="outlined" value={intervalInput} onChangeText={setIntervalInput}
                  style={st.timeInput} placeholder="3" maxLength={2} keyboardType="numeric" />
                <Button mode="contained-tonal" onPress={updateInterval}>设置</Button>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      <Surface style={st.info}>
        <MaterialCommunityIcons name="information" size={20} color="#666" />
        <Text style={st.infoText}>提醒仅存储在您的手机上，不上传服务器。请保持通知权限开启。</Text>
      </Surface>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { marginBottom: 12, borderRadius: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  label: { fontSize: 16, fontWeight: '600', color: '#424242' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 4 },
  subsection: { marginTop: 12, paddingLeft: 34 },
  subLabel: { fontSize: 14, color: '#666', marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeInput: { flex: 1, backgroundColor: '#FFF' },
  hint: { fontSize: 13, color: '#888', marginTop: 8, paddingLeft: 34 },
  info: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, gap: 8, backgroundColor: '#E3F2FD', marginTop: 8 },
  infoText: { flex: 1, fontSize: 13, color: '#666' },
});
