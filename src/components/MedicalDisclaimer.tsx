// 医疗免责声明 — 首次启动必须确认的合规弹窗
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Text, Button, Checkbox, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useT } from '../i18n';

interface Props {
  visible: boolean;
  onAccept: () => Promise<void>;
}

export default function MedicalDisclaimer({ visible, onAccept }: Props) {
  const t = useT();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onAccept();
    setLoading(false);
  };

  return (
    <Modal visible={visible} dismissable={false} contentContainerStyle={styles.modal}>
      <Surface style={styles.container}>
        {/* 头部 */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="shield-alert" size={40} color="#E65100" />
          <Text style={styles.title}>{t.medicalDisclaimer.title}</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={true}>
          {/* 重要提示 */}
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              {t.medicalDisclaimer.intro}
            </Text>
          </View>

          {/* 逐条声明 */}
          <View style={styles.clause}>
            <Text style={styles.clauseNum}>{t.medicalDisclaimer.clause1}</Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause1a}
            </Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause1b}
            </Text>
          </View>

          <View style={styles.clause}>
            <Text style={styles.clauseNum}>{t.medicalDisclaimer.clause2}</Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause2a}
            </Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause2b}
            </Text>
          </View>

          <View style={styles.clause}>
            <Text style={styles.clauseNum}>{t.medicalDisclaimer.clause3}</Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause3a}
            </Text>
            <Text style={styles.emergencyItem}>{t.medicalDisclaimer.clause3b}</Text>
            <Text style={styles.emergencyItem}>{t.medicalDisclaimer.clause3c}</Text>
            <Text style={styles.emergencyItem}>{t.medicalDisclaimer.clause3d}</Text>
            <Text style={styles.emergencyItem}>{t.medicalDisclaimer.clause3e}</Text>
          </View>

          <View style={styles.clause}>
            <Text style={styles.clauseNum}>{t.medicalDisclaimer.clause4}</Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause4a}
            </Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause4b}
            </Text>
          </View>

          <View style={styles.clause}>
            <Text style={styles.clauseNum}>{t.medicalDisclaimer.clause5}</Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause5a}
            </Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause5b}
            </Text>
          </View>

          <View style={styles.clause}>
            <Text style={styles.clauseNum}>{t.medicalDisclaimer.clause6}</Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause6a}
            </Text>
            <Text style={styles.clauseText}>
              {t.medicalDisclaimer.clause6b}
            </Text>
          </View>
        </ScrollView>

        {/* 确认勾选 */}
        <View style={styles.checkRow}>
          <Checkbox
            status={checked ? 'checked' : 'unchecked'}
            onPress={() => setChecked(!checked)}
            color="#2E7D32"
          />
          <Text style={styles.checkLabel}>
            {t.medicalDisclaimer.agree}
          </Text>
        </View>

        {/* 确认按钮 */}
        <Button
          mode="contained"
          onPress={handleConfirm}
          disabled={!checked}
          loading={loading}
          style={styles.confirmBtn}
          contentStyle={{ paddingVertical: 10 }}
          labelStyle={{ fontSize: 16 }}
        >
          {t.medicalDisclaimer.confirm}
        </Button>

        <Text style={styles.version}>{t.medicalDisclaimer.version}</Text>
      </Surface>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 12,
    maxHeight: '92%',
  },
  container: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFF',
    maxHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E65100',
    marginTop: 8,
  },
  scroll: {
    maxHeight: '60%',
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#E65100',
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 22,
  },
  clause: {
    marginBottom: 14,
  },
  clauseNum: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 4,
  },
  clauseText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  emergencyItem: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 22,
    marginLeft: 8,
    marginTop: 2,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingRight: 12,
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  confirmBtn: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
  },
  version: {
    textAlign: 'center',
    color: '#BDBDBD',
    fontSize: 12,
    marginTop: 12,
  },
});
