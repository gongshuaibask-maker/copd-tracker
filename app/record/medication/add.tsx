// 吸入药物使用指导 — 请从列表页选择药物查看视频
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MedicationAddPlaceholder() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="video-vintage" size={64} color="#E0E0E0" />
      <Text style={styles.text}>请从药物列表中选择要观看的吸入指导视频</Text>
      <Button mode="contained" onPress={() => router.back()} style={styles.btn} buttonColor="#2E7D32">返回列表</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA', padding: 32 },
  text: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 16, lineHeight: 24 },
  btn: { marginTop: 20, borderRadius: 8 },
});
