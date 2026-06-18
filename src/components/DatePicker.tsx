// 跨平台日期选择器 — Native 用 DateTimePicker，Web 用 HTML <input>
import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { format } from 'date-fns';

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  visible: boolean;
  onClose: () => void;
  maximumDate?: Date;
}

export default function DatePicker({ value, onChange, visible, onClose, maximumDate }: Props) {
  if (!visible) return null;

  // Web: 使用原生 HTML date input
  if (Platform.OS === 'web') {
    const dateStr = format(value, 'yyyy-MM-dd');
    const maxStr = maximumDate ? format(maximumDate, 'yyyy-MM-dd') : undefined;
    return (
      <View style={styles.webContainer}>
        <input
          type="date"
          value={dateStr}
          max={maxStr}
          onChange={(e) => {
            const d = e.target.value ? new Date(e.target.value + 'T00:00:00') : value;
            if (d) onChange(d);
            onClose();
          }}
          style={{
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: '1px solid #2E7D32',
            backgroundColor: '#FFF',
            width: '100%',
          }}
          autoFocus
        />
        <Button mode="text" onPress={onClose} style={styles.cancelBtn}>取消</Button>
      </View>
    );
  }

  // Native: 使用 @react-native-community/datetimepicker
  try {
    const { default: NativePicker } = require('@react-native-community/datetimepicker');
    return (
      <NativePicker
        value={value}
        mode="date"
        maximumDate={maximumDate}
        onChange={(_event: any, selectedDate?: Date) => {
          onClose();
          if (selectedDate) onChange(selectedDate);
        }}
      />
    );
  } catch {
    // 兜底：如果原生模块不可用，显示一个简单的输入框
    return (
      <View style={styles.webContainer}>
        <input
          type="date"
          value={format(value, 'yyyy-MM-dd')}
          max={maximumDate ? format(maximumDate, 'yyyy-MM-dd') : undefined}
          onChange={(e) => {
            const d = e.target.value ? new Date(e.target.value + 'T00:00:00') : value;
            if (d) onChange(d);
            onClose();
          }}
          style={{ padding: 10, fontSize: 16, borderRadius: 8, border: '1px solid #2E7D32' }}
        />
        <Button mode="text" onPress={onClose}>取消</Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  webContainer: { marginTop: 8, gap: 8 },
  cancelBtn: { marginTop: 4 },
});
