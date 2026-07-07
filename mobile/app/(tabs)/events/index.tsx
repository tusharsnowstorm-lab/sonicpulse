import { Image, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppShellHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { Card, SectionLabel, Button } from '@/components/ui';
import { sonicPulse } from '@/data/event';
import { theme } from '@/theme';

export default function EventsScreen() {
  return (
    <Screen>
      <AppShellHeader />
      <SectionLabel>Upcoming</SectionLabel>
      <Card>
        <View style={styles.top}>
          <Image source={require('@/assets/images/logo-badge.webp')} style={styles.logo} />
          <View style={{ flex: 1 }}>
            <AppText weight="black" style={styles.name}>
              {sonicPulse.name}
            </AppText>
            <AppText weight="regular" style={styles.date}>
              {sonicPulse.dateDisplay} · {sonicPulse.hours}
            </AppText>
          </View>
        </View>
        <AppText weight="regular" style={styles.lineup}>
          {sonicPulse.headliners.map((a) => a.name).join(' · ')}
        </AppText>
        <Button
          label="View Event"
          variant="outline"
          onPress={() => router.push('/(tabs)/events/sonic-pulse')}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  logo: { width: 44, height: 44, borderRadius: 22 },
  name: { fontSize: 15, letterSpacing: 0.3, color: theme.primary },
  date: { fontSize: 11, color: theme.muted, marginTop: 3 },
  lineup: { fontSize: 12, color: theme.muted, marginBottom: 16 },
});
