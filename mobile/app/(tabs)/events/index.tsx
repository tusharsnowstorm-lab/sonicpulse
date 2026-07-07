import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppShellHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { SectionLabel, Button } from '@/components/ui';
import { StatusPill } from '@/components/StatusPill';
import { ImageCarousel } from '@/components/ImageCarousel';
import { sonicPulse } from '@/data/event';
import { useAppStore, getRegistration } from '@/store/AppStore';
import { theme } from '@/theme';

export default function EventsScreen() {
  const { width } = useWindowDimensions();
  const { registrations } = useAppStore();
  const registration = getRegistration(registrations, sonicPulse.id);
  const cardSize = width - 40; // Screen's horizontal padding is 20 on each side

  return (
    <Screen>
      <AppShellHeader />
      <SectionLabel>Upcoming</SectionLabel>

      <View style={styles.card}>
        <Pressable onPress={() => router.push('/(tabs)/events/sonic-pulse')}>
          <ImageCarousel images={sonicPulse.heroImages} size={cardSize} />
          <View style={styles.captionRow}>
            <AppText weight="medium" style={styles.caption}>
              {sonicPulse.dateDisplay} · {sonicPulse.location}
            </AppText>
          </View>
        </Pressable>

        {registration.status === 'pending' && (
          <View style={styles.statusRow}>
            <View>
              <AppText weight="bold" style={styles.statusTitle}>
                Registration submitted
              </AppText>
              <AppText weight="regular" style={styles.statusSub}>
                We'll notify you once it's reviewed
              </AppText>
            </View>
            <StatusPill label="PENDING" tone="pending" />
          </View>
        )}

        {registration.status === 'approved' && (
          <>
            <View style={styles.statusRow}>
              <View>
                <AppText weight="bold" style={styles.statusTitle}>
                  Registration approved
                </AppText>
                <AppText weight="regular" style={styles.statusSub}>
                  {registration.paid ? 'Ticket confirmed' : 'Ticket · ready to pay'}
                </AppText>
              </View>
              <StatusPill label="APPROVED" tone="good" />
            </View>
            {sonicPulse.offersAccommodation && (
              <Button
                label="Need Accommodation?"
                variant="outline"
                style={{ marginTop: 4 }}
                onPress={() => router.push('/(tabs)/events/accommodation')}
              />
            )}
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    padding: 10,
    gap: 10,
  },
  captionRow: { paddingTop: 10, paddingHorizontal: 2 },
  caption: { fontSize: 11, color: theme.muted },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingHorizontal: 2,
  },
  statusTitle: { fontSize: 12.5, color: theme.primary },
  statusSub: { fontSize: 10.5, color: theme.muted, marginTop: 2 },
});
