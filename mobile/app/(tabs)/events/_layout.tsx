import { Stack } from 'expo-router';

export default function EventsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="sonic-pulse" />
      <Stack.Screen name="register" />
      <Stack.Screen name="accommodation" />
    </Stack>
  );
}
