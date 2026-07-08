import { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card, SectionLabel, Button } from '@/components/ui';
import { sonicPulse } from '@/data/event';
import { useAppStore } from '@/store/AppStore';
import { theme } from '@/theme';

// Sign-up already happened at first launch (Phase 05 onboarding) — every
// mandatory field the site's registration form asks for is already on file,
// so this screen is just a summary and one tap, not another form.
export default function RegisterScreen() {
  const { profile, registerForEvent } = useAppStore();
  const [confirmed, setConfirmed] = useState(false);

  function confirm() {
    registerForEvent(sonicPulse.id);
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <Screen>
        <View style={styles.confirmWrap}>
          <View style={styles.confirmIcon}>
            <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.void} size={24} />
          </View>
          <AppText weight="black" style={styles.confirmTitle}>
            Registration submitted
          </AppText>
          <AppText weight="regular" style={styles.confirmSub}>
            We'll notify you once it's reviewed — usually within 24 hours.
          </AppText>
          <Button label="Done" style={{ marginTop: 22, width: '100%' }} onPress={() => router.push('/(tabs)/events')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
        <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={theme.muted} size={13} />
        <AppText weight="medium" style={styles.backLabel}>
          {sonicPulse.name}
        </AppText>
      </Pressable>

      <AppText weight="black" style={styles.title}>
        Confirm your registration
      </AppText>
      <AppText weight="regular" style={styles.sub}>
        Everything below comes from your profile — nothing new to fill in.
      </AppText>

      <SectionLabel>Attendee</SectionLabel>
      <Card style={{ marginBottom: 18 }}>
        <View style={styles.attendeeRow}>
          {profile.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
          <View>
            <AppText weight="bold" style={styles.attendeeName}>
              {profile.fullName}
            </AppText>
            <AppText weight="regular" style={styles.attendeeHandle}>
              @{profile.instagramHandle}
            </AppText>
          </View>
        </View>
      </Card>

      <SectionLabel>Ticket</SectionLabel>
      <Card style={{ marginBottom: 24 }}>
        <View style={styles.ticketRow}>
          <View>
            <AppText weight="bold" style={styles.ticketTier}>
              {sonicPulse.ticketTier}
            </AppText>
            <AppText weight="regular" style={styles.ticketSub}>
              General admission
            </AppText>
          </View>
          <AppText weight="medium" style={styles.ticketPrice}>
            Tk {sonicPulse.ticketPrice.toLocaleString()}
          </AppText>
        </View>
      </Card>

      <Button label="Confirm Registration" onPress={confirm} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 18 },
  backLabel: { fontSize: 12, color: theme.muted },
  title: { fontSize: 20, marginBottom: 6 },
  sub: { fontSize: 12.5, color: theme.muted, marginBottom: 22, lineHeight: 18 },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: theme.border },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.accent },
  attendeeName: { fontSize: 14 },
  attendeeHandle: { fontSize: 11, color: theme.muted, marginTop: 2 },
  ticketRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ticketTier: { fontSize: 13 },
  ticketSub: { fontSize: 10.5, color: theme.muted, marginTop: 2 },
  ticketPrice: { fontSize: 13, color: theme.primary },
  confirmWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  confirmIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.good,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmTitle: { fontSize: 17, marginBottom: 8, textAlign: 'center' },
  confirmSub: { fontSize: 12.5, color: theme.muted, textAlign: 'center', lineHeight: 18 },
});
