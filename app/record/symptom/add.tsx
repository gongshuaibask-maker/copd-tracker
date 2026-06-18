import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Divider, Text, TextInput } from 'react-native-paper';
import DatePicker from '../../../src/components/DatePicker';
import { format, isValid, parseISO } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useT } from '../../../src/i18n';
import { CAT_QUESTIONS, MMRC_GRADES, getCATLevel } from '../../../src/constants/catQuestions';
import { createSymptomScore, getSymptomScore, updateSymptomScore } from '../../../src/database/repositories/symptomRepo';
import type { SymptomScore } from '../../../src/types/models';

const EMPTY_ANSWERS = Object.fromEntries(CAT_QUESTIONS.map((q) => [q.id, 0])) as Record<string, number>;

// CAT 每题分值对应的 Emoji 图标
const SCORE_EMOJI = ['😊', '🙂', '😐', '😕', '😟', '😫'];
// 0 → 从不/无影响，5 → 总是/严重影响
const SCORE_COLORS = ['#2E7D32', '#66BB6A', '#FFC107', '#FF9800', '#F44336', '#B71C1C'];

export default function SymptomAddScreen() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const recordId = id ? parseInt(id, 10) : null;
  const isEdit = !!recordId;

  const [recordDate, setRecordDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>(EMPTY_ANSWERS);
  const [mmrcGrade, setMmrcGrade] = useState(0);
  const [exacerbationCount, setExacerbationCount] = useState('0');
  const [exacerbationHospitalized, setExacerbationHospitalized] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!recordId) return;
    getSymptomScore(recordId).then((record) => {
      if (!record) return;
      setRecordDate(parseISO(record.record_date));
      setNotes(record.notes ?? '');
      setMmrcGrade(record.mmrc_grade ?? 0);
      setExacerbationCount(String(record.exacerbation_count ?? 0));
      setExacerbationHospitalized(record.exacerbation_hospitalized ?? 0);
      const nextAnswers = { ...EMPTY_ANSWERS };
      CAT_QUESTIONS.forEach((q) => {
        nextAnswers[q.id] = record[q.id as keyof SymptomScore] as number ?? 0;
      });
      setAnswers(nextAnswers);
    });
  }, [recordId]);

  const catTotal = useMemo(() => Object.values(answers).reduce((sum, value) => sum + value, 0), [answers]);
  const levelInfo = getCATLevel(catTotal);

  const handleScore = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dateStr = format(recordDate, 'yyyy-MM-dd');
      const answerMap: Record<string, number | null> = {
        cat_q1_cough: answers.cat_q1_cough ?? 0,
        cat_q2_phlegm: answers.cat_q2_phlegm ?? 0,
        cat_q3_chest_tight: answers.cat_q3_chest_tight ?? 0,
        cat_q4_breathless: answers.cat_q4_breathless ?? 0,
        cat_q5_home_activity: answers.cat_q5_home_activity ?? 0,
        cat_q6_going_out: answers.cat_q6_going_out ?? 0,
        cat_q7_sleep: answers.cat_q7_sleep ?? 0,
        cat_q8_energy: answers.cat_q8_energy ?? 0,
      };
      if (isEdit && recordId) {
        await updateSymptomScore(recordId, dateStr, catTotal, answerMap, mmrcGrade, notes || null, parseInt(exacerbationCount) || 0, exacerbationHospitalized);
      } else {
        await createSymptomScore(dateStr, catTotal, answerMap, mmrcGrade, notes || null, parseInt(exacerbationCount) || 0, exacerbationHospitalized);
      }
      router.back();
    } catch (e) {
      console.error('Save symptom score failed:', e);
      Alert.alert('错误', '保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>📅 评估日期</Text>
      <Button mode="outlined" onPress={() => setShowDatePicker(true)} icon="calendar" style={styles.dateBtn}>
        {isValid(recordDate) ? format(recordDate, 'yyyy-MM-dd') : '选择日期'}
      </Button>
      <DatePicker visible={showDatePicker} value={recordDate} maximumDate={new Date()} onChange={(d) => setRecordDate(d)} onClose={() => setShowDatePicker(false)} />

      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text style={styles.summaryLabel}>本次 CAT 总分</Text>
          <Text style={[styles.summaryValue, { color: levelInfo.color }]}>{catTotal}</Text>
          <Text style={styles.summaryHint}>{levelInfo.level}</Text>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>🧪 CAT 量表（8题）</Text>
      {CAT_QUESTIONS.map((question) => (
        <Card key={question.id} style={styles.card}>
          <Card.Content>
            <Text style={styles.questionText}>{question.text}</Text>
            <View style={styles.choiceRow}>
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <Chip
                  key={`${question.id}-${value}`}
                  mode={answers[question.id] === value ? 'flat' : 'outlined'}
                  selected={answers[question.id] === value}
                  onPress={() => handleScore(question.id, value)}
                  style={[
                    styles.chip,
                    answers[question.id] === value && { backgroundColor: SCORE_COLORS[value] + '30', borderColor: SCORE_COLORS[value] },
                  ]}
                  textStyle={[
                    styles.chipText,
                    answers[question.id] === value && { color: SCORE_COLORS[value], fontWeight: 'bold' },
                  ]}
                >
                  {SCORE_EMOJI[value]} {value}
                </Chip>
              ))}
            </View>
            <Text style={styles.scaleHint}>{question.leftLabel} → {question.rightLabel}</Text>
          </Card.Content>
        </Card>
      ))}

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>🫁 mMRC 呼吸困难分级</Text>
      <View style={styles.choiceRowWrap}>
        {MMRC_GRADES.map((item) => (
          <Chip
            key={`mmrc-${item.grade}`}
            mode={mmrcGrade === item.grade ? 'flat' : 'outlined'}
            selected={mmrcGrade === item.grade}
            onPress={() => setMmrcGrade(item.grade)}
            style={styles.chip}
          >
            {item.grade} 级
          </Chip>
        ))}
      </View>
      <Text style={styles.scaleHint}>0 级：仅剧烈活动时气短；4 级：不能离家活动。</Text>

      <Divider style={styles.divider} />

      <Text style={styles.sectionTitle}>⚠️ 过去 12 个月急性加重史（GOLD 分组必需）</Text>

      <Text style={styles.fieldLabel}>过去 12 个月急性加重次数</Text>
      <View style={styles.exacRow}>
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <Chip
            key={`exac-${n}`}
            mode={parseInt(exacerbationCount) === n ? 'flat' : 'outlined'}
            selected={parseInt(exacerbationCount) === n}
            onPress={() => setExacerbationCount(String(n))}
            style={styles.chip}
          >
            {n} 次
          </Chip>
        ))}
      </View>

      {parseInt(exacerbationCount) > 0 && (
        <>
          <Text style={styles.fieldLabel}>是否因急性加重住院治疗</Text>
          <View style={styles.exacRow}>
            <Chip
              mode={exacerbationHospitalized === 1 ? 'flat' : 'outlined'}
              selected={exacerbationHospitalized === 1}
              onPress={() => setExacerbationHospitalized(1)}
              style={styles.chip}
            >是，曾因加重住院</Chip>
            <Chip
              mode={exacerbationHospitalized === 0 ? 'flat' : 'outlined'}
              selected={exacerbationHospitalized === 0}
              onPress={() => setExacerbationHospitalized(0)}
              style={styles.chip}
            >否，均未住院</Chip>
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>📝 备注</Text>
      <TextInput
        mode="outlined"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={styles.notesInput}
        placeholder="可记录症状变化、活动耐受、用药情况等"
      />

      <Button mode="contained" onPress={handleSave} loading={saving} style={styles.saveBtn}>
        保存症状评分
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#424242', marginBottom: 8 },
  dateBtn: { marginBottom: 12 },
  summaryCard: { marginBottom: 12, borderRadius: 12, backgroundColor: '#fff' },
  summaryLabel: { fontSize: 12, color: '#999' },
  summaryValue: { fontSize: 30, fontWeight: 'bold', marginTop: 4 },
  summaryHint: { fontSize: 13, color: '#666', marginTop: 4 },
  card: { marginBottom: 10, borderRadius: 10, backgroundColor: '#fff' },
  questionText: { fontSize: 14, color: '#424242', marginBottom: 8 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choiceRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginTop: 8, marginBottom: 4 },
  exacRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { marginRight: 6, marginBottom: 6, minWidth: 56 },
  chipText: { fontSize: 14 },
  scaleHint: { fontSize: 12, color: '#999', marginTop: 8 },
  divider: { marginVertical: 12 },
  notesInput: { marginBottom: 16 },
  saveBtn: { borderRadius: 8, backgroundColor: '#2E7D32' },
});
