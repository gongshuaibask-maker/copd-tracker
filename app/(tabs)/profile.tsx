// 个人中心页
import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Divider, List, Button } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { getUser } from '../../src/database/repositories/userRepo';
import { resetAllData } from '../../src/database/reset';
import { useT, useLanguage } from '../../src/i18n';
import type { User } from '../../src/types/models';

export default function ProfileScreen() {
  const router = useRouter();
  const t = useT();
  const { lang } = useLanguage();
  const [user, setUser] = useState<User | null>(null);

  useFocusEffect(useCallback(() => {
    getUser().then(setUser).catch(console.error);
  }, []));

  const handleReset = () => {
    Alert.alert(t.profile.resetData, 'This will clear all records (profile, history, medications, etc.) and cannot be undone. Continue?', [
      { text: t.common.cancel, style: 'cancel' },
      { text: t.common.confirm, style: 'destructive', onPress: async () => {
        await resetAllData();
        setUser(null);
        Alert.alert(t.common.save, t.profile.resetDataDesc);
      }},
    ]);
  };

  const age = user ? Math.floor(
    (Date.now() - new Date(user.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  ) : 0;

  return (
    <ScrollView style={styles.container}>
      {user ? (
        <Card style={styles.profileCard}>
          <Card.Content>
            <Text style={styles.nickname}>{user.nickname}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoItem}>{t.profile.age}：{age} {lang === 'en' ? 'yrs' : '岁'}</Text>
              <Text style={styles.infoItem}>{t.profile.gender2}：{user.gender === 'male' ? t.register.male : t.register.female}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoItem}>{t.profile.height}：{user.height_cm} cm</Text>
              <Text style={styles.infoItem}>{t.profile.weight}：{user.weight_kg} kg</Text>
            </View>
            <Text style={styles.infoItem}>BMI：{(user.weight_kg / ((user.height_cm / 100) ** 2)).toFixed(1)}</Text>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.profileCard}>
          <Card.Content>
            <Text style={styles.nickname}>{t.profile.notRegistered}</Text>
            <Text style={styles.infoItem}>{t.profile.noProfile}</Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.menuCard}>
        <List.Item
          title={t.profile.editProfile}
          left={(props) => <List.Icon {...props} icon="account-edit" />}
          onPress={() => router.push('/register')}
        />
        <Divider />
        <List.Item
          title={t.profile.actionPlan}
          description={t.profile.actionPlanDesc}
          left={(props) => <List.Icon {...props} icon="file-document-edit" />}
          onPress={() => router.push('/action-plan')}
        />
        <Divider />
        <List.Item
          title={t.profile.vaccination}
          description={t.profile.vaccinationDesc}
          left={(props) => <List.Icon {...props} icon="needle" />}
          onPress={() => router.push('/vaccination')}
        />
        <Divider />
        <List.Item
          title={t.profile.documents}
          description={t.profile.documentsDesc}
          left={(props) => <List.Icon {...props} icon="folder-image" />}
          onPress={() => router.push('/documents')}
        />
        <Divider />
        <List.Item
          title={t.profile.reminders}
          description={t.profile.remindersDesc}
          left={(props) => <List.Icon {...props} icon="bell-ring" />}
          onPress={() => router.push('/reminders')}
        />
        <Divider />
        <List.Item
          title={t.profile.export}
          description={t.profile.exportDesc}
          left={(props) => <List.Icon {...props} icon="export" />}
          onPress={() => router.push('/export')}
        />
        <Divider />
        <List.Item
          title={t.profile.healthScreening}
          description={t.profile.healthScreeningDesc}
          left={(props) => <List.Icon {...props} icon="stethoscope" />}
          onPress={() => router.push('/health-screening')}
        />
        <Divider />
        <List.Item
          title={t.profile.resetData}
          description={t.profile.resetDataDesc}
          left={(props) => <List.Icon {...props} icon="delete-forever" color="#C62828" />}
          onPress={handleReset}
          titleStyle={{ color: '#C62828' }}
        />
        <Divider />
        <List.Item
          title={t.profile.about}
          description={t.profile.aboutDesc}
          left={(props) => <List.Icon {...props} icon="information" />}
          onPress={() => router.push('/about')}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  profileCard: { margin: 16, borderRadius: 10 },
  nickname: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', marginBottom: 12 },
  infoRow: { flexDirection: 'row', gap: 24, marginBottom: 4 },
  infoItem: { fontSize: 14, color: '#424242' },
  menuCard: { margin: 16, marginTop: 0, borderRadius: 10 },
});
