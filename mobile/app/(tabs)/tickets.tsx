import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/Screen';
import { AppShellHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { Card, SectionLabel, Button } from '@/components/ui';
import { StatusPill } from '@/components/StatusPill';
import { QrPlaceholder } from '@/components/QrPlaceholder';
import { sonicPulse } from '@/data/event';
import { useAppStore, getRegistration, getReservation } from '@/store/AppStore';
import { theme } from '@/theme';

const REFERENCE_CODE = 'SP-4F82A1C9';

export default function TicketsScreen() {
  const { profile, registrations, reservations, toggleShuttle, payTicket } = useAppStore();
  const registration = getRegistration(registrations, sonicPulse.id);
  const reservation = getReservation(reservations, sonicPulse.id);

  const shuttleTotal = registration.shuttle ? sonicPulse.shuttlePrice : 0;
  const ticketTotal = sonicPulse.ticketPrice + shuttleTotal;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <AppShellHeader />

        {registration.status === 'none' && (
          <>
            <SectionLabel>Your Ticket</SectionLabel>
            <Card>
              <AppText weight="medium" style={styles.emptyText}>
                You haven't registered for Sonic Pulse yet.
              </AppText>
              <Button label="View Event" variant="outline" style={{ marginTop: 14 }} onPress={() => router.push('/(tabs)/events/sonic-pulse')} />
            </Card>
          </>
        )}

        {registration.status === 'pending' && (
          <>
            <SectionLabel>Your Ticket</SectionLabel>
            <Card>
              <View style={styles.pendingRow}>
                <View>
                  <AppText weight="bold" style={styles.pendingTitle}>
                    Registration submitted
                  </AppText>
                  <AppText weight="regular" style={styles.pendingSub}>
                    We'll notify you once it's reviewed
                  </AppText>
                </View>
                <StatusPill label="PENDING" tone="pending" />
              </View>
            </Card>
          </>
        )}

        {registration.status === 'approved' && !registration.paid && (
          <>
            <SectionLabel>Your Ticket</SectionLabel>
            <Card style={{ marginBottom: 12 }}>
              <View style={styles.lineRow}>
                <View>
                  <AppText weight="bold" style={styles.lineName}>
                    {sonicPulse.ticketTier}
                  </AppText>
                  <AppText weight="regular" style={styles.lineSub}>
                    General admission
                  </AppText>
                </View>
                <AppText weight="medium" style={styles.linePrice}>
                  Tk {sonicPulse.ticketPrice.toLocaleString()}
                </AppText>
              </View>
            </Card>

            <SectionLabel>Add-ons</SectionLabel>
            <Card
              style={[
                { marginBottom: 18 },
                registration.shuttle && { borderColor: theme.accent, backgroundColor: theme.magentaSoft },
              ]}>
              <Pressable style={styles.addonRow} onPress={() => toggleShuttle(sonicPulse.id)}>
                <View style={[styles.checkbox, registration.shuttle && styles.checkboxOn]}>
                  {registration.shuttle && (
                    <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.void} size={9} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.addonTopRow}>
                    <AppText weight="bold" style={styles.addonTitle}>
                      🚌 Shuttle transport
                    </AppText>
                    <AppText weight="medium" style={styles.addonPrice}>
                      +Tk {sonicPulse.shuttlePrice.toLocaleString()}
                    </AppText>
                  </View>
                  <AppText weight="regular" style={styles.addonDesc}>
                    Round-trip to and from the venue. Pickup point & schedule emailed closer to the event.
                  </AppText>
                </View>
              </Pressable>
            </Card>

            <View style={styles.totalRow}>
              <AppText weight="medium" style={styles.totalLabel}>
                TOTAL
              </AppText>
              <AppText weight="medium" style={styles.totalPrice}>
                Tk {ticketTotal.toLocaleString()}
              </AppText>
            </View>

            <Button label="Pay with bKash" style={{ marginBottom: 10 }} onPress={() => payTicket(sonicPulse.id)} />
            <Button label="Pay with Card" variant="dark" onPress={() => payTicket(sonicPulse.id)} />
          </>
        )}

        {registration.status === 'approved' && registration.paid && (
          <>
            <SectionLabel>Your Ticket</SectionLabel>
            <Card>
              <View style={styles.top}>
                <AppText weight="black" style={styles.brand}>
                  SONICPULSE
                </AppText>
                <View style={styles.statusPill}>
                  <AppText weight="medium" style={styles.statusText}>
                    CONFIRMED
                  </AppText>
                </View>
              </View>
              <AppText weight="bold" style={styles.holder}>
                {profile.fullName.toUpperCase() || 'GUEST'}
              </AppText>
              <AppText weight="regular" style={styles.tier}>
                {sonicPulse.ticketTier.toUpperCase()}
                {registration.shuttle ? ' · SHUTTLE ADDED' : ''}
              </AppText>
              <View style={styles.qrWrap}>
                <QrPlaceholder />
              </View>
              <AppText weight="regular" style={styles.reference}>
                {REFERENCE_CODE}
              </AppText>
            </Card>
            <Button label="Add to Wallet" variant="dark" style={{ marginTop: 14, flexDirection: 'row', gap: 8 }} />
          </>
        )}

        {reservation.status !== 'none' && (
          <>
            <View style={{ height: 24 }} />
            <SectionLabel>Your Reservations</SectionLabel>
            <Pressable onPress={() => router.push('/(tabs)/events/accommodation')}>
              <Card style={styles.resCard}>
                <View style={styles.resIcon}>
                  <AppText weight="bold" style={styles.resIconText}>
                    🏨
                  </AppText>
                </View>
                <View style={{ flex: 1 }}>
                  <AppText weight="bold" style={styles.resTitle}>
                    {sonicPulse.name}
                  </AppText>
                  <AppText weight="regular" style={styles.resSub}>
                    {sonicPulse.accommodationTier} · Tk {sonicPulse.accommodationPrice.toLocaleString()}
                  </AppText>
                </View>
                <StatusPill
                  label={reservation.paid ? 'PAID' : reservation.status === 'pending' ? 'PENDING' : 'APPROVED'}
                  tone={reservation.paid || reservation.status === 'approved' ? 'good' : 'pending'}
                />
              </Card>
            </Pressable>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyText: { fontSize: 12.5, color: theme.muted, lineHeight: 18 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pendingTitle: { fontSize: 13 },
  pendingSub: { fontSize: 11, color: theme.muted, marginTop: 3 },

  lineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lineName: { fontSize: 13 },
  lineSub: { fontSize: 11, color: theme.muted, marginTop: 2 },
  linePrice: { fontSize: 13, color: theme.primary },

  addonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: { backgroundColor: theme.accent, borderColor: theme.accent },
  addonTopRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  addonTitle: { fontSize: 12 },
  addonPrice: { fontSize: 11.5, color: theme.accent },
  addonDesc: { fontSize: 10.5, color: theme.muted, marginTop: 3, lineHeight: 15 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    borderStyle: 'dashed',
    paddingVertical: 12,
    marginBottom: 14,
  },
  totalLabel: { fontSize: 10, color: theme.muted, letterSpacing: 0.6 },
  totalPrice: { fontSize: 17, color: theme.primary },

  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  brand: { fontSize: 12, letterSpacing: 0.4 },
  statusPill: { borderWidth: 1, borderColor: theme.good, borderRadius: 100, paddingVertical: 3, paddingHorizontal: 8 },
  statusText: { fontSize: 9, color: theme.good, letterSpacing: 0.4 },
  holder: { fontSize: 15 },
  tier: { fontSize: 11, color: theme.muted, marginBottom: 16 },
  qrWrap: { alignSelf: 'center', borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  reference: { fontSize: 11, color: theme.muted, textAlign: 'center', letterSpacing: 0.5 },

  resCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.magentaSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resIconText: { fontSize: 15 },
  resTitle: { fontSize: 12.5 },
  resSub: { fontSize: 10.5, color: theme.muted, marginTop: 2 },
});
