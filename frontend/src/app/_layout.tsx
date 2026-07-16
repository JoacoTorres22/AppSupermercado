import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

// Sin refetch automático: el usuario actualiza tirando de la lista hacia
// abajo (pull-to-refresh) en cada pantalla cuando quiere ver cambios nuevos.
const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modo-supermercado" options={{ title: 'Modo Supermercado' }} />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
