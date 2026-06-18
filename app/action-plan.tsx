// 行动计划（Action Plan）— 绿/黄/红三区自我管理方案
// COPD 患者最重要的自我管理工具，告知患者"什么情况下该做什么"
import React, { useCallback, useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Text, TextInput, Button, Card, Surface, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useT } from '../src/i18n';
import { getActionPlan, saveActionPlan } from '../src/database/repositories/actionPlanRepo';
import type { ActionPlan } from '../src/types/models';

const emptyPlan = {
  zone: 'green' as 'green' | 'yellow' | 'red',
  green_daily_meds: '',
  green_exercise: '',
  green_oxygen: '',
  yellow_symptoms: '',
  yellow_actions: '',
  yellow_meds_adjust: '',
  red_emergency_symptoms: '',
  red_actions: '',
  red_contact: '',
  doctor_name: '',
  doctor_phone: '',
  last_reviewed: null as string | null,
  notes: '',
};

export default function ActionPlanScreen() {
  const t = useT();
  const [plan, setPlan] = useState(emptyPlan);
  const [hasExisting, setHasExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTab, setEditTab] = useState<'view' | 'edit'>('view');

  useFocusEffect(useCallback(() => {
    getActionPlan().then((p) => {
      if (p) {
        setPlan({
          ...emptyPlan,
          zone: p.zone,
          green_daily_meds: p.green_daily_meds ?? '',
          green_exercise: p.green_exercise ?? '',
          green_oxygen: p.green_oxygen ?? '',
          yellow_symptoms: p.yellow_symptoms ?? '',
          yellow_actions: p.yellow_actions ?? '',
          yellow_meds_adjust: p.yellow_meds_adjust ?? '',
          red_emergency_symptoms: p.red_emergency_symptoms ?? '',
          red_actions: p.red_actions ?? '',
          red_contact: p.red_contact ?? '',
          doctor_name: p.doctor_name ?? '',
          doctor_phone: p.doctor_phone ?? '',
          last_reviewed: p.last_reviewed,
          notes: p.notes ?? '',
        });
        setHasExisting(true);
      }
    });
  }, []));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveActionPlan({
        zone: 'green',
        green_daily_meds: plan.green_daily_meds || null,
        green_exercise: plan.green_exercise || null,
        green_oxygen: plan.green_oxygen || null,
        yellow_symptoms: plan.yellow_symptoms || null,
        yellow_actions: plan.yellow_actions || null,
        yellow_meds_adjust: plan.yellow_meds_adjust || null,
        red_emergency_symptoms: plan.red_emergency_symptoms || null,
        red_actions: plan.red_actions || null,
        red_contact: plan.red_contact || null,
        doctor_name: plan.doctor_name || null,
        doctor_phone: plan.doctor_phone || null,
        last_reviewed: new Date().toISOString().slice(0, 10),
        notes: plan.notes || null,
      });
      setHasExisting(true);
      setEditTab('view');
      Alert.alert(t.actionPlan.saved, t.actionPlan.savedMsg);
    } catch {
      Alert.alert(t.actionPlan.saveError, t.actionPlan.saveErrorMsg);
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string) => {
    setPlan((prev) => ({ ...prev, [field]: value }));
  };

  // 查看模式
  if (editTab === 'view' && hasExisting) {
    return (
      <ScrollView style={s.ct} contentContainerStyle={s.scroll}>
        {/* 绿区卡片 */}
        <Card style={[s.zoneCard, s.greenCard]}>
          <Card.Content>
            <View style={s.zoneHeader}>
              <MaterialCommunityIcons name="check-circle" size={28} color="#2E7D32" />
              <Text style={[s.zoneTitle, s.greenText]}>{t.actionPlan.greenTitle}</Text>
              <Text style={s.zoneSub}>{t.actionPlan.greenSub}</Text>
            </View>
            {plan.green_daily_meds ? <Text style={s.zoneItem}>{t.actionPlan.greenDailyMeds}{plan.green_daily_meds}</Text> : null}
            {plan.green_exercise ? <Text style={s.zoneItem}>{t.actionPlan.greenExercise}{plan.green_exercise}</Text> : null}
            {plan.green_oxygen ? <Text style={s.zoneItem}>{t.actionPlan.greenOxygen}{plan.green_oxygen}</Text> : null}
          </Card.Content>
        </Card>

        {/* 黄区卡片 */}
        <Card style={[s.zoneCard, s.yellowCard]}>
          <Card.Content>
            <View style={s.zoneHeader}>
              <MaterialCommunityIcons name="alert" size={28} color="#E65100" />
              <Text style={[s.zoneTitle, s.yellowText]}>{t.actionPlan.yellowTitle}</Text>
              <Text style={s.zoneSub}>{t.actionPlan.yellowSub}</Text>
            </View>
            {plan.yellow_symptoms ? <Text style={s.zoneItem}>{t.actionPlan.yellowSymptoms}{plan.yellow_symptoms}</Text> : null}
            {plan.yellow_actions ? <Text style={s.zoneItem}>{t.actionPlan.yellowActions}{plan.yellow_actions}</Text> : null}
            {plan.yellow_meds_adjust ? <Text style={s.zoneItem}>{t.actionPlan.yellowMedsAdjust}{plan.yellow_meds_adjust}</Text> : null}
          </Card.Content>
        </Card>

        {/* 红区卡片 */}
        <Card style={[s.zoneCard, s.redCard]}>
          <Card.Content>
            <View style={s.zoneHeader}>
              <MaterialCommunityIcons name="alert-octagon" size={28} color="#C62828" />
              <Text style={[s.zoneTitle, s.redText]}>{t.actionPlan.redTitle}</Text>
              <Text style={s.zoneSub}>{t.actionPlan.redSub}</Text>
            </View>
            {plan.red_emergency_symptoms ? <Text style={s.zoneItem}>{t.actionPlan.redSymptoms}{plan.red_emergency_symptoms}</Text> : null}
            {plan.red_actions ? <Text style={[s.zoneItem, s.redAction]}>{t.actionPlan.redActions}{plan.red_actions}</Text> : null}
            {plan.red_contact ? <Text style={s.zoneItem}>{t.actionPlan.redContact}{plan.red_contact}</Text> : null}
          </Card.Content>
        </Card>

        {/* 医生信息 */}
        {plan.doctor_name && (
          <Card style={s.infoCard}>
            <Card.Content>
              <Text style={s.infoTitle}>{t.actionPlan.doctorTitle}</Text>
              {plan.doctor_name && <Text style={s.infoText}>{t.actionPlan.doctorName}{plan.doctor_name}</Text>}
              {plan.doctor_phone && <Text style={s.infoText}>{t.actionPlan.doctorPhone}{plan.doctor_phone}</Text>}
              {plan.last_reviewed && <Text style={s.infoText}>{t.actionPlan.lastReviewed}{plan.last_reviewed}</Text>}
            </Card.Content>
          </Card>
        )}

        <Button
          mode="outlined"
          icon="pencil"
          onPress={() => setEditTab('edit')}
          style={s.editBtn}
          contentStyle={{ paddingVertical: 8 }}
        >
          {t.actionPlan.editBtn}
        </Button>
        <Text style={s.disclaimer}>
          {t.actionPlan.disclaimer}
        </Text>
      </ScrollView>
    );
  }

  // 编辑模式
  return (
    <KeyboardAvoidingView style={s.ct} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Text style={s.editTitle}>
          {hasExisting ? t.actionPlan.editTitle : t.actionPlan.createTitle}
        </Text>
        <Text style={s.editHint}>
          {t.actionPlan.editHint}
        </Text>

        {/* 医生信息 */}
        <Card style={s.editCard}>
          <Card.Content>
            <Text style={s.editSectionTitle}>{t.actionPlan.doctorTitle}</Text>
            <TextInput mode="outlined" label={t.actionPlan.doctorNameLabel} value={plan.doctor_name}
              onChangeText={(v) => update('doctor_name', v)} style={s.input} />
            <TextInput mode="outlined" label={t.actionPlan.doctorPhoneLabel} value={plan.doctor_phone}
              onChangeText={(v) => update('doctor_phone', v)} keyboardType="phone-pad" style={s.input} />
          </Card.Content>
        </Card>

        {/* 绿区 */}
        <Card style={[s.editCard, { borderLeftColor: '#2E7D32' }]}>
          <Card.Content>
            <Text style={s.editSectionTitle}>{t.actionPlan.greenTitle}</Text>
            <TextInput mode="outlined" label={t.actionPlan.greenMedsLabel} value={plan.green_daily_meds}
              onChangeText={(v) => update('green_daily_meds', v)} multiline numberOfLines={2}
              placeholder={t.actionPlan.greenMedsPlaceholder} style={s.input} />
            <TextInput mode="outlined" label={t.actionPlan.greenExerciseLabel} value={plan.green_exercise}
              onChangeText={(v) => update('green_exercise', v)} multiline numberOfLines={2}
              placeholder={t.actionPlan.greenExercisePlaceholder} style={s.input} />
            <TextInput mode="outlined" label={t.actionPlan.greenOxygen.replace(':','')} value={plan.green_oxygen}
              onChangeText={(v) => update('green_oxygen', v)}
              placeholder={t.actionPlan.greenExercisePlaceholder} style={s.input} />
          </Card.Content>
        </Card>

        {/* 黄区 */}
        <Card style={[s.editCard, { borderLeftColor: '#E65100' }]}>
          <Card.Content>
            <Text style={s.editSectionTitle}>{t.actionPlan.yellowTitle}</Text>
            <TextInput mode="outlined" label={t.actionPlan.yellowSymptomsLabel} value={plan.yellow_symptoms}
              onChangeText={(v) => update('yellow_symptoms', v)} multiline numberOfLines={3}
              placeholder={t.actionPlan.greenExercisePlaceholder} style={s.input} />
            <TextInput mode="outlined" label={t.actionPlan.yellowActionsLabel} value={plan.yellow_actions}
              onChangeText={(v) => update('yellow_actions', v)} multiline numberOfLines={3}
              placeholder={t.actionPlan.greenExercisePlaceholder} style={s.input} />
            <TextInput mode="outlined" label={t.actionPlan.yellowMedsLabel} value={plan.yellow_meds_adjust}
              onChangeText={(v) => update('yellow_meds_adjust', v)} multiline numberOfLines={2}
              placeholder={t.actionPlan.greenExercisePlaceholder} style={s.input} />
          </Card.Content>
        </Card>

        {/* 红区 */}
        <Card style={[s.editCard, { borderLeftColor: '#C62828' }]}>
          <Card.Content>
            <Text style={s.editSectionTitle}>{t.actionPlan.redTitle}</Text>
            <TextInput mode="outlined" label={t.actionPlan.redSymptomsLabel} value={plan.red_emergency_symptoms}
              onChangeText={(v) => update('red_emergency_symptoms', v)} multiline numberOfLines={3}
              placeholder={t.actionPlan.greenExercisePlaceholder} style={s.input} />
            <TextInput mode="outlined" label={t.actionPlan.redActionsLabel} value={plan.red_actions}
              onChangeText={(v) => update('red_actions', v)} multiline numberOfLines={2}
              placeholder={t.actionPlan.greenExercisePlaceholder} style={s.input} />
            <TextInput mode="outlined" label={t.actionPlan.redContactLabel} value={plan.red_contact}
              onChangeText={(v) => update('red_contact', v)} multiline numberOfLines={2}
              placeholder={t.actionPlan.greenExercisePlaceholder} style={s.input} />
          </Card.Content>
        </Card>

        {/* 备注 */}
        <TextInput mode="outlined" label={t.common.notes} value={plan.notes}
          onChangeText={(v) => update('notes', v)} multiline numberOfLines={3} style={s.input} />

        <View style={s.btnRow}>
          {hasExisting && (
            <Button mode="outlined" onPress={() => setEditTab('view')} style={[s.btn, s.cancelBtn]}>
              {t.common.cancel}
            </Button>
          )}
          <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}
            style={[s.btn, s.saveBtn]} contentStyle={{ paddingVertical: 10 }}>
            {t.actionPlan.saveBtn}
          </Button>
        </View>

        <Text style={s.disclaimer}>
          {t.actionPlan.disclaimer}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 16, paddingBottom: 40 },
  // 查看模式
  zoneCard: { borderRadius: 12, marginBottom: 14, elevation: 2 },
  greenCard: { borderLeftWidth: 6, borderLeftColor: '#2E7D32' },
  yellowCard: { borderLeftWidth: 6, borderLeftColor: '#E65100' },
  redCard: { borderLeftWidth: 6, borderLeftColor: '#C62828' },
  zoneHeader: { marginBottom: 10 },
  zoneTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  zoneSub: { fontSize: 14, color: '#666', marginTop: 2 },
  greenText: { color: '#2E7D32' },
  yellowText: { color: '#E65100' },
  redText: { color: '#C62828' },
  zoneItem: { fontSize: 15, color: '#333', marginBottom: 6, lineHeight: 22 },
  redAction: { color: '#C62828', fontWeight: 'bold' },
  infoCard: { borderRadius: 12, marginBottom: 14 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#424242', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#555', marginBottom: 4 },
  editBtn: { borderRadius: 10, marginTop: 8 },
  // 编辑模式
  editTitle: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginBottom: 6 },
  editHint: { fontSize: 14, color: '#888', marginBottom: 16, lineHeight: 20 },
  editCard: { borderRadius: 12, marginBottom: 14, borderLeftWidth: 5, borderLeftColor: '#2E7D32' },
  editSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#424242', marginBottom: 12 },
  input: { marginBottom: 10, backgroundColor: '#FFF' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  btn: { flex: 1, borderRadius: 10 },
  cancelBtn: { borderColor: '#BDBDBD' },
  saveBtn: { backgroundColor: '#2E7D32' },
  disclaimer: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 16 },
});
