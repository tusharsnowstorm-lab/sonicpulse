import { StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/Screen';
import { EventHeader } from '@/components/Headers';
import { AppText } from '@/components/AppText';
import { Radar } from '@/components/Radar';
import { nightOwls, FOUND_DISTANCE_METERS } from '@/data/clique';
import { theme } from '@/theme';

export default function WhereUAtScreen() {
  return (
    <Screen>
      <EventHeader back={nightOwls.name} />

      <View style={styles.sharePill}>
        <SymbolView name={{ ios: 'location.fill', android: 'location_on', web: 'location_on' }} tintColor={theme.accent} size={11} />
        <AppText weight="medium" style={styles.sharePillText}>
          Sharing until 09:00
        </AppText>
      </View>

      <Radar members={nightOwls.members} />

      <View style={styles.legend}>
        {nightOwls.members.map((m) => {
          const found = m.distanceMeters <= FOUND_DISTANCE_METERS;
          return (
            <View key={m.name} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: m.color }]} />
              <AppText weight="semiBold" style={styles.legendName}>
                {m.name}
              </AppText>
              {found ? (
                <View style={styles.foundPill}>
                  <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} tintColor={theme.good} size={9} />
                  <AppText weight="medium" style={styles.foundText}>
                    FOUND
                  </AppText>
                </View>
              ) : (
                <AppText weight="regular" style={styles.legendDist}>
                  {m.distanceMeters}m
                </AppText>
              )}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sharePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 100,
    marginBottom: 18,
  },
  sharePillText: { fontSize: 10, color: theme.muted },
  legend: { gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { flex: 1, fontSize: 13 },
  legendDist: { fontSize: 11, color: theme.muted },
  foundPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: theme.good,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 100,
  },
  foundText: { fontSize: 10, color: theme.good },
});
