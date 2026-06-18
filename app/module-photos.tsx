// 模块照片浏览页 — 查看/添加/删除某模块的全部照片
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, FAB, IconButton, Button, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getAllPhotosByModule, addPhoto, deletePhoto, type ModulePhoto } from '../src/database/repositories/photoRepo';
import { useT } from '../src/i18n';
import { showConfirm } from '../src/utils/confirm';

export default function ModulePhotosScreen() {
  const router = useRouter();
  const t = useT();
  const params = useLocalSearchParams<{ module: string; moduleName: string }>();
  const [photos, setPhotos] = useState<ModulePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    loadPhotos();
  }, [params.module]));

  const loadPhotos = async () => {
    setLoading(true);
    try {
      if (params.module) {
        const p = await getAllPhotosByModule(params.module);
        setPhotos(p);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const addNewPhoto = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('提示', '需要相册/相机权限');
        return;
      }
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true });

      if (!result.canceled && result.assets[0] && params.module) {
        await addPhoto(params.module, 0, result.assets[0].uri);
        await loadPhotos();
      }
    } catch (e) {
      console.error('Photo add failed:', e);
    }
  };

  const showPicker = () => {
    Alert.alert(t.form.photo, '', [
      { text: t.form.camera, onPress: () => addNewPhoto(true) },
      { text: t.form.gallery, onPress: () => addNewPhoto(false) },
      { text: t.common.cancel, style: 'cancel' },
    ]);
  };

  const handleDelete = async (photo: ModulePhoto) => {
    if (!await showConfirm(t.list.confirmDelete, '', t.common.delete, t.common.cancel)) return;
    await deletePhoto(photo.id);
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
  };

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color="#2E7D32" /></View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        📷 {params.moduleName || params.module} — {photos.length} 张照片
      </Text>

      {photos.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="image-off" size={64} color="#E0E0E0" />
          <Text style={styles.emptyText}>{t.documents.empty}</Text>
          <Button mode="contained" onPress={showPicker} style={styles.addBtn} buttonColor="#2E7D32">
            {t.form.photo}
          </Button>
        </View>
      ) : (
        <FlatList
          data={photos}
          numColumns={3}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.photoWrap}>
              <Image source={{ uri: item.photo_uri }} style={styles.photo} />
              <IconButton
                icon="close-circle" size={20} iconColor="#FFF"
                style={styles.delBtn}
                onPress={() => handleDelete(item)}
              />
            </View>
          )}
          contentContainerStyle={styles.grid}
        />
      )}

      <FAB icon="camera" style={styles.fab} color="#FFF" onPress={showPicker} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 16, fontWeight: '600', color: '#424242', padding: 16, paddingBottom: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#9E9E9E', marginTop: 16, fontSize: 16 },
  addBtn: { marginTop: 20 },
  grid: { padding: 8 },
  photoWrap: { flex: 1, margin: 4, aspectRatio: 1, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  delBtn: { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.5)' },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#2E7D32' },
});
