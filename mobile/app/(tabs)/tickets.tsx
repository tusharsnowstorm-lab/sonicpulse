import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/Screen';
import { AppShellHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { Card, SectionLabel, Button } from '@/components/ui';
import { QrPlaceholder } from '@/components/QrPlaceholder';
import { theme } from '@/theme';

const TICKET = {
  holder: 'TANVIR AHMED',
  tier: 'PHASE 1 — EARLY BIRD',
  reference: 'SP-4F82A1C9',
  status: 'CONFIRMED',
};

export default function TicketsScreen() {
  return (
    <Screen>
      <AppShellHeader />
      <SectionLabel>Your Ticket</SectionLabel>
      <Card>
        <View style={styles.top}>
          <AppText weight="black" style={styles.brand}>
            SONICPULSE
          </AppText>
          <View style={styles.statusPill}>
            <AppText weight="medium" style={styles.statusText}>
              {TICKET.status}
            </AppText>
          </View>
        </View>
        <AppText weight="bold" style={styles.holder}>
          {TICKET.holder}
        </AppText>
        <AppText weight="regular" style={styles.tier}>
          {TICKET.tier}
        </AppText>
        <View style={styles.qrWrap}>
          <QrPlaceholder />
        </View>
        <AppText weight="regular" style={styles.reference}>
          {TICKET.reference}
        </AppText>
      </Card>
      <Button
        label="Add to Wallet"
        variant="dark"
        style={{ marginTop: 14, flexDirection: 'row', gap: 8 }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  brand: { fontSize: 12, letterSpacing: 0.4 },
  statusPill: { borderWidth: 1, borderColor: theme.good, borderRadius: 100, paddingVertical: 3, paddingHorizontal: 8 },
  statusText: { fontSize: 9, color: theme.good, letterSpacing: 0.4 },
  holder: { fontSize: 15 },
  tier: { fontSize: 11, color: theme.muted, marginBottom: 16 },
  qrWrap: { alignSelf: 'center', borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  reference: { fontSize: 11, color: theme.muted, textAlign: 'center', letterSpacing: 0.5 },
});
