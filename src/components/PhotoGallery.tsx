// 通用照片画廊组件 — 用于任意模块的拍照/选图/查看/删除
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getPhotos, addPhoto, deletePhoto, type ModulePhoto } from '../database/repositories/photoRepo';
import { useT } from '../i18n';
import { showConfirm } from '../utils/confirm';

interface Props {
  moduleName: string;   // 模块标识（如 'pulmonary', 'symptom'）
  recordId: number;     // 记录 ID（0 = 新增模式，保存后更新）
  onPhotoCountChange?: (count: number) => void;
}

export default function PhotoGallery({ moduleName, recordId, onPhotoCountChange }: Props) {
  const t = useT();
  const [photos, setPhotos] = useState<ModulePhoto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recordId > 0) loadPhotos();
  }, [recordId]);

  const loadPhotos = async () => {
    try {
      const p = await getPhotos(moduleName, recordId);
      setPhotos(p);
      onPhotoCountChange?.(p.length);
    } catch { /* ignore */ }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(t.common.save, 'Camera/gallery permission required');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
            allowsEditing: true,
          });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        if (recordId > 0) {
          await addPhoto(moduleName, recordId, uri);
          await loadPhotos();
        } else {
          // 新增模式：暂存到临时列表
          setPhotos(prev => [...prev, {
            id: -Date.now(), module_name: moduleName, record_id: 0,
            photo_uri: uri, notes: null, created_at: new Date().toISOString(),
          }]);
          onPhotoCountChange?.(photos.length + 1);
        }
      }
    } catch (e) {
      console.error('Photo pick failed:', e);
    }
  };

  const handleDelete = async (photo: ModulePhoto) => {
    if (!await showConfirm(t.list.confirmDelete, t.list.deleteMsg, t.common.delete, t.common.cancel)) return;
    if (photo.id > 0) await deletePhoto(photo.id);
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    onPhotoCountChange?.(photos.length - 1);
  };

  const showPicker = () => {
    Alert.alert(t.form.photo, '', [
      { text: t.form.camera, onPress: () => pickImage(true) },
      { text: t.form.gallery, onPress: () => pickImage(false) },
      { text: t.common.cancel, style: 'cancel' },
    ]);
  };

  if (loading) return <ActivityIndicator size="small" color="#2E7D32" />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📷 {t.form.photo}</Text>
        <Button mode="text" compact onPress={showPicker} textColor="#2E7D32">
          + {photos.length > 0 ? t.common.edit : t.form.camera}
        </Button>
      </View>

      {photos.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
          {photos.map((photo) => (
            <TouchableOpacity key={photo.id} onLongPress={() => handleDelete(photo)} activeOpacity={0.8}>
              <Card style={styles.photoCard}>
                <Image source={{ uri: photo.photo_uri }} style={styles.photo} />
                <Chip icon="close" compact style={styles.deleteChip} onPress={() => handleDelete(photo)}>
                  {t.list.deleteMsg}
                </Chip>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <TouchableOpacity onPress={showPicker} style={styles.addZone} activeOpacity={0.7}>
          <MaterialCommunityIcons name="camera-plus" size={40} color="#BDBDBD" />
          <Text style={styles.addText}>{t.form.photo}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '600', color: '#424242' },
  scroll: { flexDirection: 'row' },
  photoCard: { width: 160, height: 160, marginRight: 8, borderRadius: 8, overflow: 'hidden' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  deleteChip: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)' },
  addZone: {
    borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed',
    borderRadius: 12, padding: 24, alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  addText: { color: '#9E9E9E', marginTop: 8, fontSize: 14 },
});
