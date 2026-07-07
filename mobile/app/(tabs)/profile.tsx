import { StyleSheet, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { AppShellHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { theme } from '@/theme';

const PROFILE = {
  name: 'Tanvir Ahmed',
  handle: '@tanvir.ahmed',
  rows: [
    { label: 'Phone', value: '+880 1••••••12' },
    { label: 'ID Type', value: 'NID' },
    { label: 'Gender', value: 'Male' },
  ],
};

export default function ProfileScreen() {
  return (
    <Screen>
      <AppShellHeader />
      <View style={styles.center}>
        <View style={styles.avatar} />
        <AppText weight="bold" style={styles.name}>
          {PROFILE.name}
        </AppText>
        <AppText weight="regular" style={styles.handle}>
          {PROFILE.handle}
        </AppText>
      </View>
      <View style={styles.rows}>
        {PROFILE.rows.map((row, i) => (
          <View key={row.label} style={[styles.row, i === PROFILE.rows.length - 1 && { borderBottomWidth: 0 }]}>
            <AppText weight="medium" style={styles.label}>
              {row.label.toUpperCase()}
            </AppText>
            <AppText weight="semiBold" style={styles.value}>
              {row.value}
            </AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.accent,
    marginBottom: 12,
  },
  name: { fontSize: 15 },
  handle: { fontSize: 11, color: theme.muted, marginTop: 2 },
  rows: {},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  label: { fontSize: 10, color: theme.mutedDim, letterSpacing: 0.5 },
  value: { fontSize: 12 },
});
