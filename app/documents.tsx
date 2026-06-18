// 患者资料 — 全板块照片统一查看页
// 按检查日期排序显示，患者可自行增删
import React, { useCallback, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Image,
  Alert, Dimensions,
} from 'react-native';
import { Text, IconButton, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useT } from '../src/i18n';
import { getDatabase } from '../src/database';
import { showConfirm } from '../src/utils/confirm';
import type { PatientDocument } from '../src/types/models';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 2;

export default function DocumentsScreen() {
  const t = useT();
  const PHOTO_SOURCES = [
    { module: 'pulmonary',    moduleName: t.documents.modPulmonary, table: 'pulmonary_function',    dateCol: 'record_date' },
    { module: 'inflammation', moduleName: t.documents.modInflammation, table: 'airway_inflammation',    dateCol: 'record_date' },
    { module: 'comorbidity',  moduleName: t.documents.modComorbidity, table: 'comorbidity',            dateCol: 'record_date' },
  ];
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [filterModule, setFilterModule] = useState('all');

  const loadDocuments = useCallback(async () => {
    try {
      const db = await getDatabase();
      const allDocs: PatientDocument[] = [];
      let order = 0;

      for (const src of PHOTO_SOURCES) {
        const rows = await db.getAllAsync<{ id: number; record_date: string; photo_uri: string }>(
          `SELECT id, ${src.dateCol} as record_date, photo_uri
           FROM ${src.table}
           WHERE photo_uri IS NOT NULL AND photo_uri != ''
           ORDER BY record_date DESC, id DESC`
        );
        for (const row of rows) {
          allDocs.push({
            id: `${src.module}_${row.id}`,
            module: src.module,
            moduleName: src.moduleName,
            recordDate: row.record_date,
            photoUri: row.photo_uri,
            summary: `${src.moduleName} · ${row.record_date}`,
            uploadOrder: order++,
          });
        }
      }

      // 按检查日期降序，同日期按上传顺序
      allDocs.sort((a, b) => {
        if (a.recordDate !== b.recordDate) return b.recordDate.localeCompare(a.recordDate);
        return a.uploadOrder - b.uploadOrder;
      });

      setDocuments(allDocs);
    } catch (e) {
      console.error('Load documents failed:', e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadDocuments(); }, [loadDocuments]));

  // 删除照片（仅删除照片引用，不删除记录）
  const handleDeletePhoto = async (doc: PatientDocument) => {
    if (!await showConfirm('确认删除', `确定删除「${doc.summary}」的照片？\n（仅删除照片，记录数据保留）`)) return;
    try {
      const db = await getDatabase();
      const src = PHOTO_SOURCES.find((s) => s.module === doc.module);
      if (src) {
        await db.runAsync(
          `UPDATE ${src.table} SET photo_uri = NULL WHERE id = ?`,
          [parseInt(doc.id.split('_')[1])]
        );
      }
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {
      Alert.alert(t.common.delete, t.documents.deleteError);
    }
  };

  const moduleNames = ['all', ...new Set(documents.map((d) => d.module))];
  const moduleOptions = [
    { value: 'all', label: t.documents.filterAll },
    ...moduleNames.filter((m) => m !== 'all').map((m) => {
      const src = PHOTO_SOURCES.find((s) => s.module === m);
      return { value: m, label: src?.moduleName ?? m };
    }),
  ];

  const filteredDocs = filterModule === 'all'
    ? documents
    : documents.filter((d) => d.module === filterModule);

  // 按日期分组
  const grouped: Record<string, PatientDocument[]> = {};
  for (const doc of filteredDocs) {
    if (!grouped[doc.recordDate]) grouped[doc.recordDate] = [];
    grouped[doc.recordDate].push(doc);
  }

  return (
    <View style={styles.container}>
      {documents.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="folder-image" size={64} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>{t.documents.empty}</Text>
          <Text style={styles.emptySubtitle}>{t.documents.empty}</Text>
        </View>
      ) : (
        <ScrollView>
          {moduleOptions.length > 2 && (
            <SegmentedButtons
              value={filterModule}
              onValueChange={setFilterModule}
              buttons={moduleOptions.slice(0, 4)}
              style={styles.filter}
            />
          )}

          {Object.entries(grouped).map(([date, docs]) => (
            <View key={date}>
              <Text style={styles.dateHeader}>📅 {date}</Text>
              <View style={styles.imageGrid}>
                {docs.map((doc) => (
                  <TouchableOpacity key={doc.id} style={styles.imageCard} activeOpacity={0.8}>
                    <Image source={{ uri: doc.photoUri }} style={styles.image} />
                    <View style={styles.imageInfo}>
                      <Text style={styles.imageModule} numberOfLines={1}>{doc.moduleName}</Text>
                      <IconButton
                        icon="delete-outline"
                        size={16}
                        iconColor="#C62828"
                        style={styles.deleteBtn}
                        onPress={() => handleDeletePhoto(doc)}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, color: '#999', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#BDBDBD', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
  filter: { margin: 12 },
  dateHeader: { fontSize: 14, fontWeight: 'bold', color: '#424242', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  imageCard: {
    width: IMAGE_SIZE, margin: 4, borderRadius: 8, overflow: 'hidden',
    backgroundColor: '#fff', elevation: 1,
  },
  image: { width: '100%', height: IMAGE_SIZE * 0.75, backgroundColor: '#E0E0E0' },
  imageInfo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 8, paddingVertical: 4,
  },
  imageModule: { fontSize: 11, color: '#666', flex: 1 },
  deleteBtn: { margin: 0, padding: 0 },
});
