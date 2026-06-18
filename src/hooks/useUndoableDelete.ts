// 删除撤销 Hook — 所有列表页共享
// 用法：在删除操作后显示 Snackbar，5 秒内可撤销
import { useState, useRef, useCallback } from 'react';
import { Alert } from 'react-native';

interface UndoState {
  visible: boolean;
  message: string;
}

interface UseUndoableDeleteOptions<T extends { id: number; record_date: string }> {
  /** 从数据库删除的函数 */
  deleteFn: (id: number) => Promise<void>;
  /** 重新创建记录的的函数（撤销时调用） */
  restoreFn?: (record: T) => Promise<void>;
  /** 撤销超时（毫秒），默认 5000 */
  timeout?: number;
  /** 删除确认提示标题 */
  confirmTitle?: string;
  /** 模块名称 */
  moduleName?: string;
}

export function useUndoableDelete<T extends { id: number; record_date: string }>(
  options: UseUndoableDeleteOptions<T>
) {
  const {
    deleteFn,
    restoreFn,
    timeout = 5000,
    confirmTitle = '确认删除',
    moduleName = '记录',
  } = options;

  const [snackbar, setSnackbar] = useState<UndoState>({ visible: false, message: '' });
  const [isUndoing, setIsUndoing] = useState(false);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRecord = useRef<T | null>(null);

  // 清理定时器
  const clearTimer = useCallback(() => {
    if (pendingTimer.current) {
      clearTimeout(pendingTimer.current);
      pendingTimer.current = null;
    }
  }, []);

  // 执行删除
  const handleDelete = useCallback(
    (record: T, onRemoved: (id: number) => void) => {
      Alert.alert(
        confirmTitle,
        `确定删除 ${record.record_date} 的${moduleName}记录？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteFn(record.id);

                // 保存记录副本用于撤销
                pendingRecord.current = record;

                // 从列表中移除
                onRemoved(record.id);

                // 显示撤销 Snackbar
                setSnackbar({
                  visible: true,
                  message: `已删除 ${record.record_date} 的${moduleName}记录`,
                });

                // 5 秒后自动清除撤销机会
                clearTimer();
                pendingTimer.current = setTimeout(() => {
                  setSnackbar({ visible: false, message: '' });
                  pendingRecord.current = null;
                }, timeout);
              } catch {
                Alert.alert('错误', '删除失败，请重试');
              }
            },
          },
        ]
      );
    },
    [deleteFn, confirmTitle, moduleName, timeout, clearTimer]
  );

  // 撤销删除
  const handleUndo = useCallback(
    async (onRestored: (record: T) => void) => {
      const record = pendingRecord.current;
      if (!record || !restoreFn) return;

      setIsUndoing(true);
      clearTimer();

      try {
        await restoreFn(record);
        onRestored(record);
        setSnackbar({ visible: false, message: '' });
        pendingRecord.current = null;
      } catch {
        Alert.alert('错误', '撤销失败，记录可能已丢失');
      } finally {
        setIsUndoing(false);
      }
    },
    [restoreFn, clearTimer]
  );

  // 关闭 Snackbar
  const dismissSnackbar = useCallback(() => {
    clearTimer();
    setSnackbar({ visible: false, message: '' });
  }, [clearTimer]);

  return {
    snackbar,
    isUndoing,
    handleDelete,
    handleUndo,
    dismissSnackbar,
  };
}
