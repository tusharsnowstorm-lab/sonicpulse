import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { fonts, theme } from '@/theme';

function tabIcon(ios: SFSymbol, android: AndroidSymbol) {
  return ({ color }: { color: ColorValue }) => (
    <SymbolView name={{ ios, android, web: android }} tintColor={color} size={24} />
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        tabBarLabelStyle: { fontFamily: fonts.semiBold, fontSize: 10 },
      }}>
      <Tabs.Screen
        name="events"
        options={{ title: 'Events', tabBarIcon: tabIcon('calendar', 'event') }}
      />
      <Tabs.Screen
        name="cliques"
        options={{ title: 'Cliques', tabBarIcon: tabIcon('person.2.fill', 'group') }}
      />
      <Tabs.Screen
        name="tickets"
        options={{ title: 'Tickets', tabBarIcon: tabIcon('ticket.fill', 'confirmation_number') }}
      />
      <Tabs.Screen
        name="updates"
        options={{ title: 'Updates', tabBarIcon: tabIcon('bell.fill', 'notifications') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person.crop.circle.fill', 'account_circle') }}
      />
    </Tabs>
  );
}
