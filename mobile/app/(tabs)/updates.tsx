import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppShellHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { SectionLabel } from '@/components/ui';
import { theme } from '@/theme';

const UPDATES = [
  { title: 'Phase 2 tickets now on sale', time: '2h ago' },
  { title: 'Drip confirmed for the main stage', time: '1d ago' },
  { title: 'Gates open 16:30 — arrive early', time: '3d ago' },
];

export default function UpdatesScreen() {
  return (
    <Screen>
      <AppShellHeader />
      <SectionLabel>Sonic Pulse · Updates</SectionLabel>
      {UPDATES.map((u, i) => (
        <View key={u.title} style={[styles.row, i === UPDATES.length - 1 && { borderBottomWidth: 0 }]}>
          <View style={styles.dot} />
          <View style={{ flex: 1 }}>
            <AppText weight="semiBold" style={styles.title}>
              {u.title}
            </AppText>
            <AppText weight="regular" style={styles.time}>
              {u.time}
            </AppText>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: theme.accent, marginTop: 5 },
  title: { fontSize: 13 },
  time: { fontSize: 10, color: theme.mutedDim, marginTop: 3 },
});
