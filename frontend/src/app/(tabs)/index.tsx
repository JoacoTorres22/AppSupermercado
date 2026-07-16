import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { createItem, getItems, updateItem } from '@/lib/api';
import { Item } from '@/types';

export default function PlanificacionScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [newItemName, setNewItemName] = useState('');

  const itemsQuery = useQuery({ queryKey: ['items'], queryFn: getItems });

  const quantityMutation = useMutation({
    mutationFn: ({ item, quantity }: { item: Item; quantity: number }) =>
      updateItem(item._id, { quantity }),
    onMutate: async ({ item, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previous = queryClient.getQueryData<Item[]>(['items']);
      queryClient.setQueryData<Item[]>(['items'], (old) =>
        old?.map((i) => (i._id === item._id ? { ...i, quantity } : i))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
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

  const items = itemsQuery.data ?? [];
  const selectedCount = items.filter((i) => i.quantity > 0).length;

  const adjustQuantity = (item: Item, delta: number) => {
    const quantity = Math.max(0, item.quantity + delta);
    quantityMutation.mutate({ item, quantity });
  };

  const handleAddItem = () => {
    const name = newItemName.trim();
    if (!name) return;
    addMutation.mutate(name);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.addRow}>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          placeholder="Agregar producto..."
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
              No hay productos todavía. Agregá el primero arriba.
            </ThemedText>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.itemRow, { backgroundColor: theme.backgroundElement }]}>
            <Ionicons name="cube-outline" size={20} color={theme.textSecondary} />
            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
            <View style={styles.stepper}>
              <Pressable
                style={[styles.stepperButton, { borderColor: theme.backgroundSelected }]}
                disabled={item.quantity === 0}
                onPress={() => adjustQuantity(item, -1)}>
                <Ionicons
                  name="remove"
                  size={18}
                  color={item.quantity === 0 ? theme.textSecondary : theme.text}
                />
              </Pressable>
              <ThemedText style={styles.stepperValue}>{item.quantity}</ThemedText>
              <Pressable
                style={[styles.stepperButton, { borderColor: theme.backgroundSelected }]}
                onPress={() => adjustQuantity(item, 1)}>
                <Ionicons name="add" size={18} color={theme.text} />
              </Pressable>
            </View>
          </View>
        )}
      />

      <Pressable
        style={[
          styles.createListButton,
          { backgroundColor: selectedCount > 0 ? theme.text : theme.backgroundSelected },
        ]}
        disabled={selectedCount === 0}
        onPress={() => router.push('/modo-supermercado')}>
        <ThemedText themeColor="background" type="smallBold">
          Crear lista de compra {selectedCount > 0 ? `(${selectedCount})` : ''}
        </ThemedText>
      </Pressable>
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
  itemName: {
    flex: 1,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: Spacing.one,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  createListButton: {
    margin: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
});
