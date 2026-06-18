// 跨平台确认对话框工具
// Web 上使用 window.confirm，Native 上使用 Alert.alert
import { Alert, Platform } from 'react-native';

/**
 * 显示确认对话框，兼容 Web 和 Native
 * @returns Promise<boolean> 用户是否确认
 */
export function showConfirm(
  title: string,
  message: string,
  confirmText = '删除',
  cancelText = '取消'
): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      try {
        resolve(window.confirm(`${title}\n${message}`));
      } catch {
        resolve(false);
      }
    } else {
      Alert.alert(title, message, [
        { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
      ]);
    }
  });
}
