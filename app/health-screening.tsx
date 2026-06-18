// 健康筛查页 — PHQ-2（抑郁）+ GAD-2（焦虑）+ SARC-F（肌少症）
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, RadioButton, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useT } from '../src/i18n';

interface Question {
  id: string;
  text: string;
  options: { label: string; value: number }[];
}

function makePHQ2(t: any): Question[] {
  const opts = [
    { label: t.healthScreening.optNone, value: 0 },
    { label: t.healthScreening.optSeveral, value: 1 },
    { label: t.healthScreening.optHalf, value: 2 },
    { label: t.healthScreening.optNearly, value: 3 },
  ];
  return [
    { id: 'phq1', text: t.healthScreening.phq1, options: opts },
    { id: 'phq2', text: t.healthScreening.phq2, options: opts },
  ];
}

function makeGAD2(t: any): Question[] {
  const opts = [
    { label: t.healthScreening.optNone, value: 0 },
    { label: t.healthScreening.optSeveral, value: 1 },
    { label: t.healthScreening.optHalf, value: 2 },
    { label: t.healthScreening.optNearly, value: 3 },
  ];
  return [
    { id: 'gad1', text: t.healthScreening.gad1, options: opts },
    { id: 'gad2', text: t.healthScreening.gad2, options: opts },
  ];
}

function makeSARCF(t: any): Question[] {
  return [
    { id: 'sarc1', text: t.healthScreening.sarc1,
      options: [{ label: t.healthScreening.optNoDiff, value: 0 }, { label: t.healthScreening.optSomeDiff, value: 1 }, { label: t.healthScreening.optVeryDiff, value: 2 }] },
    { id: 'sarc2', text: t.healthScreening.sarc2,
      options: [{ label: t.healthScreening.optNoDiff, value: 0 }, { label: t.healthScreening.optSomeDiff, value: 1 }, { label: t.healthScreening.optVeryDiff, value: 2 }] },
    { id: 'sarc3', text: t.healthScreening.sarc3,
      options: [{ label: t.healthScreening.optNoDiff, value: 0 }, { label: t.healthScreening.optSomeDiff, value: 1 }, { label: t.healthScreening.optVeryDiff, value: 2 }] },
    { id: 'sarc4', text: t.healthScreening.sarc4,
      options: [{ label: t.healthScreening.optNoDiff, value: 0 }, { label: t.healthScreening.optSomeDiff, value: 1 }, { label: t.healthScreening.optVeryDiff, value: 2 }] },
    { id: 'sarc5', text: t.healthScreening.sarc5,
      options: [{ label: t.healthScreening.optNoFall, value: 0 }, { label: t.healthScreening.optFewFalls, value: 1 }, { label: t.healthScreening.optManyFalls, value: 2 }] },
  ];
}

function ScoreBlock({ title, score, max, icon, color, result, pointsSuffix }: {
  title: string; score: number; max: number; icon: string; color: string; result: string; pointsSuffix?: string;
}) {
  const level = score >= max * 0.5 ? 'red' : score >= max * 0.3 ? 'yellow' : 'green';
  const bgColor = level === 'red' ? '#FFEBEE' : level === 'yellow' ? '#FFF3E0' : '#E8F5E9';
  const textColor = level === 'red' ? '#C62828' : level === 'yellow' ? '#E65100' : '#2E7D32';
  return (
    <Surface style={[st.scoreBlock, { backgroundColor: bgColor, borderLeftColor: color }]}>
      <View style={st.scoreHeader}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
        <Text style={[st.scoreTitle, { color }]}>{title}</Text>
      </View>
      <Text style={[st.scoreValue, { color: textColor }]}>{score} / {max}{pointsSuffix ?? ' pts'}</Text>
      <Text style={st.scoreResult}>{result}</Text>
    </Surface>
  );
}

export default function HealthScreeningScreen() {
  const t = useT();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const PHQ2 = makePHQ2(t);
  const GAD2 = makeGAD2(t);
  const SARCF = makeSARCF(t);

  const setAnswer = (qid: string, val: number) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  };

  const phq2Score = PHQ2.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  const gad2Score = GAD2.reduce((s, q) => s + (answers[q.id] ?? 0), 0);
  const sarcfScore = SARCF.reduce((s, q) => s + (answers[q.id] ?? 0), 0);

  const allAnswered = [...PHQ2, ...GAD2, ...SARCF].every(q => answers[q.id] !== undefined);

  const phqResult = phq2Score >= 3 ? t.healthScreening.phqSevere : phq2Score >= 2 ? t.healthScreening.phqMild : t.healthScreening.phqNormal;
  const gadResult = gad2Score >= 3 ? t.healthScreening.gadSevere : gad2Score >= 2 ? t.healthScreening.gadMild : t.healthScreening.gadNormal;
  const sarcResult = sarcfScore >= 4 ? t.healthScreening.sarcSevere : sarcfScore >= 2 ? t.healthScreening.sarcMild : t.healthScreening.sarcNormal;

  return (
    <ScrollView style={st.ct} contentContainerStyle={st.scroll}>
      <Text style={st.title}>{t.healthScreening.title}</Text>
      <Text style={st.sub}>{t.healthScreening.sub}</Text>

      {/* PHQ-2 */}
      <Card style={st.card}>
        <Card.Content>
          <Text style={st.sectionTitle}>{t.healthScreening.phq2Title}</Text>
          {PHQ2.map(q => (
            <View key={q.id} style={st.question}>
              <Text style={st.qText}>{q.text}</Text>
              <RadioButton.Group value={answers[q.id]?.toString() ?? ''}
                onValueChange={v => setAnswer(q.id, parseInt(v))}>
                {q.options.map(o => (
                  <View key={o.value} style={st.option}>
                    <RadioButton value={o.value.toString()} />
                    <Text style={st.optLabel}>{o.label}</Text>
                  </View>
                ))}
              </RadioButton.Group>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* GAD-2 */}
      <Card style={st.card}>
        <Card.Content>
          <Text style={st.sectionTitle}>{t.healthScreening.gad2Title}</Text>
          {GAD2.map(q => (
            <View key={q.id} style={st.question}>
              <Text style={st.qText}>{q.text}</Text>
              <RadioButton.Group value={answers[q.id]?.toString() ?? ''}
                onValueChange={v => setAnswer(q.id, parseInt(v))}>
                {q.options.map(o => (
                  <View key={o.value} style={st.option}>
                    <RadioButton value={o.value.toString()} />
                    <Text style={st.optLabel}>{o.label}</Text>
                  </View>
                ))}
              </RadioButton.Group>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* SARC-F */}
      <Card style={st.card}>
        <Card.Content>
          <Text style={st.sectionTitle}>{t.healthScreening.sarcfTitle}</Text>
          {SARCF.map(q => (
            <View key={q.id} style={st.question}>
              <Text style={st.qText}>{q.text}</Text>
              <RadioButton.Group value={answers[q.id]?.toString() ?? ''}
                onValueChange={v => setAnswer(q.id, parseInt(v))}>
                {q.options.map(o => (
                  <View key={o.value} style={st.option}>
                    <RadioButton value={o.value.toString()} />
                    <Text style={st.optLabel}>{o.label}</Text>
                  </View>
                ))}
              </RadioButton.Group>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Button mode="contained" disabled={!allAnswered}
        onPress={() => setShowResults(true)}
        style={st.btn} buttonColor="#2E7D32">
        {allAnswered ? t.healthScreening.viewResults : t.healthScreening.completeAll.replace('{count}', '9')}
      </Button>

      {showResults && (
        <View style={st.results}>
          <ScoreBlock title={t.healthScreening.phq2Score} score={phq2Score} max={6} icon="emoticon-sad-outline" color="#6A1B9A" result={phqResult} pointsSuffix={t.healthScreening.points} />
          <ScoreBlock title={t.healthScreening.gad2Score} score={gad2Score} max={6} icon="alert-circle-outline" color="#0277BD" result={gadResult} pointsSuffix={t.healthScreening.points} />
          <ScoreBlock title={t.healthScreening.sarcfScore} score={sarcfScore} max={10} icon="arm-flex-outline" color="#E65100" result={sarcResult} pointsSuffix={t.healthScreening.points} />
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 16, paddingBottom: 60 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center' },
  sub: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 6, marginBottom: 16 },
  card: { marginBottom: 12, borderRadius: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#424242', marginBottom: 10 },
  question: { marginBottom: 14 },
  qText: { fontSize: 15, color: '#333', marginBottom: 6, lineHeight: 21 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  optLabel: { fontSize: 14, color: '#555' },
  btn: { marginTop: 8, borderRadius: 8 },
  results: { marginTop: 16, gap: 10 },
  scoreBlock: {
    padding: 16, borderRadius: 10, borderLeftWidth: 5,
  },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  scoreTitle: { fontSize: 16, fontWeight: 'bold' },
  scoreValue: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  scoreResult: { fontSize: 14, color: '#555', lineHeight: 20 },
});
