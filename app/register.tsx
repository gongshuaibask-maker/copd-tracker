// 首次注册页
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import DatePicker from '../src/components/DatePicker';
import { useRouter } from 'expo-router';
import { createUser } from '../src/database/repositories/userRepo';
import { useT } from '../src/i18n';
import { format, isValid } from 'date-fns';

export default function RegisterScreen() {
  const router = useRouter();
  const t = useT();

  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState(new Date(1961, 0, 1)); // COPD典型高发年龄65岁
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  const canSubmit = nickname.trim().length > 0;

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      await createUser({
        nickname: nickname.trim(),
        birth_date: format(birthDate, 'yyyy-MM-dd'),
        gender,
        height_cm: height ? parseFloat(height) : 170,
        weight_kg: weight ? parseFloat(weight) : 65,
        diagnosis_date: null,
        gold_stage: null,
      });
      router.replace('/');
    } catch {
      Alert.alert(t.common.save, t.register.errorSave);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.icon}>🫁</Text>
          <Text style={styles.title}>{t.register.subtitle}</Text>
          <Text style={styles.subtitle}>{t.register.title}</Text>
        </View>

        <TextInput
          label={t.register.nickname + ' *'}
          value={nickname}
          onChangeText={setNickname}
          mode="outlined"
          style={styles.input}
          maxLength={20}
        />

        <Text style={styles.label}>{t.register.birthDate + ' *'}</Text>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
          icon="calendar"
        >
          {isValid(birthDate) ? format(birthDate, 'yyyy-MM-dd') : t.form.selectDate}
        </Button>
        <DatePicker
          visible={showDatePicker}
          value={birthDate}
          maximumDate={new Date()}
          onChange={(d) => setBirthDate(d)}
          onClose={() => setShowDatePicker(false)}
        />

        <Text style={styles.label}>{t.register.gender + ' *'}</Text>
        <SegmentedButtons
          value={gender}
          onValueChange={(v) => setGender(v as 'male' | 'female')}
          buttons={[
            { value: 'male', label: t.register.male },
            { value: 'female', label: t.register.female },
          ]}
          style={styles.input}
        />

        <TextInput
          label={t.register.height + t.common.optional}
          value={height}
          onChangeText={setHeight}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          right={<TextInput.Affix text="cm" />}
        />

        <TextInput
          label={t.register.weight + t.common.optional}
          value={weight}
          onChangeText={setWeight}
          mode="outlined"
          keyboardType="decimal-pad"
          style={styles.input}
          right={<TextInput.Affix text="kg" />}
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={!canSubmit}
          style={styles.submit}
          contentStyle={{ paddingVertical: 8 }}
        >
          {t.common.save}
        </Button>

        <Text style={styles.privacy}>ⓘ {t.reminders.privacyNote}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 32 },
  icon: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  label: { fontSize: 14, marginBottom: 4, marginLeft: 4, color: '#666' },
  input: { marginBottom: 16 },
  submit: { marginTop: 16, borderRadius: 8 },
  privacy: { textAlign: 'center', color: '#999', marginTop: 16, fontSize: 12 },
});
