import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deleteTrip, getTrips } from '@/lib/api';
import { ShoppingTrip } from '@/types';

const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' });

export default function HistorialScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const tripsQuery = useQuery({ queryKey: ['trips'], queryFn: getTrips });
  const trips = tripsQuery.data ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });

  const confirmDelete = (trip: ShoppingTrip) => {
    Alert.alert(
      'Eliminar compra',
      `¿Seguro que querés borrar la compra del ${dateFormatter.format(new Date(trip.date))}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(trip._id),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={trips}
        keyExtractor={(trip) => trip._id}
        contentContainerStyle={styles.listContent}
        refreshing={tripsQuery.isFetching}
        onRefresh={() => tripsQuery.refetch()}
        ListEmptyComponent={
          !tripsQuery.isLoading ? (
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              Todavía no cerraste ninguna compra.
            </ThemedText>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.tripCard, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.tripHeader}>
              <View style={styles.tripHeaderLeft}>
                <Ionicons name="receipt-outline" size={20} color={theme.text} />
                <ThemedText type="smallBold">{dateFormatter.format(new Date(item.date))}</ThemedText>
              </View>
              <View style={styles.tripHeaderRight}>
                <ThemedText type="smallBold">{currencyFormatter.format(item.total)}</ThemedText>
                <Pressable hitSlop={8} onPress={() => confirmDelete(item)}>
                  <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
                </Pressable>
              </View>
            </View>
            <ThemedText themeColor="textSecondary" type="small">
              {item.items.length} {item.items.length === 1 ? 'ítem' : 'ítems'}
              {item.items.length > 0
                ? `: ${item.items.map((i) => `${i.name} x${i.quantity}`).join(', ')}`
                : ''}
            </ThemedText>
          </View>
        )}
      />
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
  tripCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.one,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tripHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
});
