// 疫苗接种记录页
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, Button, TextInput, Modal, Surface, IconButton, Checkbox } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useT } from '../src/i18n';
import DatePicker from '../src/components/DatePicker';
import { format } from 'date-fns';
import { getAllVaccinations, createVaccination, deleteVaccination } from '../src/database/repositories/vaccinationRepo';
import { showConfirm } from '../src/utils/confirm';
import type { Vaccination } from '../src/types/models';

const VACCINE_TYPES: (t: any) => { key: Vaccination['vaccine_type']; label: string; icon: string; hint?: string }[] = (t) => [
  { key: 'influenza', label: t.vaccination.typeInfluenza, icon: 'needle' },
  { key: 'pneumococcal', label: t.vaccination.typePneumococcal, icon: 'lungs' },
  { key: 'covid19', label: t.vaccination.typeCovid19, icon: 'shield-check' },
  { key: 'tdap', label: t.vaccination.typeTdap, icon: 'syringe' },
  { key: 'rsv', label: t.vaccination.typeRsv, icon: 'virus-outline', hint: t.vaccination.rsvHint },
  { key: 'rsv_mrna', label: t.vaccination.typeRsvMrna, icon: 'dna', hint: t.vaccination.rsvMrnaHint },
  { key: 'other', label: t.vaccination.typeOther, icon: 'medical-bag' },
];

export default function VaccinationScreen() {
  const t = useT();
  const vaccineTypes = VACCINE_TYPES(t);
  const [records, setRecords] = useState<Vaccination[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [vaxType, setVaxType] = useState<Vaccination['vaccine_type']>('influenza');
  const [vaxName, setVaxName] = useState('');
  const [dose, setDose] = useState('1');
  const [vaxDate, setVaxDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [nextDue, setNextDue] = useState('');
  const [notes, setNotes] = useState('');
  const [highDose, setHighDose] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    getAllVaccinations().then(setRecords).catch(console.error);
  }, []));

  const handleSave = async () => {
    setSaving(true);
    try {
      await createVaccination({
        vaccine_type: vaxType,
        vaccine_name: vaxName || vaccineTypes.find(v => v.key === vaxType)!.label,
        dose_number: parseInt(dose) || 1,
        vaccination_date: format(vaxDate, 'yyyy-MM-dd'),
        next_due_date: nextDue || null,
        batch_number: null,
        high_dose: vaxType === 'influenza' && highDose ? 1 : 0,
        notes: notes || null,
      });
      const all = await getAllVaccinations();
      setRecords(all);
      resetForm();
    } catch { Alert.alert(t.vaccination.saveError, ''); } finally { setSaving(false); }
  };

  const resetForm = () => {
    setShowAdd(false); setVaxType('influenza'); setVaxName(''); setDose('1');
    setVaxDate(new Date()); setNextDue(''); setNotes(''); setHighDose(false);
  };

  const handleDelete = async (r: Vaccination) => {
    if (!await showConfirm(t.common.delete, t.vaccination.deleteConfirm.replace('{name}', r.vaccine_name), t.common.delete, t.common.cancel)) return;
    await deleteVaccination(r.id);
    setRecords(prev => prev.filter(x => x.id !== r.id));
  };

  const typeInfo = (k: string) => vaccineTypes.find(v => v.key === k);

  return (
    <View style={st.ct}>
      {records.length === 0 && !showAdd ? (
        <View style={st.empty}>
          <MaterialCommunityIcons name="needle" size={64} color="#BDBDBD" />
          <Text style={st.emptyTitle}>{t.vaccination.emptyTitle}</Text>
          <Text style={st.emptySub}>
            {t.vaccination.emptySub}
          </Text>
          <Button mode="contained" onPress={() => setShowAdd(true)} style={st.addBtn}>
            {t.vaccination.addBtn}
          </Button>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={i => i.id.toString()}
          contentContainerStyle={st.list}
          renderItem={({ item }) => {
            const info = typeInfo(item.vaccine_type);
            return (
              <Card style={st.card}>
                <Card.Content>
                  <View style={st.cardRow}>
                    <View style={st.cardInfo}>
                      <View style={st.cardHeader}>
                        <MaterialCommunityIcons name={info?.icon as any ?? 'needle'} size={22} color="#2E7D32" />
                        <Text style={st.cardTitle}>{item.vaccine_name}</Text>
                      </View>
                      <Text style={st.cardDate}>{item.vaccination_date} · 第{item.dose_number}剂</Text>
                      {item.next_due_date && (
                        <Text style={st.nextDue}>下次接种：{item.next_due_date}</Text>
                      )}
                    </View>
                    <IconButton
                      icon="delete-outline" size={20} iconColor="#C62828"
                      onPress={() => handleDelete(item)}
                    />
                  </View>
                </Card.Content>
              </Card>
            );
          }}
        />
      )}
      <FAB icon="plus" style={st.fab} onPress={() => setShowAdd(true)} label={t.vaccination.addFab} />

      {/* 添加弹窗 */}
      <Modal visible={showAdd} onDismiss={resetForm} contentContainerStyle={st.modal}>
        <Surface style={st.modalContent}>
          <Text style={st.modalTitle}>{t.vaccination.addTitle}</Text>

          <Text style={st.label}>{t.vaccination.vaccineType}</Text>
          <View style={st.typeGrid}>
            {vaccineTypes.map(vt => (
              <Button key={vt.key} mode={vaxType === vt.key ? 'contained' : 'outlined'}
                compact onPress={() => setVaxType(vt.key)}
                style={st.typeBtn}
                labelStyle={{ fontSize: 12 }}
              >
                {vt.label}
              </Button>
            ))}
          </View>
          {vaccineTypes.find(v => v.key === vaxType)?.hint && (
            <Text style={st.vaxHint}>{vaccineTypes.find(v => v.key === vaxType)!.hint}</Text>
          )}

          <TextInput mode="outlined" label={t.vaccination.vaccineName} value={vaxName}
            onChangeText={setVaxName} style={st.input}
            placeholder={vaccineTypes.find(v => v.key === vaxType)?.label} />

          <TextInput mode="outlined" label={t.vaccination.doseLabel} value={dose}
            onChangeText={setDose} keyboardType="numeric" style={st.input} />

          <Text style={st.label}>{t.vaccination.date}</Text>
          <Button mode="outlined" onPress={() => setShowDate(true)} icon="calendar">
            {format(vaxDate, 'yyyy-MM-dd')}
          </Button>
          <DatePicker visible={showDate} value={vaxDate} maximumDate={new Date()}
            onChange={(d) => setVaxDate(d)} onClose={() => setShowDate(false)} />

          <TextInput mode="outlined" label={t.vaccination.nextDue} value={nextDue}
            onChangeText={setNextDue} placeholder={t.vaccination.nextDuePlaceholder} style={st.input} />

          {vaxType === 'influenza' && (
            <View style={st.checkRow}>
              <Checkbox status={highDose ? 'checked' : 'unchecked'} onPress={() => setHighDose(!highDose)} />
              <Text style={st.checkLabel}>{t.vaccination.highDose}</Text>
            </View>
          )}

          <TextInput mode="outlined" label={t.vaccination.notes} value={notes}
            onChangeText={setNotes} multiline numberOfLines={2} style={st.input} />

          <View style={st.modalActions}>
            <Button mode="text" onPress={resetForm}>{t.vaccination.cancel}</Button>
            <Button mode="contained" onPress={handleSave} loading={saving}>{t.vaccination.save}</Button>
          </View>
        </Surface>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' },
  list: { padding: 12, paddingBottom: 80 },
  card: { marginBottom: 8, borderRadius: 10 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardInfo: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#424242' },
  cardDate: { fontSize: 14, color: '#666', marginTop: 4, marginLeft: 30 },
  nextDue: { fontSize: 13, color: '#2E7D32', marginTop: 2, marginLeft: 30 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, color: '#999', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#BDBDBD', marginTop: 8, textAlign: 'center', paddingHorizontal: 32, lineHeight: 22 },
  addBtn: { marginTop: 16, borderRadius: 8 },
  fab: { position: 'absolute', right: 16, bottom: 16, borderRadius: 16 },
  // Modal
  modal: { margin: 16 },
  modalContent: { borderRadius: 16, padding: 20, backgroundColor: '#FFF', maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#424242', marginTop: 12, marginBottom: 6 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeBtn: { marginBottom: 4 },
  vaxHint: { fontSize: 12, color: '#2E7D32', marginTop: 4, fontWeight: '600' },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 4 },
  checkLabel: { fontSize: 14, color: '#424242' },
  input: { marginTop: 10, backgroundColor: '#FFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
});
