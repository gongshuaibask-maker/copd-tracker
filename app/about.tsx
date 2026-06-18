// 关于页面
import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, Card, Button, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useT } from '../src/i18n';

export default function AboutScreen() {
  const t = useT();
  return (
    <ScrollView style={st.ct} contentContainerStyle={st.scroll}>
      <Card style={st.card}>
        <Card.Content style={st.center}>
          <MaterialCommunityIcons name="lungs" size={64} color="#2E7D32" />
          <Text style={st.appName}>{t.about.appName}</Text>
          <Text style={st.version}>v1.0.0</Text>
          <Text style={st.desc}>{t.about.description}</Text>
        </Card.Content>
      </Card>

      <Card style={st.card}>
        <Card.Content>
          <Text style={st.section}>{t.about.featureTitle}</Text>
          {[
            t.about.feature1, t.about.feature2, t.about.feature3,
            t.about.feature4, t.about.feature5, t.about.feature6,
            t.about.feature7, t.about.feature8, t.about.feature9,
            t.about.feature10, t.about.feature11, t.about.feature12,
            t.about.feature13, t.about.feature14, t.about.feature15,
            t.about.feature16, t.about.feature17,
          ].map((f, i) => (
            <Text key={i} style={st.feature}>• {f}</Text>
          ))}
        </Card.Content>
      </Card>

      <Card style={st.card}>
        <Card.Content>
          <Text style={st.section}>{t.about.techTitle}</Text>
          <Text style={st.tech}>{t.about.tech1}</Text>
          <Text style={st.tech}>{t.about.tech2}</Text>
          <Text style={st.tech}>{t.about.tech3}</Text>
          <Text style={st.tech}>{t.about.tech4}</Text>
          <Text style={st.tech}>{t.about.tech5}</Text>
          <Text style={st.tech}>{t.about.tech6}</Text>
        </Card.Content>
      </Card>

      <Card style={[st.card, st.disclaimerCard]}>
        <Card.Content>
          <Text style={st.section}>{t.about.disclaimerTitle}</Text>
          <Text style={st.disclaimer}>
            {t.about.disclaimer1}
          </Text>
          <Text style={st.disclaimer}>
            {t.about.disclaimer2}
          </Text>
        </Card.Content>
      </Card>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const st = StyleSheet.create({
  ct: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: { marginBottom: 12, borderRadius: 10 },
  center: { alignItems: 'center', paddingVertical: 16 },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginTop: 12 },
  version: { fontSize: 14, color: '#888', marginTop: 4 },
  desc: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 12, lineHeight: 22 },
  section: { fontSize: 16, fontWeight: '600', color: '#424242', marginBottom: 10 },
  feature: { fontSize: 13, color: '#555', marginBottom: 4 },
  tech: { fontSize: 13, color: '#555', marginBottom: 3 },
  disclaimerCard: { borderLeftWidth: 4, borderLeftColor: '#E65100' },
  disclaimer: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 20 },
});
