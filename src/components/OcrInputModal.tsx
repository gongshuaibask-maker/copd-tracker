// OCR 文本粘贴+拍照识别 — 通用组件
// 支持：① 拍照自动识别（ML Kit）② 粘贴文本识别
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Modal, Image, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button, Surface, Checkbox, Card, IconButton, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useT } from '../i18n';
import { ocrPhotoToText, isMlKitAvailable } from '../services/imageOcrService';

export interface OcrField {
  key: string;
  label: string;
  value: string;
  unit?: string;
  confidence: 'high' | 'medium' | 'low' | 'none';
}

interface OcrInputModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (fields: OcrField[]) => void;
  title?: string;
  hint?: string;
  /** 自定义解析函数：输入文本 → 返回识别字段 */
  parseFn: (text: string) => OcrField[];
}

export default function OcrInputModal({
  visible, onClose, onApply, title, hint, parseFn,
}: OcrInputModalProps) {
  const t = useT();
  const defaultTitle = title ?? t.ocrInputModal.title;
  const [mode, setMode] = useState<'paste' | 'camera'>('paste');
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [fields, setFields] = useState<OcrField[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [ocrLoading, setOcrLoading] = useState(false);
  const [mlKitSupported, setMlKitSupported] = useState<boolean | null>(null);

  const handlePickImage = async (useCamera: boolean) => {
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhoto(uri);

      // 自动尝试 ML Kit OCR
      setOcrLoading(true);
      try {
        const available = await isMlKitAvailable();
        setMlKitSupported(available);

        if (available) {
          const ocrResult = await ocrPhotoToText(uri);
          if (ocrResult.success) {
            setText(ocrResult.text);
            // 自动触发解析
            const results = parseFn(ocrResult.text.trim());
            const found = results.filter(f => f.confidence !== 'none' && f.value);
            if (found.length > 0) {
              setFields(results);
              setSelectedKeys(new Set(found.map(f => f.key)));
              setOcrLoading(false);
              return;
            }
          }
          // OCR 成功但未识别到指标 → 回退到手动修正
          Alert.alert('📷 OCR', t.ocrInputModal.ocrNoIndicators);
        } else {
          Alert.alert('📷 OCR', t.ocrInputModal.ocrUnavailable);
        }
      } catch {
        Alert.alert('📷 OCR', t.ocrInputModal.ocrUnavailable);
      }
      setOcrLoading(false);
    }
  };

  const handleParse = () => {
    if (!text.trim()) {
      Alert.alert(t.ocrInputModal.noText, '');
      return;
    }
    try {
      const results = parseFn(text.trim());
      const found = results.filter(f => f.confidence !== 'none' && f.value);
      if (found.length === 0) {
        Alert.alert(t.ocrInputModal.noIndicators, t.ocrInputModal.noIndicatorsMsg);
        return;
      }
      setFields(results);
      setSelectedKeys(new Set(found.map(f => f.key)));
    } catch (e) {
      Alert.alert('Error', t.ocrInputModal.noIndicatorsMsg);
    }
  };

  const handleApply = () => {
    const selected = fields.filter(f => selectedKeys.has(f.key));
    if (selected.length === 0) {
      Alert.alert(t.ocrInputModal.noIndicators, '');
      return;
    }
    onApply(selected);
    resetState();
  };

  const resetState = () => {
    setText(''); setFields([]); setSelectedKeys(new Set()); setPhoto(null);
  };

  const toggleSelect = (key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const confidenceColor = (c: string) => c === 'high' ? '#2E7D32' : c === 'medium' ? '#E65100' : '#999';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton icon="close" size={24} onPress={() => { resetState(); onClose(); }} />
          <Text style={styles.title}>{defaultTitle}</Text>
          <View style={{ width: 48 }} />
        </View>

        {fields.length === 0 ? (
          <>
            {/* 输入模式切换：粘贴 / 拍照 */}
            <SegmentedButtons
              value={mode}
              onValueChange={v => { setMode(v as 'paste' | 'camera'); resetState(); }}
              buttons={[
                { value: 'paste', label: t.ocrInputModal.pasteTab, icon: 'clipboard-text' },
                { value: 'camera', label: t.ocrInputModal.cameraTab, icon: 'camera' },
              ]}
              style={styles.segment}
            />

            {/* 拍照模式 */}
            {mode === 'camera' && (
              <View style={styles.cameraSection}>
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.photo} resizeMode="contain" />
                ) : null}

                {ocrLoading ? (
                  <View style={styles.ocrLoadingWrap}>
                    <ActivityIndicator size="large" color="#2E7D32" />
                    <Text style={styles.ocrLoadingText}>{t.ocrInputModal.ocrLoading}</Text>
                    <Text style={styles.ocrLoadingHint}>{t.ocrInputModal.ocrLoadingHint}</Text>
                  </View>
                ) : null}

                <View style={styles.cameraBtns}>
                  <Button mode="contained-tonal" icon="camera" onPress={() => handlePickImage(true)}
                    style={styles.camBtn} disabled={ocrLoading}>
                    {t.ocrInputModal.cameraTake}
                  </Button>
                  <Button mode="contained-tonal" icon="image" onPress={() => handlePickImage(false)}
                    style={styles.camBtn} disabled={ocrLoading}>
                    {t.ocrInputModal.cameraAlbum}
                  </Button>
                </View>
                {photo && !ocrLoading && (
                  <Button mode="contained" icon="auto-fix" onPress={() => handlePickImage(false)}
                    style={styles.autoOcrBtn} disabled={ocrLoading}
                    buttonColor="#0277BD">
                    {t.ocrInputModal.cameraOcr}
                  </Button>
                )}
                {photo && (
                  <IconButton icon="close-circle" size={20} iconColor="#C62828"
                    onPress={() => { setPhoto(null); setText(''); }} style={styles.removePhoto} />
                )}
              </View>
            )}

            <Text style={styles.hint}>
              {hint ?? (mode === 'paste' ? t.ocrInputModal.pasteHint : t.ocrInputModal.cameraHint)}
            </Text>

            <TextInput
              mode="outlined"
              multiline
              numberOfLines={mode === 'camera' ? 6 : 10}
              value={text}
              onChangeText={setText}
              placeholder={mode === 'paste' ? t.ocrInputModal.textPlaceholder : t.ocrInputModal.ocrPlaceholder}
              style={styles.textInput}
              textAlignVertical="top"
            />
            <Button mode="contained" onPress={handleParse} style={styles.parseBtn}
              disabled={!text.trim()}>
              {t.ocrInputModal.parseBtn}
            </Button>
          </>
        ) : (
          <>
            <Text style={styles.resultHint}>
              {t.ocrInputModal.selectHint.replace('{count}', fields.filter(f => f.value).length.toString())}
            </Text>
            <ScrollView style={styles.fieldList}>
              {fields.filter(f => f.value).map(f => (
                <Card key={f.key} style={styles.fieldCard}
                  onPress={() => toggleSelect(f.key)}>
                  <Card.Content>
                    <View style={styles.fieldRow}>
                      <Checkbox status={selectedKeys.has(f.key) ? 'checked' : 'unchecked'}
                        onPress={() => toggleSelect(f.key)} />
                      <View style={styles.fieldInfo}>
                        <Text style={styles.fieldLabel}>{f.label}</Text>
                        {f.unit ? <Text style={styles.fieldUnit}>{f.unit}</Text> : null}
                      </View>
                      <Text style={[styles.fieldValue, { color: confidenceColor(f.confidence) }]}>
                        {f.value}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </ScrollView>
            <Button mode="contained" onPress={handleApply} style={styles.applyBtn}>
              {t.ocrInputModal.applyBtn.replace('{count}', selectedKeys.size.toString())}
            </Button>
            <Button mode="text" onPress={() => { setFields([]); setText(''); }}>
              {t.ocrInputModal.redoBtn}
            </Button>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#424242' },
  segment: { marginHorizontal: 16, marginBottom: 12 },
  cameraSection: { paddingHorizontal: 16, marginBottom: 8 },
  cameraBtns: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  camBtn: { flex: 1 },
  photo: { width: '100%', height: 160, borderRadius: 8, marginBottom: 8, backgroundColor: '#E0E0E0' },
  removePhoto: { position: 'absolute', top: 0, right: 16 },
  hint: { fontSize: 14, color: '#666', paddingHorizontal: 16, marginBottom: 12 },
  textInput: { marginHorizontal: 16, backgroundColor: '#FFF', minHeight: 150 },
  parseBtn: { marginHorizontal: 16, marginTop: 16, borderRadius: 8 },
  resultHint: { fontSize: 14, color: '#666', paddingHorizontal: 16, marginBottom: 8 },
  fieldList: { flex: 1, paddingHorizontal: 16 },
  fieldCard: { marginBottom: 6, backgroundColor: '#FFF' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldInfo: { flex: 1 },
  fieldLabel: { fontSize: 14, color: '#333' },
  fieldUnit: { fontSize: 11, color: '#888' },
  fieldValue: { fontSize: 16, fontWeight: 'bold' },
  applyBtn: { marginHorizontal: 16, marginTop: 12, borderRadius: 8, marginBottom: 8 },
  ocrLoadingWrap: { alignItems: 'center', paddingVertical: 20 },
  ocrLoadingText: { fontSize: 15, color: '#2E7D32', marginTop: 12, fontWeight: '600' },
  ocrLoadingHint: { fontSize: 12, color: '#999', marginTop: 4 },
  autoOcrBtn: { marginTop: 8, borderRadius: 8 },
});
