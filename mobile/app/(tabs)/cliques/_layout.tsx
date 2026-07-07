import { Stack } from 'expo-router';

export default function CliquesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="new" />
      <Stack.Screen name="invite" />
      <Stack.Screen name="wya" />
    </Stack>
  );
}
