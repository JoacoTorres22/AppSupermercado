import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { closeTrip, getItems, updateItem } from '@/lib/api';
import { Item } from '@/types';

export default function ModoSupermercadoScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [totalInput, setTotalInput] = useState('');

  const itemsQuery = useQuery({ queryKey: ['items'], queryFn: getItems });

  const toggleMutation = useMutation({
    mutationFn: (item: Item) => updateItem(item._id, { checked: !item.checked }),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previous = queryClient.getQueryData<Item[]>(['items']);
      queryClient.setQueryData<Item[]>(['items'], (old) =>
        old?.map((i) => (i._id === item._id ? { ...i, checked: !i.checked } : i))
      );
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous) queryClient.setQueryData(['items'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });

  const closeTripMutation = useMutation({
    mutationFn: (total: number) => closeTrip(total),
    onSuccess: () => {
      setCloseModalVisible(false);
      setTotalInput('');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      router.back();
    },
  });

  const items = (itemsQuery.data ?? []).filter((i) => i.quantity > 0);
  const checkedCount = items.filter((i) => i.checked).length;

  const handleConfirmClose = () => {
    const total = Number(totalInput.replace(',', '.'));
    if (!Number.isFinite(total) || total < 0) return;
    closeTripMutation.mutate(total);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={itemsQuery.isFetching}
        onRefresh={() => itemsQuery.refetch()}
        ListEmptyComponent={
          !itemsQuery.isLoading ? (
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              No hay productos en la lista. Volvé a Planificación para agregar cantidades.
            </ThemedText>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.itemRow, { backgroundColor: theme.backgroundElement }]}
            onPress={() => toggleMutation.mutate(item)}>
            <View
              style={[
                styles.checkbox,
                { borderColor: theme.textSecondary },
                item.checked && { backgroundColor: theme.text, borderColor: theme.text },
              ]}>
              {item.checked && <Ionicons name="checkmark" size={16} color={theme.background} />}
            </View>
            <Ionicons
              name="cube-outline"
              size={20}
              color={item.checked ? theme.textSecondary : theme.text}
            />
            <ThemedText
              style={[styles.itemName, item.checked && styles.strikethrough]}
              themeColor={item.checked ? 'textSecondary' : 'text'}>
              {item.name}
            </ThemedText>
            <View style={[styles.quantityBadge, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="smallBold">x{item.quantity}</ThemedText>
            </View>
          </Pressable>
        )}
      />

      <Pressable
        style={[styles.closeTripButton, { backgroundColor: theme.text }]}
        disabled={items.length === 0}
        onPress={() => setCloseModalVisible(true)}>
        <ThemedText themeColor="background" type="smallBold">
          Cerrar compra {checkedCount > 0 ? `(${checkedCount}/${items.length})` : ''}
        </ThemedText>
      </Pressable>

      <Modal visible={closeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <ThemedText type="subtitle">¿Cuánto gastaste?</ThemedText>
            <View style={[styles.totalInputWrapper, { backgroundColor: theme.backgroundElement }]}>
              <ThemedText type="title" style={styles.currencyPrefix}>
                $
              </ThemedText>
              <TextInput
                style={[styles.totalInput, { color: theme.text }]}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                value={totalInput}
                onChangeText={setTotalInput}
                autoFocus
              />
            </View>
            <View style={styles.modalActions}>
              <Pressable onPress={() => setCloseModalVisible(false)} style={styles.modalCancel}>
                <ThemedText themeColor="textSecondary">Cancelar</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalConfirm, { backgroundColor: theme.text }]}
                onPress={handleConfirmClose}>
                <ThemedText themeColor="background" type="smallBold">
                  Confirmar
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: Spacing.six,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  itemName: {
    flex: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Spacing.one,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  quantityBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.four,
  },
  closeTripButton: {
    margin: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    borderRadius: Spacing.four,
    padding: Spacing.five,
    gap: Spacing.four,
  },
  totalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
    minHeight: 72,
  },
  currencyPrefix: {
    fontSize: 32,
  },
  totalInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: '600',
    paddingVertical: 0,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.four,
  },
  modalCancel: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  modalConfirm: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.two,
  },
});
