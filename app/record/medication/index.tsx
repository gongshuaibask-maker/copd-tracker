// 吸入药物指导 + 用药使用记录
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Surface, IconButton, Button, TextInput, Chip, ActivityIndicator, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useT } from '../../../src/i18n';
import { getAllMedicationUsage, createMedicationUsage, deleteMedicationUsage } from '../../../src/database/repositories/medicationUsageRepo';
import { getMedicationStatusLabel, type MedicationUsage, type MedicationUsageStatus } from '../../../src/types/models';
import DatePicker from '../../../src/components/DatePicker';
import { showConfirm } from '../../../src/utils/confirm';

const VIDEO_BUDIGEFU = require('../../../assets/videos/布地格福.mp4');

const STATUS_OPTIONS: { key: MedicationUsageStatus; label: string; icon: string; color: string }[] = [
  { key: 'using', label: '使用中', icon: 'check-circle', color: '#2E7D32' },
  { key: 'long_term', label: '长期使用', icon: 'calendar-check', color: '#1565C0' },
  { key: 'intermittent', label: '间断使用', icon: 'timer-sand', color: '#E65100' },
  { key: 'stopped', label: '已停用', icon: 'stop-circle', color: '#9E9E9E' },
  { key: 'switched', label: '已换用', icon: 'swap-horizontal', color: '#6A1B9A' },
  { key: 'combined', label: '联合使用', icon: 'link-variant', color: '#00838F' },
];

// ==================== 视频播放器 ====================
function VideoPlayer({ source }: { source: any }) {
  const [err, setErr] = useState(false);
  const [VC, setVC] = useState<any>(null);
  const [st, setSt] = useState<any>({});
  const vRef = useRef<any>(null);
  useEffect(() => { import('expo-av').then(m => setVC(() => m.Video)).catch(() => setErr(true)); }, []);
  if (err) return <Surface style={s.videoError}><MaterialCommunityIcons name="video-off" size={32} color="#C62828" /><Text style={s.videoErrorText}>视频加载失败</Text></Surface>;
  if (!VC) return <ActivityIndicator style={{ padding: 40 }} size="large" color="#2E7D32" />;
  return (
    <View style={s.videoWrapper}>
      <VC ref={vRef} source={source} useNativeControls resizeMode="contain" style={s.video}
        onPlaybackStatusUpdate={(x: any) => setSt(x)} onError={() => setErr(true)} />
      <Text style={s.videoHint}>{st?.isLoaded ? `${Math.floor(st.positionMillis / 1000)}s / ${Math.floor(st.durationMillis / 1000)}s` : '加载中...'}</Text>
    </View>
  );
}

// ==================== 用药记录卡片 ====================
function UsageCard({ item, onDelete }: { item: MedicationUsage; onDelete: () => void }) {
  const statusInfo = STATUS_OPTIONS.find(s => s.key === item.status);
  return (
    <Card style={s.usageCard}>
      <Card.Content>
        <View style={s.usageHeader}>
          <View style={{ flex: 1 }}>
            <Text style={s.drugName}>{item.drug_name}</Text>
            <Text style={s.usageDate}>{item.record_date}</Text>
          </View>
          <IconButton icon="delete" size={18} iconColor="#C62828" onPress={onDelete} />
        </View>
        {item.usage_method ? <Text style={s.usageMethod}>用法：{item.usage_method}</Text> : null}
        {statusInfo && (
          <Chip icon={statusInfo.icon} style={{ backgroundColor: statusInfo.color + '20', alignSelf: 'flex-start', marginTop: 4 }}>
            <Text style={{ color: statusInfo.color, fontSize: 12 }}>{statusInfo.label}</Text>
          </Chip>
        )}
        {item.notes ? <Text style={s.usageNotes}>{item.notes}</Text> : null}
      </Card.Content>
    </Card>
  );
}

// ==================== 主页面 ====================
export default function MedicationMainScreen() {
  const router = useRouter();
  const t = useT();
  const [records, setRecords] = useState<MedicationUsage[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // 表单
  const [drugName, setDrugName] = useState('');
  const [usageMethod, setUsageMethod] = useState('');
  const [status, setStatus] = useState<MedicationUsageStatus>('using');
  const [recordDate, setRecordDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    try { setRecords(await getAllMedicationUsage()); } catch {}
  };

  const handleSave = async () => {
    if (!drugName.trim()) { Alert.alert('提示', '请输入药物名称'); return; }
    setSaving(true);
    try {
      await createMedicationUsage(drugName.trim(), status, format(recordDate, 'yyyy-MM-dd'), usageMethod.trim() || undefined, notes.trim() || undefined);
      resetForm();
      await loadData();
    } catch { Alert.alert('错误', '保存失败'); }
    setSaving(false);
  };

  const resetForm = () => {
    setShowForm(false); setDrugName(''); setUsageMethod(''); setStatus('using');
    setRecordDate(new Date()); setNotes(''); setShowDate(false);
  };

  const handleDelete = async (item: MedicationUsage) => {
    if (!await showConfirm(t.list.confirmDelete, `${item.drug_name}`, t.common.delete, t.common.cancel)) return;
    await deleteMedicationUsage(item.id);
    await loadData();
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        {/* 视频指导区域 */}
        <Surface style={s.videoBanner}>
          <View style={s.videoBannerRow}>
            <MaterialCommunityIcons name="video-vintage" size={28} color="#2E7D32" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.videoTitle}>吸入药物使用指导</Text>
              <Text style={s.videoSub}>点击展开观看布地格福吸入器使用视频</Text>
            </View>
            <IconButton icon={showVideo ? 'chevron-up' : 'play-circle'} size={32} iconColor="#2E7D32" onPress={() => setShowVideo(!showVideo)} />
          </View>
          {showVideo && <View style={{ marginTop: 8 }}><VideoPlayer source={VIDEO_BUDIGEFU} /></View>}
          <View style={s.otherVideosRow}>
            {['信必可', '茚达特罗格隆溴铵', '其他药物'].map(name => (
              <Chip key={name} icon="clock-outline" style={s.comingChip} textStyle={{ fontSize: 11, color: '#FF9800' }}>{name} 更新中</Chip>
            ))}
          </View>
        </Surface>

        {/* 用药记录列表 */}
        <View style={s.sectionHeader}>
          <MaterialCommunityIcons name="pill" size={20} color="#00695C" />
          <Text style={s.sectionTitle}>我的用药记录</Text>
          <Text style={s.sectionCount}>{records.length} 条</Text>
        </View>

        {records.length === 0 ? (
          <Surface style={s.emptyBox}>
            <MaterialCommunityIcons name="pill-off" size={48} color="#E0E0E0" />
            <Text style={s.emptyText}>暂无用药记录</Text>
            <Text style={s.emptyHint}>点击下方 + 按钮添加您正在使用的药物</Text>
          </Surface>
        ) : (
          records.map(item => <UsageCard key={item.id} item={item} onDelete={() => handleDelete(item)} />)
        )}

        {/* 新增表单 */}
        {showForm && (
          <Card style={s.formCard}>
            <Card.Content>
              <Text style={s.formTitle}>✏️ 新增用药记录</Text>
              <TextInput label="药物名称 *" value={drugName} onChangeText={setDrugName} mode="outlined" style={s.input} />
              <TextInput label="使用方法（如一天几次）" value={usageMethod} onChangeText={setUsageMethod} mode="outlined" style={s.input} placeholder="例如：早晚各吸入1次" />
              <Text style={s.fieldLabel}>用药状态</Text>
              <View style={s.statusRow}>
                {STATUS_OPTIONS.map(opt => (
                  <Chip key={opt.key} icon={opt.icon} selected={status === opt.key}
                    onPress={() => setStatus(opt.key)}
                    style={[s.statusChip, status === opt.key && { backgroundColor: opt.color + '30' }]}
                    textStyle={{ fontSize: 12, color: status === opt.key ? opt.color : '#666' }}
                  >{opt.label}</Chip>
                ))}
              </View>
              <Text style={s.fieldLabel}>记录日期</Text>
              <Button mode="outlined" onPress={() => setShowDate(true)} icon="calendar" style={s.input}>{format(recordDate, 'yyyy-MM-dd')}</Button>
              <DatePicker visible={showDate} value={recordDate} maximumDate={new Date()} onChange={d => { setRecordDate(d); setShowDate(false); }} onClose={() => setShowDate(false)} />
              <TextInput label="备注" value={notes} onChangeText={setNotes} mode="outlined" multiline numberOfLines={2} style={s.input} />
              <View style={s.formActions}>
                <Button mode="outlined" onPress={resetForm} style={{ flex: 1, marginRight: 8 }}>取消</Button>
                <Button mode="contained" onPress={handleSave} loading={saving} style={{ flex: 1 }} buttonColor="#2E7D32">保存</Button>
              </View>
            </Card.Content>
          </Card>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <FAB icon={showForm ? 'close' : 'plus'} style={s.fab} color="#FFF"
        label={showForm ? '关闭' : '新增药物'} onPress={() => setShowForm(!showForm)} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 12 },

  // 视频区
  videoBanner: { padding: 12, backgroundColor: '#E8F5E9', borderRadius: 12, marginBottom: 12 },
  videoBannerRow: { flexDirection: 'row', alignItems: 'center' },
  videoTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  videoSub: { fontSize: 12, color: '#666', marginTop: 2 },
  videoWrapper: { borderRadius: 8, overflow: 'hidden', backgroundColor: '#000' },
  video: { width: '100%', height: 200 },
  videoHint: { fontSize: 11, color: '#999', textAlign: 'center', padding: 2 },
  videoError: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#FFEBEE', borderRadius: 8, gap: 8 },
  videoErrorText: { fontSize: 14, color: '#C62828' },
  otherVideosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  comingChip: { backgroundColor: '#FFF8E1' },

  // 用药记录
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#424242', marginLeft: 6, flex: 1 },
  sectionCount: { fontSize: 13, color: '#999' },

  usageCard: { marginBottom: 8, borderRadius: 10, elevation: 2 },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  drugName: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  usageDate: { fontSize: 12, color: '#999', marginTop: 2 },
  usageMethod: { fontSize: 14, color: '#555', marginTop: 6 },
  usageNotes: { fontSize: 13, color: '#888', marginTop: 6 },

  // 空状态
  emptyBox: { alignItems: 'center', padding: 32, marginTop: 8 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 12 },
  emptyHint: { fontSize: 13, color: '#BDBDBD', marginTop: 4 },

  // 表单
  formCard: { marginTop: 8, borderRadius: 10, elevation: 4 },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#424242', marginBottom: 12 },
  input: { marginBottom: 10 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 4 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  statusChip: { margin: 0 },
  formActions: { flexDirection: 'row', marginTop: 8 },

  // FAB
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#00695C' },
});
