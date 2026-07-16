import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { closeTrip, createItem, getItems, updateItem } from '@/lib/api';
import { Item } from '@/types';

export default function ListaScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [newItemName, setNewItemName] = useState('');
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [totalInput, setTotalInput] = useState('');

  const itemsQuery = useQuery({ queryKey: ['items'], queryFn: getItems });

  const toggleMutation = useMutation({
    mutationFn: (item: Item) =>
      updateItem(item._id, { status: item.status === 'to_buy' ? 'purchased' : 'to_buy' }),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previous = queryClient.getQueryData<Item[]>(['items']);
      queryClient.setQueryData<Item[]>(['items'], (old) =>
        old?.map((i) =>
          i._id === item._id ? { ...i, status: i.status === 'to_buy' ? 'purchased' : 'to_buy' } : i
        )
      );
      return { previous };
    },
    onError: (_err, _item, context) => {
      if (context?.previous) queryClient.setQueryData(['items'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });

  const addMutation = useMutation({
    mutationFn: (name: string) => createItem(name),
    onSuccess: () => {
      setNewItemName('');
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const closeTripMutation = useMutation({
    mutationFn: (total: number) => closeTrip(total),
    onSuccess: () => {
      setCloseModalVisible(false);
      setTotalInput('');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });

  const items = itemsQuery.data ?? [];
  const purchasedCount = items.filter((i) => i.status === 'purchased').length;

  const handleAddItem = () => {
    const name = newItemName.trim();
    if (!name) return;
    addMutation.mutate(name);
  };

  const handleConfirmClose = () => {
    const total = Number(totalInput.replace(',', '.'));
    if (!Number.isFinite(total) || total < 0) return;
    closeTripMutation.mutate(total);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          placeholder="Agregar ítem..."
          placeholderTextColor={theme.textSecondary}
          value={newItemName}
          onChangeText={setNewItemName}
          onSubmitEditing={handleAddItem}
          returnKeyType="done"
        />
        <Pressable style={styles.addButton} onPress={handleAddItem}>
          <ThemedText themeColor="background" style={styles.addButtonLabel}>
            +
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={itemsQuery.isFetching}
        onRefresh={() => itemsQuery.refetch()}
        ListEmptyComponent={
          !itemsQuery.isLoading ? (
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              No hay ítems todavía. Agregá el primero arriba.
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
                item.status === 'purchased' && { backgroundColor: theme.text, borderColor: theme.text },
              ]}
            />
            <ThemedText
              style={item.status === 'purchased' && styles.strikethrough}
              themeColor={item.status === 'purchased' ? 'textSecondary' : 'text'}>
              {item.name}
            </ThemedText>
          </Pressable>
        )}
      />

      <Pressable
        style={[styles.closeTripButton, { backgroundColor: theme.text }]}
        disabled={purchasedCount === 0}
        onPress={() => setCloseModalVisible(true)}>
        <ThemedText themeColor="background" type="smallBold">
          Cerrar compra {purchasedCount > 0 ? `(${purchasedCount})` : ''}
        </ThemedText>
      </Pressable>

      <Modal visible={closeModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalCard}>
            <ThemedText type="subtitle">¿Cuánto gastaste?</ThemedText>
            <TextInput
              style={[styles.input, styles.totalInput, { color: theme.text, borderColor: theme.backgroundSelected }]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              value={totalInput}
              onChangeText={setTotalInput}
              autoFocus
            />
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
  addRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    backgroundColor: '#3c87f7',
  },
  addButtonLabel: {
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '600',
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Spacing.one,
    borderWidth: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
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
  },
  modalCard: {
    width: '85%',
    borderRadius: Spacing.three,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  totalInput: {
    fontSize: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.four,
    marginTop: Spacing.two,
  },
  modalCancel: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  modalConfirm: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
  },
});
