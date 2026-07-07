import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { AppText } from '@/components/AppText';
import { fonts, theme } from '@/theme';

// App-level chrome — belongs to "Dhaka Music Festival", the container.
// Used on every tab except the event's own page.
export function AppShellHeader() {
  return (
    <View style={styles.shellRow}>
      <View style={styles.dot} />
      <AppText weight="black" style={styles.shellWordmark}>
        DHAKA MUSIC FESTIVAL
      </AppText>
    </View>
  );
}

// Event-level chrome — belongs to Sonic Pulse specifically. Only appears
// once someone has tapped into the event itself.
export function EventHeader({ back }: { back?: string }) {
  return (
    <View>
      {back ? (
        <Pressable onPress={() => router.back()} style={styles.backRow} hitSlop={8}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} tintColor={theme.muted} size={13} />
          <AppText weight="medium" style={styles.backLabel}>
            {back}
          </AppText>
        </Pressable>
      ) : null}
      <View style={styles.eventRow}>
        <Image source={require('@/assets/images/logo-badge.webp')} style={styles.eventLogo} />
        <AppText weight="black" style={styles.eventWordmark}>
          SONICPULSE
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shellRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent },
  shellWordmark: { fontSize: 13, letterSpacing: 0.5 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 14 },
  backLabel: { fontFamily: fonts.medium, fontSize: 12, color: theme.muted },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  eventLogo: { width: 28, height: 28, borderRadius: 14 },
  eventWordmark: { fontSize: 16, letterSpacing: 0.3 },
});
