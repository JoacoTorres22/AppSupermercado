import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: 'center' }}>
      <Tabs.Screen name="index" options={{ title: 'Planificación' }} />
      <Tabs.Screen name="historial" options={{ title: 'Historial' }} />
    </Tabs>
  );
}
