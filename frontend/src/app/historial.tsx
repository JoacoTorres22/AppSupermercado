import { useQuery } from '@tanstack/react-query';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getTrips } from '@/lib/api';

const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' });

export default function HistorialScreen() {
  const theme = useTheme();
  const tripsQuery = useQuery({ queryKey: ['trips'], queryFn: getTrips });
  const trips = tripsQuery.data ?? [];

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
              <ThemedText type="smallBold">{dateFormatter.format(new Date(item.date))}</ThemedText>
              <ThemedText type="smallBold">{currencyFormatter.format(item.total)}</ThemedText>
            </View>
            <ThemedText themeColor="textSecondary" type="small">
              {item.items.length} {item.items.length === 1 ? 'ítem' : 'ítems'}
              {item.items.length > 0 ? `: ${item.items.join(', ')}` : ''}
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
  },
});
