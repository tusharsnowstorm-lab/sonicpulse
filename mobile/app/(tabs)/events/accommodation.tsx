import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card, SectionLabel, Button } from '@/components/ui';
import { StatusPill } from '@/components/StatusPill';
import { sonicPulse } from '@/data/event';
import { useAppStore, getReservation } from '@/store/AppStore';
import { theme } from '@/theme';

// Accommodation is its own registration, not a ticket add-on — it runs its
// own reserve → approve → pay lifecycle entirely separate from the ticket,
// on this one page whose content just follows the reservation's status.
// Phase 08 of the build guide.
export default function AccommodationScreen() {
  const { reservations, reserveAccommodation, payReservation } = useAppStore();
  const reservation = getReservation(reservations, sonicPulse.id);
  const total = sonicPulse.accommodationPrice;

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
        <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={theme.muted} size={13} />
        <AppText weight="medium" style={styles.backLabel}>
          {sonicPulse.name}
        </AppText>
      </Pressable>

      <View style={styles.header}>
        <AppText weight="black" style={styles.title}>
          Need Accommodation?
        </AppText>
        {reservation.status === 'pending' && <StatusPill label="PENDING" tone="pending" />}
        {reservation.status === 'approved' && <StatusPill label="APPROVED" tone="good" />}
      </View>

      {reservation.status === 'none' && (
        <>
          <SectionLabel>Why reserve</SectionLabel>
          <Card style={{ marginBottom: 18 }}>
            <AppText weight="bold" style={styles.pitchTitle}>
              A place to crash
            </AppText>
            <AppText weight="regular" style={styles.pitchSub}>
              Before or after the 17-hour night.
            </AppText>
          </Card>

          <SectionLabel>Options</SectionLabel>
          <Card style={{ marginBottom: 22, borderColor: theme.accent }}>
            <View style={styles.optionRow}>
              <View style={{ flex: 1 }}>
                <AppText weight="bold" style={styles.optionTitle}>
                  🏨 {sonicPulse.accommodationTier}
                </AppText>
                <AppText weight="regular" style={styles.optionDesc}>
                  Festival night. Limited spots — first come, first served.
                </AppText>
                <View style={styles.placeholderFlag}>
                  <AppText weight="medium" style={styles.placeholderFlagText}>
                    PLACEHOLDER PRICE
                  </AppText>
                </View>
              </View>
              <AppText weight="medium" style={styles.optionPrice}>
                Tk {total.toLocaleString()}
              </AppText>
            </View>
          </Card>

          <Button label="Reserve Accommodation" onPress={() => reserveAccommodation(sonicPulse.id)} />
        </>
      )}

      {reservation.status === 'pending' && (
        <>
          <SectionLabel>Your reservation</SectionLabel>
          <Card style={{ marginBottom: 16 }}>
            <View style={styles.optionRow}>
              <View>
                <AppText weight="bold" style={styles.optionTitle}>
                  🏨 {sonicPulse.accommodationTier}
                </AppText>
                <AppText weight="regular" style={styles.optionDesc}>
                  Festival night
                </AppText>
              </View>
              <AppText weight="medium" style={styles.optionPrice}>
                Tk {total.toLocaleString()}
              </AppText>
            </View>
          </Card>
          <AppText weight="regular" style={styles.sub}>
            We'll confirm availability and notify you. Payment unlocks right here once it's approved — this is
            tracked separately from your ticket.
          </AppText>
        </>
      )}

      {reservation.status === 'approved' && (
        <>
          <SectionLabel>Your accommodation</SectionLabel>
          <Card style={{ marginBottom: 16 }}>
            <View style={styles.optionRow}>
              <View>
                <AppText weight="bold" style={styles.optionTitle}>
                  🏨 {sonicPulse.accommodationTier}
                </AppText>
                <AppText weight="regular" style={styles.optionDesc}>
                  Festival night · confirmed
                </AppText>
              </View>
              <AppText weight="medium" style={styles.optionPrice}>
                Tk {total.toLocaleString()}
              </AppText>
            </View>
          </Card>

          <View style={styles.totalRow}>
            <AppText weight="medium" style={styles.totalLabel}>
              TOTAL
            </AppText>
            <AppText weight="medium" style={styles.totalPrice}>
              Tk {total.toLocaleString()}
            </AppText>
          </View>

          {reservation.paid ? (
            <View style={styles.paidBanner}>
              <SymbolView name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }} tintColor={theme.good} size={14} />
              <AppText weight="medium" style={styles.paidText}>
                Paid in full
              </AppText>
            </View>
          ) : (
            <>
              <Button label="Pay with bKash" style={{ marginBottom: 10 }} onPress={() => payReservation(sonicPulse.id)} />
              <Button label="Pay with Card" variant="dark" onPress={() => payReservation(sonicPulse.id)} />
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 18 },
  backLabel: { fontSize: 12, color: theme.muted },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 19 },
  pitchTitle: { fontSize: 13, marginBottom: 3 },
  pitchSub: { fontSize: 11.5, color: theme.muted },
  optionRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  optionTitle: { fontSize: 13, marginBottom: 4 },
  optionDesc: { fontSize: 11, color: theme.muted, lineHeight: 15 },
  optionPrice: { fontSize: 12.5, color: theme.accent },
  placeholderFlag: {
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FFB648',
    borderRadius: 100,
    paddingVertical: 2,
    paddingHorizontal: 7,
  },
  placeholderFlagText: { fontSize: 8, color: '#FFB648' },
  sub: { fontSize: 12, color: theme.muted, lineHeight: 18 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderTopWidth: 1,
    borderTopColor: theme.border,
    borderStyle: 'dashed',
    paddingVertical: 12,
    marginBottom: 16,
  },
  totalLabel: { fontSize: 10, color: theme.muted, letterSpacing: 0.6 },
  totalPrice: { fontSize: 17, color: theme.primary },
  paidBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.good,
    borderRadius: 10,
    paddingVertical: 12,
  },
  paidText: { fontSize: 12, color: theme.good },
});
